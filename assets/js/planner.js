/* planner.js — periodized study-plan generator.
   Turns (startDate, testDate) into phases and concrete, checkable daily targets. */
(function () {
  const DAY = 86400000;

  function parseISO(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function diffDays(aISO, bISO) {
    return Math.round((parseISO(bISO) - parseISO(aISO)) / DAY);
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    return parseISO(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  // ---- Phases -------------------------------------------------------------
  const PHASE_DEFS = [
    { key: "foundation", name: "Phase 1 · Foundation", frac: 0.42,
      focus: "Content review across all four sections. Build the base. Start daily CARS + flashcards now.",
      icon: "🧱" },
    { key: "application", name: "Phase 2 · Application", frac: 0.30,
      focus: "Keep reviewing weak areas, but shift weight to practice passages and discrete questions. Begin section-bank work.",
      icon: "🛠️" },
    { key: "testing", name: "Phase 3 · Testing", frac: 0.21,
      focus: "Full-length practice exams + deep review of every miss. Build stamina and pacing under timed conditions.",
      icon: "📝" },
    { key: "final", name: "Phase 4 · Final Prep", frac: 0.07,
      focus: "Light targeted review, AAMC official material, fix remaining weaknesses, taper, and rest before test day.",
      icon: "🎯" }
  ];

  function buildPhases() {
    const s = Store.settings();
    if (!s.testDate || !s.startDate) return [];
    const total = Math.max(diffDays(s.startDate, s.testDate), 4);
    const phases = [];
    let cursorDay = 0;
    PHASE_DEFS.forEach((p, i) => {
      let len = Math.round(total * p.frac);
      if (i === PHASE_DEFS.length - 1) len = total - cursorDay; // last phase soaks up remainder
      len = Math.max(len, 1);
      const startISO = Store.isoOffset(parseISO(s.startDate), cursorDay);
      const endISO = Store.isoOffset(parseISO(s.startDate), Math.min(cursorDay + len - 1, total - 1));
      phases.push(Object.assign({}, p, { startISO, endISO, days: len }));
      cursorDay += len;
    });
    return phases;
  }

  function phaseForDate(iso) {
    const phases = buildPhases();
    for (const p of phases) {
      if (iso >= p.startISO && iso <= p.endISO) return p;
    }
    if (phases.length && iso < phases[0].startISO) return phases[0];
    return phases.length ? phases[phases.length - 1] : null;
  }

  // ---- Topic queue (interleaved across sections for spaced learning) ------
  function topicQueue() {
    const bySection = {};
    Curriculum.allTopics().forEach((t) => {
      if (t.recurring) return; // CARS daily handled separately
      (bySection[t.section] = bySection[t.section] || []).push(t);
    });
    const order = ["bb", "cp", "ps", "cars"]; // bb/cp are largest → seed first
    const queues = order.map((id) => (bySection[id] || []).slice());
    const out = [];
    let added = true;
    while (added) {
      added = false;
      for (const q of queues) {
        if (q.length) { out.push(q.shift()); added = true; }
      }
    }
    return out;
  }

  // ---- Rest day ----------------------------------------------------------
  function isRestDay(iso) {
    const s = Store.settings();
    if (s.restDay < 0) return false;
    return parseISO(iso).getDay() === Number(s.restDay);
  }

  // study-day ordinal counting only non-rest days from start to iso (inclusive)
  function studyDayNumber(iso) {
    const s = Store.settings();
    if (!s.startDate || iso < s.startDate) return 0;
    let n = 0;
    const days = diffDays(s.startDate, iso);
    for (let i = 0; i <= days; i++) {
      const cur = Store.isoOffset(parseISO(s.startDate), i);
      if (!isRestDay(cur)) n++;
    }
    return n;
  }

  // ---- Daily target generator -------------------------------------------
  function dailyTasks(iso) {
    const s = Store.settings();
    if (!s.testDate || !s.startDate) return { rest: false, unplanned: true, tasks: [] };
    if (iso > s.testDate) return { rest: false, afterTest: true, tasks: [] };

    if (isRestDay(iso)) {
      return { rest: true, tasks: [
        { id: "rest-cars", type: "cars", title: "Optional: 1 light CARS passage", section: "cars", minutes: 15,
          meta: "Keep the reading habit alive even on rest days (optional).",
          links: [{ t: "Jack Westin daily", u: "https://jackwestin.com/resources/cars" }] },
        { id: "rest-flash", type: "flash", title: "Clear due flashcards", section: null, minutes: 15,
          meta: "Spaced repetition works best with no skipped days." }
      ] };
    }

    const phase = phaseForDate(iso) || {};
    const dayNum = studyDayNumber(iso);
    const tasks = [];

    // 1) Daily CARS — every study day, all phases
    tasks.push({
      id: "cars", type: "cars", section: "cars",
      title: phase.key === "foundation" ? "CARS: 1–2 passages (untimed → timed)" : "CARS: 2–3 timed passages",
      minutes: 30,
      meta: "The #1 daily habit. Review every wrong answer and articulate why.",
      links: [
        { t: "Jack Westin (free)", u: "https://jackwestin.com/resources/cars" },
        { t: "AAMC CARS pack", u: "https://store.aamc.org/" }
      ]
    });

    // 2) Flashcards — every study day
    const fcStats = window.SRS ? SRS.stats() : { dueNow: 0 };
    tasks.push({
      id: "flash", type: "flash", section: null,
      title: "Spaced-repetition flashcards",
      minutes: 20,
      meta: fcStats.dueNow ? (fcStats.dueNow + " cards due today") : "Review due cards + learn new ones",
      links: []
    });

    // 3) Content / practice depending on phase
    const queue = topicQueue();
    function pickTopics(count, offsetCycle) {
      const out = [];
      const base = (dayNum - 1) * count + (offsetCycle || 0);
      for (let i = 0; i < count; i++) {
        out.push(queue[(base + i) % queue.length]);
      }
      return out;
    }

    if (phase.key === "foundation") {
      pickTopics(2).forEach((t, i) => tasks.push(contentTask(t, i, "Content review")));
    } else if (phase.key === "application") {
      pickTopics(1).forEach((t, i) => tasks.push(contentTask(t, i, "Review weak area")));
      // practice block
      const ps = Curriculum.sectionById(["bb", "cp", "ps"][dayNum % 3]);
      tasks.push({
        id: "practice", type: "practice", section: ps.id,
        title: ps.short + " practice: 1 passage set + discretes",
        minutes: 45,
        meta: "Do questions, then review explanations thoroughly. Log misses as flashcards.",
        links: [{ t: ps.short + " practice on YouTube", u: Curriculum.yt("MCAT " + ps.name + " practice questions") }]
      });
    } else if (phase.key === "testing") {
      const isFullLengthDay = parseISO(iso).getDay() === 6; // Saturday
      if (isFullLengthDay) {
        tasks.push({
          id: "fl", type: "exam", section: null,
          title: "🧪 Full-length practice exam (timed, full conditions)",
          minutes: 390,
          meta: "Simulate test day: same start time, breaks, no phone. Record your score afterward in the Dashboard.",
          links: [
            { t: "AAMC Full-Length Exams", u: "https://store.aamc.org/the-official-mcat-prep-bundle.html" },
            { t: "Free FL options", u: Curriculum.yt("free MCAT full length practice exam") }
          ]
        });
      } else {
        tasks.push({
          id: "review-fl", type: "review", section: null,
          title: "Deep review of last full-length (every question)",
          minutes: 90,
          meta: "Re-do missed questions, categorize errors (content vs. reasoning vs. timing), convert gaps to flashcards.",
          links: []
        });
        const ps = Curriculum.sectionById(["bb", "cp", "ps"][dayNum % 3]);
        tasks.push({
          id: "practice", type: "practice", section: ps.id,
          title: ps.short + " targeted practice (weakest subtopics)",
          minutes: 45,
          meta: "Focus on the categories you missed most on your last exam.",
          links: [{ t: ps.short + " review", u: Curriculum.yt("MCAT " + ps.name + " high yield review") }]
        });
      }
    } else { // final
      tasks.push({
        id: "aamc", type: "review", section: null,
        title: "AAMC official material (highest fidelity)",
        minutes: 90,
        meta: "Prioritize AAMC FL4/5, Section Banks, and Q-packs — they best mirror the real exam.",
        links: [{ t: "AAMC official prep", u: "https://store.aamc.org/" }]
      });
      tasks.push({
        id: "weakfix", type: "review", section: null,
        title: "Targeted weak-area cleanup",
        minutes: 45,
        meta: "Hit your 3 weakest content categories. Don't cram new material the last few days — consolidate.",
        links: []
      });
    }

    return { rest: false, phase, tasks };
  }

  function contentTask(t, i, prefix) {
    if (!t) return { id: "content-" + i, type: "content", title: "Review session", section: null, minutes: 60, links: [] };
    return {
      id: "content-" + t.id, type: "content", section: t.section,
      title: prefix + ": " + t.name,
      minutes: (t.hours || 2) * 30,
      meta: Curriculum.sectionById(t.section).short + " · " + t.unit,
      links: (t.res || []).map((r) => ({ t: r.t, u: r.u }))
    };
  }

  function planSummary() {
    const s = Store.settings();
    if (!s.testDate) return null;
    const today = Store.todayISO();
    const daysLeft = diffDays(today, s.testDate);
    const totalDays = diffDays(s.startDate, s.testDate);
    const elapsed = diffDays(s.startDate, today);
    return {
      daysLeft,
      weeksLeft: Math.max(0, Math.floor(daysLeft / 7)),
      totalDays,
      elapsed: Math.max(0, elapsed),
      progress: totalDays > 0 ? Math.min(1, Math.max(0, elapsed / totalDays)) : 0,
      phase: phaseForDate(today)
    };
  }

  window.Planner = { buildPhases, phaseForDate, dailyTasks, planSummary, isRestDay, studyDayNumber, fmtDate, diffDays, parseISO };
})();
