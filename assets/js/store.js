/* store.js — localStorage-backed application state.
   Everything lives in the browser; nothing is sent to any server. */
(function () {
  const KEY = "mcatPrep.v1";

  const DEFAULTS = {
    settings: {
      testDate: "",          // ISO yyyy-mm-dd
      startDate: "",         // ISO yyyy-mm-dd (defaults to today on first run)
      targetScore: 515,
      hoursPerWeekday: 4,
      hoursPerWeekend: 6,
      restDay: 0,            // 0=Sunday ... 6=Saturday; -1 = no fixed rest day
      name: ""
    },
    // dayLog[isoDate] = { tasks: { taskId: true }, studied: true, minutes: 0, note: "" }
    dayLog: {},
    // srs[cardId] = { ease, interval, reps, due (iso), lastReviewed (iso), lapses }
    srs: {},
    // customCards = [{ id, front, back, section, topic }]
    customCards: [],
    // application checklist state: appState[itemId] = { done, value, note }
    appState: {},
    // hours/metrics for med school app (clinical, shadowing, research, volunteering)
    experiences: {
      clinical: 0, shadowing: 0, research: 0, volunteering: 0, nonClinicalVolunteering: 0, leadership: 0
    },
    // user-added resources per section: resources[section] = [{title,url,channel}]
    userResources: {},
    // practice exam scores: [{date, name, total, cp, cars, bb, ps}]
    examScores: [],
    // CARS timer sessions: [{date, totalSeconds, passages:[{seconds, correct, total}]}]
    carsSessions: [],
    // journal entries: [{id, date, minutes, mood, confidence:{cp,cars,bb,ps}, text}]
    journal: [],
    meta: { createdAt: null, version: 1 }
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

  let state;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? deepMerge(JSON.parse(raw), DEFAULTS) : JSON.parse(JSON.stringify(DEFAULTS));
    } catch (e) {
      state = JSON.parse(JSON.stringify(DEFAULTS));
    }
    if (!state.meta.createdAt) state.meta.createdAt = new Date().toISOString();
    if (!state.settings.startDate) state.settings.startDate = Store.todayISO();
    return state;
  }

  const listeners = [];

  const Store = {
    todayISO() {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 10);
    },
    get() { return state; },
    settings() { return state.settings; },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
      listeners.forEach((fn) => fn(state));
    },
    subscribe(fn) { listeners.push(fn); },
    update(mutator) { mutator(state); this.save(); },

    /* ---- Day log helpers ---- */
    day(iso) {
      if (!state.dayLog[iso]) state.dayLog[iso] = { tasks: {}, studied: false, minutes: 0, note: "" };
      return state.dayLog[iso];
    },
    toggleTask(iso, taskId, allTaskIds) {
      const d = this.day(iso);
      d.tasks[taskId] = !d.tasks[taskId];
      // mark studied if any task completed
      d.studied = Object.values(d.tasks).some(Boolean);
      this.save();
    },
    isTaskDone(iso, taskId) {
      const d = state.dayLog[iso];
      return !!(d && d.tasks && d.tasks[taskId]);
    },
    dayCompletion(iso, totalTasks) {
      const d = state.dayLog[iso];
      if (!d || !totalTasks) return 0;
      const done = Object.values(d.tasks).filter(Boolean).length;
      return Math.min(1, done / totalTasks);
    },

    /* ---- Streak ---- */
    streak() {
      let count = 0;
      const d = new Date();
      // walk backwards from today while studied
      for (let i = 0; i < 400; i++) {
        const iso = isoOffset(d, -i);
        const log = state.dayLog[iso];
        if (log && log.studied) count++;
        else if (i === 0) continue; // today not done yet doesn't break streak
        else break;
      }
      return count;
    },

    /* ---- Reset ---- */
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

  function isoOffset(base, days) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  Store.isoOffset = isoOffset;

  load();
  window.Store = Store;
})();
