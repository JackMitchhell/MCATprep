# 🧬 MCAT & Med School Prep Tracker

A personal, **periodized day-to-day MCAT study tracker** with spaced-repetition
flashcards, auto-generated daily targets, curated free resources, and a full
med-school application checklist.

Everything runs **100% in your browser** — no accounts, no servers, no tracking.
Your data lives in `localStorage` on your own device. It works offline and can
be hosted for free on GitHub Pages.

---

## ✨ Features

| Area | What it does |
|------|--------------|
| **📊 Dashboard** | Countdown to test day, current phase, per-section content-coverage rings, study streak, practice-exam score log, a 16-week activity heatmap, plus **CARS pacing** and **study-log/mood trend** cards (with sparklines) pulled from your timer and journal. |
| **🎯 Today** | Auto-generated daily targets for your current phase — content review, daily CARS, flashcards, practice, and full-lengths — each with one-tap resource links. Check items off as you go. |
| **🗓️ Study Plan** | A periodized roadmap split into **Foundation → Application → Testing → Final Prep**, generated from your test date. Full content checklist across all four AAMC sections. |
| **🔁 Flashcards** | Spaced repetition using the **SM-2 algorithm** (the same one Anki is based on). Ships with a high-yield seed deck; add your own cards, or **import/export Anki decks** (plain-text/CSV). |
| **⏱️ CARS Timer** | A passage-pacing timer tuned to the real exam (9 passages / 90 min ≈ 10 min each). Logs per-passage splits and accuracy, flags over-target passages, and tracks your pacing across sessions. Saving a session auto-completes today's CARS target. |
| **📓 Journal** | Daily reflections with study minutes, a mood check-in, and per-section confidence ratings (1–5), plus a **confidence & study-hours trend chart** (sparkline per section). Edit/delete past entries and watch your confidence and hours build over time. |
| **📚 Resources** | Curated **free** content — Khan Academy, top YouTube channels, Jack Westin CARS, and official AAMC material — mapped to every topic. Save your own links too. |
| **🏥 Application** | The full AMCAS cycle as a checklist (experiences, LORs, personal statement, secondaries, interviews) plus clinical/shadowing/research hour trackers. |
| **⚙️ Settings** | Set your test date, study hours, and rest day. Export/import a JSON backup to move between devices. |

## 🧠 How the plan works

- **Periodization** — your timeline (start date → test date) is divided into four
  phases. Each phase changes what your daily targets emphasize.
- **Daily targets** interleave the four sections (better retention than blocking
  one subject at a time) and always include **CARS practice + flashcards**, the
  two highest-yield daily habits.
- **Spaced repetition** schedules each flashcard's next review right before you'd
  forget it, so review time scales with difficulty, not deck size.

## 🚀 Getting started

### Option A — just open it
Double-click `index.html`. That's it. (No build step, no dependencies.)

### Option B — host it free on GitHub Pages
1. Push this repo to GitHub.
2. **Settings → Pages → Build from branch →** pick your branch and `/ (root)`.
3. Visit the published URL on any device.

> Note: each device/browser keeps its own data. Use **Settings → Export/Import**
> to move your progress between devices.

### First run
1. Open the app and go to **Settings**.
2. Enter your **MCAT test date** (and optionally a start date, target score, and
   weekly rest day).
3. Head to **Today** — your daily targets are ready.

## 🗂️ Project structure

```
index.html                     # app shell + script includes
assets/css/styles.css          # design system / all styling
assets/js/
  store.js                     # localStorage state management
  srs.js                       # SM-2 spaced repetition engine
  planner.js                   # periodization + daily target generator
  app.js                       # router + all views + event handling
  data/
    curriculum.js              # AAMC content map + curated resources
    flashcards.js              # seed flashcard deck (+ Anki import/export)
    checklist.js               # med-school application roadmap
```

## 🔒 Privacy

No analytics, no network calls for your data, no third-party scripts. Resource
links open official sites / YouTube in a new tab when you choose to click them.

## ⚠️ Disclaimer

This is a personal study-organization tool. Content resources point to free
third-party material; always verify against **official AAMC** guidance and
materials. Not affiliated with the AAMC.

---

*Built as a single-page static app — vanilla JS, no framework, no build step.*
