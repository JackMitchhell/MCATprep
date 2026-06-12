/* app.js — router, views, and all UI rendering. */
(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ROUTES = ["dashboard", "today", "plan", "flashcards", "resources", "application", "settings"];
  const TITLES = {
    dashboard: "Dashboard", today: "Today", plan: "Study Plan", flashcards: "Flashcards",
    resources: "Resources", application: "Application", settings: "Settings"
  };

  // ---------- coverage helpers ----------
  function coveredTopicIds() {
    const set = new Set();
    const log = Store.get().dayLog;
    Object.values(log).forEach((d) => {
      Object.entries(d.tasks || {}).forEach(([k, v]) => {
        if (v && k.indexOf("content-") === 0) set.add(k.replace("content-", ""));
      });
    });
    return set;
  }
  function sectionProgress() {
    const covered = coveredTopicIds();
    return Curriculum.SECTIONS.map((s) => {
      const topics = [];
      s.units.forEach((u) => u.topics.forEach((t) => { if (!t.recurring) topics.push(t); }));
      const done = topics.filter((t) => covered.has(t.id)).length;
      return { id: s.id, short: s.short, name: s.name, color: s.color, total: topics.length, done,
               pct: topics.length ? done / topics.length : 0 };
    });
  }
  function studyDaysLogged() {
    return Object.values(Store.get().dayLog).filter((d) => d.studied).length;
  }

  // ---------- small UI atoms ----------
  function ring(pct, label, colorVar) {
    const r = 46, c = 2 * Math.PI * r, off = c * (1 - pct);
    return `<div class="ring">
      <svg width="110" height="110">
        <circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="9"/>
        <circle cx="55" cy="55" r="${r}" fill="none" stroke="${colorVar}" stroke-width="9"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
      </svg>
      <div class="ring-label"><span class="pct">${Math.round(pct * 100)}%</span><span class="name">${esc(label)}</span></div>
    </div>`;
  }
  function bar(pct, good) {
    return `<div class="bar ${good ? "good" : ""}"><span style="width:${Math.round(pct * 100)}%"></span></div>`;
  }
  const SECTION_COLORVAR = { cp: "var(--sec-cp)", cars: "var(--sec-cars)", bb: "var(--sec-bb)", ps: "var(--sec-ps)" };
  function sectionBadge(id) {
    if (!id) return "";
    const s = Curriculum.sectionById(id);
    return `<span class="badge ${s.color}">${esc(s.short)}</span>`;
  }

  // =======================================================================
  // VIEWS
  // =======================================================================

  function viewDashboard() {
    const s = Store.settings();
    const summary = Planner.planSummary();
    const secProg = sectionProgress();
    const fc = SRS.stats();
    const streak = Store.streak();

    if (!s.testDate) {
      return `<div class="banner info">
        <h2>👋 Welcome to your MCAT command center</h2>
        <p>Set your test date to generate a personalized, periodized study plan with daily targets.</p>
        <a class="btn primary" href="#/settings">Set up my plan →</a>
      </div>` + welcomeCards();
    }

    const overallPct = secProg.reduce((a, b) => a + b.pct, 0) / secProg.length;
    const todayTasks = Planner.dailyTasks(Store.todayISO());
    const todayDone = Store.dayCompletion(Store.todayISO(), todayTasks.tasks.length);

    return `
      <div class="grid cols-4">
        ${statCard((summary.daysLeft >= 0 ? summary.daysLeft : 0), "Days to test", "accent")}
        ${statCard(streak, "Day streak 🔥", "warn")}
        ${statCard(studyDaysLogged(), "Days studied", "primary")}
        ${statCard(fc.dueNow, "Cards due", "good")}
      </div>

      <div class="grid cols-2 mt">
        <div class="card">
          <div class="card-head"><h3>${summary.phase ? summary.phase.icon + " " + esc(summary.phase.name) : "Plan"}</h3>
            <span class="badge phase">${summary.weeksLeft} weeks left</span></div>
          <p class="small">${summary.phase ? esc(summary.phase.focus) : ""}</p>
          <div class="small muted mt">Overall timeline</div>
          ${bar(summary.progress)}
          <div class="row spread small muted mt"><span>${Planner.fmtDate(s.startDate)}</span><span>Test: ${Planner.fmtDate(s.testDate)}</span></div>
          <div class="mt"><a class="btn sm" href="#/today">Go to today's targets →</a></div>
        </div>

        <div class="card">
          <div class="card-head"><h3>📈 Today's progress</h3><span class="small muted">${Math.round(todayDone * 100)}% done</span></div>
          ${todayTasks.rest
            ? `<p>🌴 Rest day — recovery is part of the plan. Light flashcards optional.</p>`
            : `${bar(todayDone, todayDone >= 1)}
               <div class="small muted mt">${todayTasks.tasks.length} targets scheduled today</div>`}
          <div class="divider"></div>
          <div class="kpi-inline">
            <div class="k">Target score <b>${esc(s.targetScore)}</b></div>
            <div class="k">Cards learned <b>${fc.learned}/${fc.total}</b></div>
            <div class="k">Mature cards <b>${fc.mature}</b></div>
          </div>
        </div>
      </div>

      <div class="section-title"><h2>Content coverage by section</h2></div>
      <div class="card">
        <div class="ring-wrap">
          ${secProg.map((p) => ring(p.pct, p.short, SECTION_COLORVAR[p.id])).join("")}
          ${ring(overallPct, "Overall", "var(--primary)")}
        </div>
        <div class="divider"></div>
        ${secProg.map((p) => `<div class="row mt" style="gap:14px">
            ${sectionBadge(p.id)} <div style="flex:1">${bar(p.pct)}</div>
            <span class="small muted">${p.done}/${p.total} topics</span></div>`).join("")}
      </div>

      <div class="grid cols-2 mt-lg">
        <div class="card">
          <div class="card-head"><h3>🧪 Practice exam scores</h3></div>
          ${examScoresTable()}
          <div class="divider"></div>
          ${examScoreForm()}
        </div>
        <div class="card">
          <div class="card-head"><h3>🔥 Study activity (last 16 weeks)</h3></div>
          ${heatmap()}
          <p class="small muted mt">Each square is a day. Greener = more targets completed.</p>
        </div>
      </div>
    `;
  }

  function welcomeCards() {
    return `<div class="grid cols-3 mt">
      <div class="card"><h3>🗓️ Periodized plan</h3><p class="small">Foundation → Application → Testing → Final Prep, auto-scheduled from your test date.</p></div>
      <div class="card"><h3>🔁 Spaced repetition</h3><p class="small">SM-2 flashcards surface exactly what you're about to forget.</p></div>
      <div class="card"><h3>📚 Free resources</h3><p class="small">Curated Khan Academy, YouTube & AAMC links mapped to every topic.</p></div>
    </div>`;
  }

  function statCard(num, label, cls) {
    return `<div class="card stat"><div class="num ${cls || ""}">${esc(num)}</div><div class="lbl">${esc(label)}</div></div>`;
  }

  function examScoresTable() {
    const scores = Store.get().examScores;
    if (!scores.length) return `<p class="small muted">No exams logged yet. Record your first practice/diagnostic below.</p>`;
    const sorted = scores.slice().sort((a, b) => a.date.localeCompare(b.date));
    const best = Math.max(...scores.map((x) => x.total || 0));
    const latest = sorted[sorted.length - 1];
    return `<div class="kpi-inline mt"><div class="k">Latest <b>${esc(latest.total)}</b></div>
      <div class="k">Best <b>${best}</b></div>
      <div class="k">Logged <b>${scores.length}</b></div></div>
      <table class="simple mt"><thead><tr><th>Date</th><th>Exam</th><th>C/P</th><th>CARS</th><th>B/B</th><th>P/S</th><th>Total</th></tr></thead>
      <tbody>${sorted.slice(-6).reverse().map((x) => `<tr>
        <td>${Planner.fmtDate(x.date)}</td><td>${esc(x.name || "—")}</td>
        <td>${esc(x.cp || "—")}</td><td>${esc(x.cars || "—")}</td><td>${esc(x.bb || "—")}</td><td>${esc(x.ps || "—")}</td>
        <td><b>${esc(x.total || "—")}</b></td></tr>`).join("")}</tbody></table>`;
  }

  function examScoreForm() {
    return `<form data-form="exam">
      <div class="row" style="gap:8px">
        <input type="text" name="name" placeholder="Exam name (e.g. AAMC FL1)" style="flex:2 1 160px">
        <input type="date" name="date" value="${Store.todayISO()}" style="flex:1 1 130px">
      </div>
      <div class="row mt" style="gap:8px">
        <input type="number" name="cp" placeholder="C/P" min="118" max="132" style="flex:1">
        <input type="number" name="cars" placeholder="CARS" min="118" max="132" style="flex:1">
        <input type="number" name="bb" placeholder="B/B" min="118" max="132" style="flex:1">
        <input type="number" name="ps" placeholder="P/S" min="118" max="132" style="flex:1">
      </div>
      <button class="btn primary mt" type="submit">＋ Log exam score</button>
    </form>`;
  }

  function heatmap() {
    const weeks = 16, days = weeks * 7;
    const cells = [];
    for (let i = days - 1; i >= 0; i--) {
      const iso = Store.isoOffset(new Date(), -i);
      const log = Store.get().dayLog[iso];
      let lvl = 0;
      if (log) {
        const done = Object.values(log.tasks || {}).filter(Boolean).length;
        lvl = done >= 6 ? 4 : done >= 4 ? 3 : done >= 2 ? 2 : done >= 1 ? 1 : 0;
      }
      cells.push(`<div class="cell ${lvl ? "l" + lvl : ""}" title="${iso}"></div>`);
    }
    return `<div class="heat">${cells.join("")}</div>`;
  }

  // ---------- Today ----------
  function viewToday() {
    const s = Store.settings();
    if (!s.testDate) return needSetup();
    const iso = Store.todayISO();
    const data = Planner.dailyTasks(iso);
    const dayName = Planner.parseISO(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

    if (data.afterTest) {
      return `<div class="banner info"><h2>🎉 Test day has passed!</h2>
        <p>Log your official score and shift focus to your application.</p>
        <a class="btn primary" href="#/application">Go to application tracker →</a></div>`;
    }

    const done = data.tasks.filter((t) => Store.isTaskDone(iso, t.id)).length;
    const pct = data.tasks.length ? done / data.tasks.length : 0;
    const note = (Store.get().dayLog[iso] || {}).note || "";

    const header = `<div class="card pad-lg">
      <div class="row spread">
        <div>
          <div class="small muted">${esc(dayName)}</div>
          <h1 style="margin:.1em 0">${data.rest ? "🌴 Rest Day" : (data.phase ? data.phase.icon + " " + esc(data.phase.name) : "Today")}</h1>
          ${data.phase && !data.rest ? `<p class="small">${esc(data.phase.focus)}</p>` : ""}
        </div>
        <div class="stat"><div class="num accent">${done}/${data.tasks.length}</div><div class="lbl">targets</div></div>
      </div>
      ${bar(pct, pct >= 1)}
    </div>`;

    const taskList = data.tasks.map((t) => {
      const isDone = Store.isTaskDone(iso, t.id);
      const links = (t.links || []).map((l) => `<a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)} ↗</a>`).join("");
      const mins = t.minutes ? `<span class="badge">⏱ ${t.minutes >= 60 ? (Math.round(t.minutes / 6) / 10) + "h" : t.minutes + "m"}</span>` : "";
      return `<div class="task ${isDone ? "done" : ""}">
        <button class="check" data-task="${esc(t.id)}" aria-label="Toggle">✓</button>
        <div class="task-body">
          <div class="row spread">
            <div class="task-title">${esc(t.title)}</div>
            <div class="lbl-left">${sectionBadge(t.section)} ${mins}</div>
          </div>
          ${t.meta ? `<div class="task-meta">${esc(t.meta)}</div>` : ""}
          ${links ? `<div class="task-links">${links}</div>` : ""}
          ${t.type === "flash" ? `<div class="task-links"><a href="#/flashcards">Open flashcards →</a></div>` : ""}
        </div>
      </div>`;
    }).join("");

    const noteBox = `<div class="card mt">
      <div class="card-head"><h3>📝 Today's notes & reflections</h3></div>
      <textarea data-note placeholder="Wins, struggles, what to review tomorrow...">${esc(note)}</textarea>
      <button class="btn sm mt" data-save-note>Save note</button>
    </div>`;

    return header + `<div class="mt-lg">${taskList || `<p class="muted">No targets scheduled.</p>`}</div>` + noteBox;
  }

  // ---------- Plan ----------
  function viewPlan() {
    const s = Store.settings();
    if (!s.testDate) return needSetup();
    const phases = Planner.buildPhases();
    const today = Store.todayISO();
    const covered = coveredTopicIds();

    const timeline = `<div class="card pad-lg">
      <div class="card-head"><h2>🗓️ Your periodized roadmap</h2><span class="small muted">${Planner.fmtDate(s.startDate)} → ${Planner.fmtDate(s.testDate)}</span></div>
      <div class="timeline">${phases.map((p) => {
        const isPast = today > p.endISO, isCur = today >= p.startISO && today <= p.endISO;
        return `<div class="phase ${isCur ? "current" : isPast ? "past" : ""}">
          <div class="dot"></div>
          <div class="row spread"><strong>${p.icon} ${esc(p.name)}</strong>
            <span class="small muted">${Planner.fmtDate(p.startISO)} – ${Planner.fmtDate(p.endISO)} · ${p.days}d</span></div>
          <p class="small" style="margin:.3em 0 0">${esc(p.focus)}</p>
        </div>`;
      }).join("")}</div>
    </div>`;

    const sections = Curriculum.SECTIONS.map((sec) => {
      const units = sec.units.map((u) => {
        const topics = u.topics.filter((t) => !t.recurring).map((t) => {
          const isCov = covered.has(t.id);
          const links = (t.res || []).map((r) => `<a href="${esc(r.u)}" target="_blank" rel="noopener">${esc(r.t)} ↗</a>`).join("");
          return `<div class="task ${isCov ? "done" : ""}">
            <button class="check" data-topic="${esc(t.id)}" aria-label="Toggle covered">✓</button>
            <div class="task-body">
              <div class="task-title">${esc(t.name)} <span class="small faint">· ~${t.hours}h</span></div>
              ${links ? `<div class="task-links">${links}</div>` : ""}
            </div></div>`;
        }).join("");
        return `<div class="mt"><div class="small faint" style="text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${esc(u.name)}</div>${topics}</div>`;
      }).join("");
      const prog = sectionProgress().find((p) => p.id === sec.id);
      return `<div class="card mt">
        <div class="card-head"><h3>${sectionBadge(sec.id)} ${esc(sec.name)} <span class="small faint">· ${sec.weight}% of exam</span></h3>
          <span class="small muted">${prog.done}/${prog.total}</span></div>
        <p class="small">${esc(sec.blurb)}</p>
        ${bar(prog.pct)}
        ${units}
      </div>`;
    }).join("");

    return timeline + `<div class="section-title"><h2>Content checklist</h2><span class="small muted">Tap ✓ to mark a topic reviewed</span></div>` + sections;
  }

  // ---------- Flashcards ----------
  let fcQueue = null, fcIndex = 0, fcRevealed = false;
  function viewFlashcards() {
    const stats = SRS.stats();
    return `
      <div class="grid cols-4">
        ${statCard(stats.dueNow, "Due now", "warn")}
        ${statCard(stats.learned, "Learning", "primary")}
        ${statCard(stats.mature, "Mature (21d+)", "good")}
        ${statCard(stats.total, "Total cards", "accent")}
      </div>
      <div class="card mt-lg" id="fcStageCard">
        <div class="fc-stage" id="fcStage">${renderFcStage()}</div>
      </div>
      <div class="grid cols-2 mt-lg">
        <div class="card">
          <div class="card-head"><h3>➕ Add a flashcard</h3></div>
          <form data-form="card">
            <label class="field"><span>Front (question)</span><textarea name="front" required placeholder="What does ΔG < 0 indicate?"></textarea></label>
            <label class="field"><span>Back (answer)</span><textarea name="back" required placeholder="The reaction is spontaneous."></textarea></label>
            <div class="row" style="gap:8px">
              <select name="section" style="flex:1">
                <option value="">No section</option>
                ${Curriculum.SECTIONS.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("")}
              </select>
              <input type="text" name="topic" placeholder="Topic (optional)" style="flex:1">
            </div>
            <button class="btn primary mt" type="submit">Add card</button>
          </form>
        </div>
        <div class="card">
          <div class="card-head"><h3>🗂️ Your custom cards</h3><span class="small muted">${Store.get().customCards.length}</span></div>
          ${customCardsList()}
        </div>
      </div>`;
  }

  function renderFcStage() {
    if (!fcQueue) { fcQueue = SRS.dueCards(); fcIndex = 0; fcRevealed = false; }
    if (!fcQueue.length || fcIndex >= fcQueue.length) {
      return `<div class="empty"><div class="big">✅</div><h3>All caught up!</h3>
        <p class="small">No cards due right now. Come back tomorrow, or learn ahead.</p>
        <button class="btn mt" data-fc="reload">Reload deck</button></div>`;
    }
    const card = fcQueue[fcIndex];
    const progress = `<div class="small muted center" style="margin-bottom:10px">Card ${fcIndex + 1} of ${fcQueue.length} ${sectionBadge(card.section)} ${card.topic ? `<span class="small faint">· ${esc(card.topic)}</span>` : ""}</div>`;
    if (!fcRevealed) {
      return progress + `<div class="flashcard" data-fc="reveal">
          <div class="fc-side-label">Question</div>
          <div class="fc-q">${esc(card.front)}</div>
          <div class="fc-hint">Tap to reveal answer</div>
        </div>`;
    }
    return progress + `<div class="flashcard" data-fc="reveal">
        <div class="fc-side-label">Answer</div>
        <div class="fc-a">${esc(card.back)}</div>
      </div>
      <div class="fc-grades">
        <button class="btn bad" data-grade="0">Again<small>&lt;1d</small></button>
        <button class="btn warn" data-grade="3">Hard<small>soon</small></button>
        <button class="btn good" data-grade="4">Good<small>on track</small></button>
        <button class="btn primary" data-grade="5">Easy<small>longer</small></button>
      </div>`;
  }

  function customCardsList() {
    const cards = Store.get().customCards;
    if (!cards.length) return `<p class="small muted">No custom cards yet. Add high-yield facts or convert your practice misses into cards.</p>`;
    return `<div class="res-list">${cards.slice().reverse().map((c) => `
      <div class="res-item">
        <div class="res-body"><div class="res-title">${esc(c.front)}</div>
          <div class="res-sub">${esc(c.back)}</div></div>
        <button class="btn sm bad" data-del-card="${esc(c.id)}">✕</button>
      </div>`).join("")}</div>`;
  }

  // ---------- Resources ----------
  function viewResources() {
    const ch = Curriculum.CHANNELS;
    const channels = Object.values(ch).map((c) => `
      <a class="res-item" href="${esc(c.url)}" target="_blank" rel="noopener">
        <div class="res-ico">▶️</div>
        <div class="res-body"><div class="res-title">${esc(c.name)}</div><div class="res-sub">${esc(c.note)}</div></div>
      </a>`).join("");

    const official = [
      { t: "AAMC Official MCAT Prep", u: "https://store.aamc.org/", note: "Highest-fidelity practice — FLs, Section Banks, Q-Packs" },
      { t: "Khan Academy MCAT Collection", u: "https://www.khanacademy.org/test-prep/mcat", note: "Free full content review + videos" },
      { t: "Jack Westin — Free CARS", u: "https://jackwestin.com/resources/cars", note: "New CARS passages daily, free" },
      { t: "AAMC MSAR (school database)", u: "https://msar.aamc.org/", note: "Build your school list" },
      { t: "Reddit r/MCAT", u: "https://www.reddit.com/r/MCAT/", note: "Community advice, the 'how to score' guides, AnKing decks" },
      { t: "MileDown / AnKing Anki decks", u: "https://www.reddit.com/r/MCAT/wiki/index/", note: "Popular community spaced-repetition decks" }
    ].map((r) => `<a class="res-item" href="${esc(r.u)}" target="_blank" rel="noopener">
        <div class="res-ico">🔗</div>
        <div class="res-body"><div class="res-title">${esc(r.t)}</div><div class="res-sub">${esc(r.note)}</div></div></a>`).join("");

    const userRes = Store.get().userResources;
    const perSection = Curriculum.SECTIONS.map((sec) => {
      const topicLinks = [];
      sec.units.forEach((u) => u.topics.forEach((t) => (t.res || []).forEach((r) => {
        if (r.u.indexOf("youtube.com") > -1) topicLinks.push({ t: r.t, u: r.u, topic: t.name });
      })));
      const list = topicLinks.slice(0, 100).map((r) => `<a class="res-item" href="${esc(r.u)}" target="_blank" rel="noopener">
          <div class="res-ico">📺</div>
          <div class="res-body"><div class="res-title">${esc(r.t)}</div><div class="res-sub">${esc(r.topic)}</div></div></a>`).join("");
      const custom = (userRes[sec.id] || []).map((r, i) => `<div class="res-item">
          <div class="res-ico">⭐</div>
          <div class="res-body"><div class="res-title"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a></div>
            <div class="res-sub">${esc(r.channel || "Saved by you")}</div></div>
          <button class="btn sm bad" data-del-res="${sec.id}:${i}">✕</button></div>`).join("");
      return `<div class="card mt">
        <div class="card-head"><h3>${sectionBadge(sec.id)} ${esc(sec.name)}</h3></div>
        <div class="res-list">${custom}${list}</div>
        <form data-form="res" data-section="${sec.id}" class="row mt" style="gap:8px">
          <input type="text" name="title" placeholder="Add your own resource title" style="flex:2 1 160px" required>
          <input type="url" name="url" placeholder="https://..." style="flex:2 1 160px" required>
          <button class="btn" type="submit">Save</button>
        </form>
      </div>`;
    }).join("");

    return `
      <div class="banner info"><strong>All free.</strong> Curated channels and links mapped to MCAT content. Watch links open targeted YouTube searches so they surface the best current videos.</div>
      <div class="section-title"><h2>📺 Best free YouTube channels</h2></div>
      <div class="card"><div class="res-list">${channels}</div></div>
      <div class="section-title"><h2>🏛️ Official & essential</h2></div>
      <div class="card"><div class="res-list">${official}</div></div>
      <div class="section-title"><h2>🎬 Topic videos by section</h2></div>
      ${perSection}`;
  }

  // ---------- Application ----------
  function viewApplication() {
    const st = Store.get().appState;
    const exp = Store.get().experiences;
    const T = AppChecklist.EXPERIENCE_TARGETS;

    const expCards = Object.keys(T).map((k) => {
      const v = exp[k] || 0, target = T[k].target;
      return `<div class="card">
        <div class="row spread"><strong class="small">${esc(T[k].label)}</strong>
          <span class="small muted">${v} / ${target}h</span></div>
        ${bar(Math.min(1, v / target), v >= target)}
        <div class="row mt" style="gap:6px">
          <input type="number" data-exp="${k}" value="${v}" min="0" style="flex:1">
          <button class="btn sm" data-exp-add="${k}:10">+10</button>
          <button class="btn sm" data-exp-add="${k}:25">+25</button>
        </div>
        <div class="small faint mt">${esc(T[k].hint)}</div>
      </div>`;
    }).join("");

    const checklist = AppChecklist.CHECKLIST.map((ph) => {
      const items = ph.items.map((it) => {
        const done = st[it.id] && st[it.id].done;
        const link = it.link ? `<a href="${esc(it.link)}" target="_blank" rel="noopener" class="small">guide ↗</a>` : "";
        return `<div class="task ${done ? "done" : ""}">
          <button class="check" data-app="${esc(it.id)}" aria-label="Toggle">✓</button>
          <div class="task-body"><div class="row spread"><div class="task-title">${esc(it.label)}</div>${link}</div></div>
        </div>`;
      }).join("");
      const total = ph.items.length, doneCount = ph.items.filter((it) => st[it.id] && st[it.id].done).length;
      return `<div class="card mt">
        <div class="card-head"><h3>${esc(ph.phase)}</h3><span class="small muted">${doneCount}/${total}</span></div>
        ${bar(total ? doneCount / total : 0, doneCount === total)}
        <div class="mt">${items}</div>
      </div>`;
    }).join("");

    return `
      <div class="banner info">Beyond the MCAT: track the whole AMCAS cycle — experiences, letters, essays, secondaries, and interviews.</div>
      <div class="section-title"><h2>⏱️ Experience hours</h2></div>
      <div class="grid cols-3">${expCards}</div>
      <div class="section-title"><h2>✅ Application roadmap</h2></div>
      ${checklist}`;
  }

  // ---------- Settings ----------
  function viewSettings() {
    const s = Store.settings();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return `
      <div class="card pad-lg">
        <div class="card-head"><h2>⚙️ Plan settings</h2></div>
        <form data-form="settings">
          <div class="grid cols-2">
            <label class="field"><span>Your name (optional)</span><input type="text" name="name" value="${esc(s.name)}" placeholder="Future Dr. ___"></label>
            <label class="field"><span>Target total score (472–528)</span><input type="number" name="targetScore" min="472" max="528" value="${esc(s.targetScore)}"></label>
            <label class="field"><span>Study start date</span><input type="date" name="startDate" value="${esc(s.startDate)}"></label>
            <label class="field"><span>MCAT test date</span><input type="date" name="testDate" value="${esc(s.testDate)}" required></label>
            <label class="field"><span>Hours per weekday</span><input type="number" name="hoursPerWeekday" min="0" max="16" step="0.5" value="${esc(s.hoursPerWeekday)}"></label>
            <label class="field"><span>Hours per weekend day</span><input type="number" name="hoursPerWeekend" min="0" max="16" step="0.5" value="${esc(s.hoursPerWeekend)}"></label>
            <label class="field"><span>Weekly rest day</span>
              <select name="restDay">
                <option value="-1" ${s.restDay < 0 ? "selected" : ""}>No fixed rest day</option>
                ${days.map((d, i) => `<option value="${i}" ${Number(s.restDay) === i ? "selected" : ""}>${d}</option>`).join("")}
              </select></label>
          </div>
          <button class="btn primary mt" type="submit">💾 Save settings</button>
        </form>
      </div>

      <div class="card mt-lg">
        <div class="card-head"><h3>📦 Your data</h3></div>
        <p class="small">Everything is stored locally in this browser only — nothing is uploaded. Export to back up or move devices.</p>
        <div class="btn-grp">
          <button class="btn" data-action="export">⬇️ Export backup (JSON)</button>
          <label class="btn" style="cursor:pointer">⬆️ Import backup<input type="file" accept="application/json" data-import hidden></label>
          <button class="btn bad" data-action="reset">🗑️ Reset everything</button>
        </div>
      </div>

      <div class="card mt-lg">
        <div class="card-head"><h3>ℹ️ How the plan works</h3></div>
        <ul class="small muted" style="margin:0;padding-left:18px;line-height:1.8">
          <li><b>Periodization:</b> your timeline is split into Foundation → Application → Testing → Final Prep.</li>
          <li><b>Daily targets</b> are generated from your current phase, interleaving sections for better retention.</li>
          <li><b>CARS + flashcards every day</b> — the two highest-yield daily habits.</li>
          <li><b>Spaced repetition</b> uses the SM-2 algorithm to schedule reviews right before you'd forget.</li>
        </ul>
      </div>`;
  }

  function needSetup() {
    return `<div class="banner warn"><h2>⏳ Set your test date first</h2>
      <p>Your daily targets and periodized plan are generated from your MCAT date.</p>
      <a class="btn primary" href="#/settings">Go to settings →</a></div>`;
  }

  // =======================================================================
  // EVENT HANDLING (delegated)
  // =======================================================================
  function bindEvents() {
    const view = $("#view");

    view.addEventListener("click", (e) => {
      const iso = Store.todayISO();
      const t = e.target.closest("[data-task]");
      if (t) { Store.toggleTask(iso, t.getAttribute("data-task")); return render(); }

      const topic = e.target.closest("[data-topic]");
      if (topic) {
        // toggle coverage by writing to a synthetic day entry keyed under today's log
        const id = "content-" + topic.getAttribute("data-topic");
        const covered = coveredTopicIds().has(topic.getAttribute("data-topic"));
        Store.update((s) => {
          const d = s.dayLog[iso] || (s.dayLog[iso] = { tasks: {}, studied: false, minutes: 0, note: "" });
          if (covered) {
            // unmark: remove from any day
            Object.values(s.dayLog).forEach((dd) => { if (dd.tasks) delete dd.tasks[id]; });
          } else {
            d.tasks[id] = true; d.studied = true;
          }
        });
        return render();
      }

      const app = e.target.closest("[data-app]");
      if (app) {
        const id = app.getAttribute("data-app");
        Store.update((s) => {
          s.appState[id] = s.appState[id] || {};
          s.appState[id].done = !s.appState[id].done;
        });
        return render();
      }

      const fc = e.target.closest("[data-fc]");
      if (fc) {
        const a = fc.getAttribute("data-fc");
        if (a === "reveal") { fcRevealed = true; updateFcStage(); }
        else if (a === "reload") { fcQueue = SRS.dueCards(); fcIndex = 0; fcRevealed = false; updateFcStage(); }
        return;
      }

      const grade = e.target.closest("[data-grade]");
      if (grade && fcQueue && fcQueue[fcIndex]) {
        SRS.review(fcQueue[fcIndex].id, Number(grade.getAttribute("data-grade")));
        // mark flashcard task done for today + record studied
        const d = Store.day(iso); d.studied = true; Store.save();
        fcIndex++; fcRevealed = false;
        updateFcStage();
        // refresh due count in stats area
        const statsRow = $("#view .grid.cols-4");
        if (statsRow) { const s2 = SRS.stats(); statsRow.children[0].querySelector(".num").textContent = s2.dueNow; }
        return;
      }

      const delCard = e.target.closest("[data-del-card]");
      if (delCard) { SRS.deleteCard(delCard.getAttribute("data-del-card")); fcQueue = null; return render(); }

      const delRes = e.target.closest("[data-del-res]");
      if (delRes) {
        const [sec, idx] = delRes.getAttribute("data-del-res").split(":");
        Store.update((s) => { if (s.userResources[sec]) s.userResources[sec].splice(Number(idx), 1); });
        return render();
      }

      const expAdd = e.target.closest("[data-exp-add]");
      if (expAdd) {
        const [k, amt] = expAdd.getAttribute("data-exp-add").split(":");
        Store.update((s) => { s.experiences[k] = (s.experiences[k] || 0) + Number(amt); });
        return render();
      }

      const action = e.target.closest("[data-action]");
      if (action) return handleAction(action.getAttribute("data-action"));

      const saveNote = e.target.closest("[data-save-note]");
      if (saveNote) {
        const ta = $("[data-note]");
        Store.update((s) => { const d = s.dayLog[iso] || (s.dayLog[iso] = { tasks: {}, studied: false, minutes: 0, note: "" }); d.note = ta.value; });
        saveNote.textContent = "Saved ✓";
        setTimeout(() => { saveNote.textContent = "Save note"; }, 1500);
      }
    });

    view.addEventListener("change", (e) => {
      const exp = e.target.closest("[data-exp]");
      if (exp) {
        Store.update((s) => { s.experiences[exp.getAttribute("data-exp")] = Number(exp.value) || 0; });
        return render();
      }
      const imp = e.target.closest("[data-import]");
      if (imp && imp.files[0]) {
        const reader = new FileReader();
        reader.onload = () => { try { Store.import(reader.result); render(); alert("Backup imported."); } catch (x) { alert("Invalid backup file."); } };
        reader.readAsText(imp.files[0]);
      }
    });

    view.addEventListener("submit", (e) => {
      const form = e.target.closest("form[data-form]");
      if (!form) return;
      e.preventDefault();
      const kind = form.getAttribute("data-form");
      const data = Object.fromEntries(new FormData(form).entries());

      if (kind === "settings") {
        Store.update((s) => {
          Object.assign(s.settings, {
            name: data.name, targetScore: Number(data.targetScore) || 515,
            startDate: data.startDate || s.settings.startDate, testDate: data.testDate,
            hoursPerWeekday: Number(data.hoursPerWeekday), hoursPerWeekend: Number(data.hoursPerWeekend),
            restDay: Number(data.restDay)
          });
        });
        location.hash = "#/dashboard";
      } else if (kind === "card") {
        if (data.front && data.back) {
          SRS.addCard({ front: data.front.trim(), back: data.back.trim(), section: data.section, topic: data.topic });
          fcQueue = null; render();
        }
      } else if (kind === "exam") {
        Store.update((s) => {
          s.examScores.push({
            date: data.date || Store.todayISO(), name: data.name,
            cp: num(data.cp), cars: num(data.cars), bb: num(data.bb), ps: num(data.ps),
            total: (num(data.cp) || 0) + (num(data.cars) || 0) + (num(data.bb) || 0) + (num(data.ps) || 0) || null
          });
        });
        render();
      } else if (kind === "res") {
        const sec = form.getAttribute("data-section");
        Store.update((s) => {
          (s.userResources[sec] = s.userResources[sec] || []).push({ title: data.title, url: data.url, channel: "" });
        });
        render();
      }
    });
  }

  function num(v) { return v === "" || v == null ? null : Number(v); }

  function updateFcStage() {
    const stage = $("#fcStage");
    if (stage) stage.innerHTML = renderFcStage();
  }

  function handleAction(action) {
    if (action === "export") {
      const blob = new Blob([Store.export()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mcat-prep-backup-" + Store.todayISO() + ".json";
      a.click();
    } else if (action === "reset") {
      if (confirm("Erase ALL your progress, settings, and flashcard history? This cannot be undone.")) {
        Store.resetAll(); location.hash = "#/dashboard"; render();
      }
    }
  }

  // =======================================================================
  // ROUTER
  // =======================================================================
  const VIEWS = {
    dashboard: viewDashboard, today: viewToday, plan: viewPlan,
    flashcards: viewFlashcards, resources: viewResources, application: viewApplication, settings: viewSettings
  };

  function currentRoute() {
    const r = (location.hash || "#/dashboard").replace("#/", "");
    return ROUTES.includes(r) ? r : "dashboard";
  }

  function render() {
    const route = currentRoute();
    if (route === "flashcards") { /* keep queue across renders unless reset */ }
    else { fcQueue = null; fcIndex = 0; fcRevealed = false; }
    $("#view").innerHTML = VIEWS[route]();
    $("#topbarTitle").textContent = TITLES[route];
    $$("#nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("data-route") === route));
    // top-right countdown
    const sum = Planner.planSummary();
    $("#countdownMini").innerHTML = sum && sum.daysLeft >= 0
      ? `🗓️ <b>${sum.daysLeft}</b> days to MCAT` : "";
    $("#streakCount").textContent = Store.streak();
    $("#sidebar").classList.remove("open");
    window.scrollTo(0, 0);
  }

  function init() {
    bindEvents();
    window.addEventListener("hashchange", render);
    $("#menuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
    if (!location.hash) location.hash = "#/dashboard";
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
