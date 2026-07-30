/* insights.js — Insights page: aggregates tasks + sleep into charts and stats. */
(function () {
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function shortDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return `${MON[m - 1]} ${d}`;
  }
  function minutesSinceNoon(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return ((h - 12 + 24) % 24) * 60 + m;
  }
  function fmtClockLabel(m) { return Charts.clockLabel(m); }

  let rangeDays = 14;
  const tabsEl = document.getElementById("rangeTabs");
  tabsEl.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.days) === rangeDays);
    btn.addEventListener("click", () => {
      rangeDays = Number(btn.dataset.days);
      tabsEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
      render();
    });
  });

  const sleepTargetInput = document.getElementById("sleepTargetInput");
  sleepTargetInput.value = Store.settings().sleepTargetHours;
  sleepTargetInput.addEventListener("change", () => {
    Store.setSleepTarget(sleepTargetInput.value);
    render();
  });

  function dateRange(days) {
    const today = Store.todayISO();
    const start = Store.isoOffset(today, -(days - 1));
    const dates = [];
    for (let i = 0; i < days; i++) dates.push(Store.isoOffset(start, i));
    return dates;
  }

  function render() {
    const dates = dateRange(rangeDays);
    const startIso = dates[0], endIso = dates[dates.length - 1];
    const labels = dates.map(shortDate);

    const dailyTasks = Store.dailyTasksInRange(startIso, endIso);
    const weeklyStarts = new Set(dates.map((d) => Store.weekStartISO(d)));
    const weeklyTasks = Store.get().tasks.filter((t) => t.type === "weekly" && weeklyStarts.has(t.weekStart));
    const allTasks = dailyTasks.concat(weeklyTasks);

    /* ---- Stat tiles ---- */
    const totalMinutes = allTasks.reduce((s, t) => s + (t.minutes || 0), 0);
    document.getElementById("statTotalTime").textContent =
      totalMinutes >= 60 ? `${Math.round((totalMinutes / 60) * 10) / 10}h` : `${Math.round(totalMinutes)}m`;

    const completedCount = allTasks.filter((t) => t.completed).length;
    document.getElementById("statCompletion").textContent =
      allTasks.length ? `${Math.round((completedCount / allTasks.length) * 100)}%` : "—";

    document.getElementById("statStreak").textContent = Store.streak();

    const sleepEntries = Store.sleepInRange(startIso, endIso);
    const avgSleep = sleepEntries.length
      ? sleepEntries.reduce((s, e) => s + e.hours, 0) / sleepEntries.length : 0;
    document.getElementById("statAvgSleep").textContent = sleepEntries.length ? `${Math.round(avgSleep * 10) / 10}h` : "—";

    /* ---- Time spent per day (daily tasks only) ---- */
    const minutesByDate = {};
    dailyTasks.forEach((t) => { minutesByDate[t.date] = (minutesByDate[t.date] || 0) + (t.minutes || 0); });
    const hoursValues = dates.map((d) => Math.round(((minutesByDate[d] || 0) / 60) * 10) / 10);
    Charts.renderBarChart(document.getElementById("chartTime"), {
      labels, values: hoursValues, color: "var(--primary)", unit: "h"
    });

    /* ---- Completion rate per day (daily tasks only) ---- */
    const completionByDate = dates.map((d) => {
      const tasks = dailyTasks.filter((t) => t.date === d);
      if (!tasks.length) return 0;
      return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
    });
    Charts.renderLineChart(document.getElementById("chartCompletion"), {
      labels, series: [{ values: completionByDate, color: "var(--good)", name: "Completion %" }],
      yMax: 100, yFormat: (v) => `${Math.round(v)}%`
    });

    /* ---- Top goals by time spent ---- */
    const byTitle = {};
    allTasks.forEach((t) => { byTitle[t.title] = (byTitle[t.title] || 0) + (t.minutes || 0); });
    const top = Object.entries(byTitle).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topEl = document.getElementById("chartTopTasks");
    if (top.length) {
      Charts.renderHBarChart(topEl, {
        labels: top.map((x) => x[0]), values: top.map((x) => Math.round(x[1])), color: "var(--accent)"
      });
    } else {
      topEl.innerHTML = '<div class="empty-hint">No time logged in this range yet.</div>';
    }

    /* ---- Sleep hours ---- */
    const sleepByDate = {};
    sleepEntries.forEach((s) => { sleepByDate[s.date] = s; });
    const sleepHoursValues = dates.map((d) => sleepByDate[d] ? sleepByDate[d].hours : 0);
    Charts.renderBarChart(document.getElementById("chartSleepHours"), {
      labels, values: sleepHoursValues, color: "var(--sleep)", unit: "h", target: Store.settings().sleepTargetHours
    });

    /* ---- Sleep consistency ---- */
    const bedtimes = dates.map((d) => sleepByDate[d] ? minutesSinceNoon(sleepByDate[d].bedtime) : null);
    const wakes = dates.map((d) => sleepByDate[d] ? minutesSinceNoon(sleepByDate[d].wakeTime) : null);
    Charts.renderSleepTimeChart(document.getElementById("chartSleepTimes"), { labels, bedtimes, wakes });

    /* ---- Sleep stats ---- */
    const bedVals = bedtimes.filter((v) => v != null);
    const wakeVals = wakes.filter((v) => v != null);
    if (bedVals.length) {
      const avgBed = bedVals.reduce((a, b) => a + b, 0) / bedVals.length;
      document.getElementById("statAvgBed").textContent = fmtClockLabel(avgBed);
      const variance = bedVals.reduce((s, v) => s + Math.pow(v - avgBed, 2), 0) / bedVals.length;
      document.getElementById("statConsistency").textContent = `±${Math.round(Math.sqrt(variance))}`;
    } else {
      document.getElementById("statAvgBed").textContent = "—";
      document.getElementById("statConsistency").textContent = "—";
    }
    if (wakeVals.length) {
      const avgWake = wakeVals.reduce((a, b) => a + b, 0) / wakeVals.length;
      document.getElementById("statAvgWake").textContent = fmtClockLabel(avgWake);
    } else {
      document.getElementById("statAvgWake").textContent = "—";
    }
  }

  render();
})();
