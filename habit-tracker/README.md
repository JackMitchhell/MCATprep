# ✅ Habit & Sleep Tracker

A simple, two-page habit/goal and sleep tracker. Runs **100% in your browser** —
no accounts, no servers. Your data lives in `localStorage` on your own device.

## Pages

- **Track** (`index.html`) — Add goals for today or this week, log time spent
  (manual entry or a start/stop timer), mark them complete, and log last
  night's sleep (bedtime, wake time, quality). Navigate between days/weeks
  with the arrows.
- **Insights** (`insights.html`) — Charts and stats over a 7/14/30/90-day
  range: time spent per day, goal completion rate, top goals by time,
  hours slept vs. your target, and a sleep-consistency chart plotting
  bedtime/wake time to visualize how regular your schedule is.

## Getting started

Just open `index.html` in a browser — no build step, no dependencies.
To host it (e.g. GitHub Pages), serve the `habit-tracker/` folder as the site root.

## Project structure

```
index.html                  # Track page
insights.html                # Insights page
assets/css/style.css         # shared design system
assets/js/store.js           # localStorage data model
assets/js/charts.js          # dependency-free SVG chart primitives
assets/js/track.js           # Track page logic
assets/js/insights.js        # Insights page logic
```

## Privacy

No analytics, no network calls, no third-party scripts.
