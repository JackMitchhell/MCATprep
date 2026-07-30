/* track.js — Track page: daily goals, weekly goals, time tracking, sleep log. */
(function () {
  const dayLabelEl = document.getElementById("dayLabel");
  const weekLabelEl = document.getElementById("weekLabel");
  const dailyListEl = document.getElementById("dailyList");
  const weeklyListEl = document.getElementById("weeklyList");
  const streakCountEl = document.getElementById("streakCount");
  const sleepBodyEl = document.getElementById("sleepBody");
  const sleepEmptyEl = document.getElementById("sleepEmpty");

  let currentDay = Store.todayISO();
  let currentWeekStart = Store.weekStartISO(Store.todayISO());
  const runningTimers = {}; // taskId -> { startedAt, tick }

  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function fmtDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return `${MON[m - 1]} ${d}`;
  }
  function fmtDayLabel(iso) {
    const today = Store.todayISO();
    const [y, m, d] = iso.split("-").map(Number);
    const dow = new Date(iso + "T00:00:00").getDay();
    const prefix = iso === today ? "Today — " : "";
    return `${prefix}${DOW[dow]}, ${fmtDate(iso)}`;
  }
  function fmtWeekLabel(weekStart) {
    const end = Store.isoOffset(weekStart, 6);
    return `${fmtDate(weekStart)} – ${fmtDate(end)}`;
  }

  function taskRow(task) {
    const row = document.createElement("div");
    row.className = "task-row" + (task.completed ? " done" : "");
    row.dataset.id = task.id;

    const check = document.createElement("button");
    check.className = "check" + (task.completed ? " checked" : "");
    check.type = "button";
    check.textContent = task.completed ? "✓" : "";
    check.setAttribute("aria-label", "Toggle complete");
    check.onclick = () => { Store.toggleTaskComplete(task.id); renderAll(); };
    row.appendChild(check);

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.title + (task.estMinutes ? ` (~${task.estMinutes}m)` : "");
    row.appendChild(title);

    const elapsed = document.createElement("span");
    elapsed.className = "small faint";
    elapsed.id = `timer-${task.id}`;
    row.appendChild(elapsed);

    const timerBtn = document.createElement("button");
    timerBtn.type = "button";
    timerBtn.className = "timer-btn" + (runningTimers[task.id] ? " running" : "");
    timerBtn.textContent = runningTimers[task.id] ? "⏸" : "▶";
    timerBtn.title = runningTimers[task.id] ? "Stop timer" : "Start timer";
    timerBtn.onclick = () => toggleTimer(task.id);
    row.appendChild(timerBtn);

    const mins = document.createElement("input");
    mins.type = "number";
    mins.className = "mins";
    mins.min = "0";
    mins.step = "1";
    mins.value = task.minutes || 0;
    mins.onchange = () => { Store.setTaskMinutes(task.id, Number(mins.value) || 0); };
    row.appendChild(mins);

    const minsLabel = document.createElement("span");
    minsLabel.className = "mins-label";
    minsLabel.textContent = "min";
    row.appendChild(minsLabel);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete task");
    del.onclick = () => {
      if (runningTimers[task.id]) stopTimerInterval(task.id);
      Store.deleteTask(task.id);
      renderAll();
    };
    row.appendChild(del);

    return row;
  }

  function toggleTimer(id) {
    if (runningTimers[id]) {
      const elapsedMs = Date.now() - runningTimers[id].startedAt;
      stopTimerInterval(id);
      Store.addTaskMinutes(id, elapsedMs / 60000);
      renderAll();
    } else {
      runningTimers[id] = {
        startedAt: Date.now(),
        tick: setInterval(() => updateElapsedDisplay(id), 1000)
      };
      renderAll();
    }
  }
  function stopTimerInterval(id) {
    if (runningTimers[id]) {
      clearInterval(runningTimers[id].tick);
      delete runningTimers[id];
    }
  }
  function updateElapsedDisplay(id) {
    const t = runningTimers[id];
    const el = document.getElementById(`timer-${id}`);
    if (!t || !el) return;
    const sec = Math.floor((Date.now() - t.startedAt) / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    el.textContent = `${mm}:${ss}`;
  }

  function renderDaily() {
    dayLabelEl.textContent = fmtDayLabel(currentDay);
    dailyListEl.innerHTML = "";
    const tasks = Store.tasksForDate(currentDay);
    if (!tasks.length) {
      dailyListEl.innerHTML = '<div class="empty-hint">No goals for this day yet — add one above.</div>';
      return;
    }
    tasks.forEach((t) => dailyListEl.appendChild(taskRow(t)));
  }

  function renderWeekly() {
    weekLabelEl.textContent = fmtWeekLabel(currentWeekStart);
    weeklyListEl.innerHTML = "";
    const tasks = Store.tasksForWeek(currentWeekStart);
    if (!tasks.length) {
      weeklyListEl.innerHTML = '<div class="empty-hint">No goals for this week yet — add one above.</div>';
      return;
    }
    tasks.forEach((t) => weeklyListEl.appendChild(taskRow(t)));
  }

  function qualityDots(q) {
    let out = '<span class="quality-dots">';
    for (let i = 1; i <= 5; i++) out += `<span class="${i <= q ? "on" : ""}"></span>`;
    return out + "</span>";
  }
  function fmtTime12(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    let hh = h % 12; if (hh === 0) hh = 12;
    return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  function renderSleep() {
    const entries = Store.get().sleep.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
    sleepBodyEl.innerHTML = "";
    sleepEmptyEl.classList.toggle("hidden", entries.length > 0);
    entries.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fmtDate(s.date)}</td>
        <td>${fmtTime12(s.bedtime)}</td>
        <td>${fmtTime12(s.wakeTime)}</td>
        <td>${s.hours}h</td>
        <td>${qualityDots(s.quality)}</td>
        <td><button class="del" aria-label="Delete sleep entry">✕</button></td>
      `;
      tr.querySelector(".del").onclick = () => { Store.deleteSleep(s.id); renderSleep(); };
      sleepBodyEl.appendChild(tr);
    });
  }

  function renderStreak() {
    streakCountEl.textContent = Store.streak();
  }

  function renderAll() {
    renderDaily();
    renderWeekly();
    renderStreak();
  }

  /* ---- Day / week navigation ---- */
  document.getElementById("dayPrev").onclick = () => { currentDay = Store.isoOffset(currentDay, -1); renderDaily(); };
  document.getElementById("dayNext").onclick = () => { currentDay = Store.isoOffset(currentDay, 1); renderDaily(); };
  document.getElementById("weekPrev").onclick = () => { currentWeekStart = Store.isoOffset(currentWeekStart, -7); renderWeekly(); };
  document.getElementById("weekNext").onclick = () => { currentWeekStart = Store.isoOffset(currentWeekStart, 7); renderWeekly(); };

  /* ---- Add forms ---- */
  document.getElementById("dailyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("dailyTitle").value;
    const est = Number(document.getElementById("dailyEst").value) || 0;
    if (!title.trim()) return;
    Store.addTask({ title, type: "daily", date: currentDay, estMinutes: est });
    e.target.reset();
    renderAll();
  });

  document.getElementById("weeklyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("weeklyTitle").value;
    const est = Number(document.getElementById("weeklyEst").value) || 0;
    if (!title.trim()) return;
    Store.addTask({ title, type: "weekly", weekStart: currentWeekStart, estMinutes: est });
    e.target.reset();
    renderWeekly();
  });

  /* ---- Sleep form ---- */
  const sleepDateInput = document.getElementById("sleepDate");
  sleepDateInput.value = Store.todayISO();
  const qualityInput = document.getElementById("sleepQuality");
  const qualityValEl = document.getElementById("qualityVal");
  const QUALITY_WORDS = { 1: "Poor", 2: "Meh", 3: "Okay", 4: "Good", 5: "Great" };
  function updateQualityLabel() { qualityValEl.textContent = QUALITY_WORDS[qualityInput.value]; }
  qualityInput.addEventListener("input", updateQualityLabel);
  updateQualityLabel();

  document.getElementById("sleepForm").addEventListener("submit", (e) => {
    e.preventDefault();
    Store.addSleep({
      date: sleepDateInput.value,
      bedtime: document.getElementById("sleepBed").value,
      wakeTime: document.getElementById("sleepWake").value,
      quality: qualityInput.value
    });
    renderSleep();
  });

  renderAll();
  renderSleep();
})();
