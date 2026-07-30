/* store.js — localStorage-backed data model for the Habit & Sleep Tracker.
   Everything lives in the browser; nothing is sent to any server. */
(function () {
  const KEY = "habitTracker.v1";

  const DEFAULTS = {
    settings: {
      sleepTargetHours: 8
    },
    // tasks: [{ id, title, type: 'daily'|'weekly', date (iso, daily only),
    //           weekStart (iso monday, weekly only), minutes, completed, createdAt }]
    tasks: [],
    // sleep: [{ id, date, bedtime: "HH:MM", wakeTime: "HH:MM", hours, quality (1-5) }]
    sleep: [],
    meta: { createdAt: null }
  };

  function deepMerge(target, src) {
    const out = Array.isArray(target) ? target.slice() : Object.assign({}, target);
    for (const k in src) {
      if (src[k] && typeof src[k] === "object" && !Array.isArray(src[k]) &&
          out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
        out[k] = deepMerge(out[k], src[k]);
      } else if (!(k in out)) {
        out[k] = src[k];
      }
    }
    return out;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  let state;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? deepMerge(JSON.parse(raw), DEFAULTS) : JSON.parse(JSON.stringify(DEFAULTS));
    } catch (e) {
      state = JSON.parse(JSON.stringify(DEFAULTS));
    }
    if (!state.meta.createdAt) state.meta.createdAt = new Date().toISOString();
    return state;
  }

  const listeners = [];

  function isoOffset(iso, days) {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // Monday-start ISO week key, e.g. "2026-07-27"
  function weekStartISO(iso) {
    const d = new Date(iso + "T00:00:00");
    const dow = d.getDay(); // 0=Sun..6=Sat
    const offset = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  function timeToMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  const Store = {
    todayISO() {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 10);
    },
    isoOffset,
    weekStartISO,

    get() { return state; },
    settings() { return state.settings; },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
      listeners.forEach((fn) => fn(state));
    },
    subscribe(fn) { listeners.push(fn); },

    /* ---- Tasks (daily goals + weekly goals) ---- */
    addTask({ title, type, date, weekStart, estMinutes }) {
      const task = {
        id: uid(),
        title: title.trim(),
        type, // 'daily' | 'weekly'
        date: type === "daily" ? date : null,
        weekStart: type === "weekly" ? weekStart : null,
        estMinutes: estMinutes || 0,
        minutes: 0,
        completed: false,
        createdAt: new Date().toISOString()
      };
      state.tasks.push(task);
      this.save();
      return task;
    },
    deleteTask(id) {
      state.tasks = state.tasks.filter((t) => t.id !== id);
      this.save();
    },
    toggleTaskComplete(id) {
      const t = state.tasks.find((x) => x.id === id);
      if (t) { t.completed = !t.completed; this.save(); }
    },
    setTaskMinutes(id, minutes) {
      const t = state.tasks.find((x) => x.id === id);
      if (t) { t.minutes = Math.max(0, minutes); this.save(); }
    },
    addTaskMinutes(id, deltaMinutes) {
      const t = state.tasks.find((x) => x.id === id);
      if (t) { t.minutes = Math.max(0, Math.round((t.minutes + deltaMinutes) * 10) / 10); this.save(); }
    },
    tasksForDate(iso) {
      return state.tasks.filter((t) => t.type === "daily" && t.date === iso)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    tasksForWeek(weekStart) {
      return state.tasks.filter((t) => t.type === "weekly" && t.weekStart === weekStart)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    dailyTasksInRange(startIso, endIso) {
      return state.tasks.filter((t) => t.type === "daily" && t.date >= startIso && t.date <= endIso);
    },

    /* ---- Sleep ---- */
    addSleep({ date, bedtime, wakeTime, quality }) {
      let start = timeToMinutes(bedtime);
      let end = timeToMinutes(wakeTime);
      if (end <= start) end += 24 * 60;
      const hours = Math.round(((end - start) / 60) * 10) / 10;
      const entry = { id: uid(), date, bedtime, wakeTime, hours, quality: Number(quality) || 3 };
      // one entry per date: replace if exists
      state.sleep = state.sleep.filter((s) => s.date !== date);
      state.sleep.push(entry);
      state.sleep.sort((a, b) => a.date.localeCompare(b.date));
      this.save();
      return entry;
    },
    deleteSleep(id) {
      state.sleep = state.sleep.filter((s) => s.id !== id);
      this.save();
    },
    sleepForDate(iso) {
      return state.sleep.find((s) => s.date === iso) || null;
    },
    sleepInRange(startIso, endIso) {
      return state.sleep.filter((s) => s.date >= startIso && s.date <= endIso)
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    /* ---- Settings ---- */
    setSleepTarget(hours) {
      state.settings.sleepTargetHours = Math.max(1, Number(hours) || 8);
      this.save();
    },

    /* ---- Streak: consecutive days ending today with >=1 completed daily task ---- */
    streak() {
      let count = 0;
      const today = this.todayISO();
      for (let i = 0; i < 400; i++) {
        const iso = isoOffset(today, -i);
        const done = state.tasks.some((t) => t.type === "daily" && t.date === iso && t.completed);
        if (done) count++;
        else if (i === 0) continue; // today not done yet doesn't break streak
        else break;
      }
      return count;
    },

    /* ---- Reset / import / export ---- */
    resetAll() {
      localStorage.removeItem(KEY);
      load();
      this.save();
    },
    export() { return JSON.stringify(state, null, 2); },
    import(json) {
      const parsed = JSON.parse(json);
      state = deepMerge(parsed, DEFAULTS);
      this.save();
    }
  };

  load();
  window.Store = Store;
})();
