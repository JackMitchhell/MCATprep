/* charts.js — tiny dependency-free SVG chart primitives. */
(function () {
  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(v)));
    const norm = v / mag;
    let step;
    if (norm <= 1) step = 1;
    else if (norm <= 2) step = 2;
    else if (norm <= 5) step = 5;
    else step = 10;
    return step * mag;
  }

  function clearAndBuild(container, width, height) {
    container.innerHTML = "";
    const svg = el("svg", { class: "chart", viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "xMidYMid meet" }, container);
    return svg;
  }

  /* ---- Bar chart: one value per label, optional dashed target line ---- */
  function renderBarChart(container, opts) {
    const { labels, values, color, target, unit = "", height = 200 } = opts;
    const n = Math.max(labels.length, 1);
    const width = Math.max(n * 44, 320);
    const padL = 34, padR = 12, padT = 22, padB = 30;
    const plotW = width - padL - padR, plotH = height - padT - padB;
    const svg = clearAndBuild(container, width, height);

    const maxVal = niceMax(Math.max(...values, target || 0, 1));
    const barW = Math.min(28, (plotW / n) * 0.6);

    // gridlines + y labels
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = padT + plotH - (plotH * i) / steps;
      const v = (maxVal * i) / steps;
      el("line", { x1: padL, x2: width - padR, y1: y, y2: y, stroke: "var(--border)", "stroke-width": 1 }, svg);
      const t = el("text", { x: padL - 6, y: y + 3, "text-anchor": "end", class: "faint", "font-size": 10, fill: "var(--faint)" }, svg);
      t.textContent = Math.round(v * 10) / 10;
    }

    if (target) {
      const ty = padT + plotH - (plotH * target) / maxVal;
      el("line", { x1: padL, x2: width - padR, y1: ty, y2: ty, stroke: "var(--warn)", "stroke-width": 1.5, "stroke-dasharray": "5,4" }, svg);
    }

    labels.forEach((lab, i) => {
      const cx = padL + (plotW / n) * (i + 0.5);
      const v = values[i] || 0;
      const barH = maxVal ? (v / maxVal) * plotH : 0;
      const bx = cx - barW / 2;
      const by = padT + plotH - barH;
      el("rect", { x: bx, y: by, width: barW, height: Math.max(barH, v > 0 ? 2 : 0), rx: 4, fill: color || "var(--primary)" }, svg);
      const tt = el("text", { x: cx, y: padT + plotH + 16, "text-anchor": "middle", "font-size": 10, fill: "var(--faint)" }, svg);
      tt.textContent = lab;
      if (v > 0) {
        const vt = el("text", { x: cx, y: by - 8, "text-anchor": "middle", "font-size": 9.5, fill: "var(--muted)" }, svg);
        vt.textContent = unit ? `${v}${unit}` : v;
      }
    });
    return svg;
  }

  /* ---- Line chart: multiple series sharing a 0..yMax axis ---- */
  function renderLineChart(container, opts) {
    const { labels, series, yMax, height = 200, yFormat } = opts;
    const n = Math.max(labels.length, 1);
    const width = Math.max(n * 44, 320);
    const padL = 38, padR = 14, padT = 14, padB = 30;
    const plotW = width - padL - padR, plotH = height - padT - padB;
    const svg = clearAndBuild(container, width, height);

    const allVals = series.flatMap((s) => s.values);
    const maxVal = yMax || niceMax(Math.max(...allVals, 1));

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = padT + plotH - (plotH * i) / steps;
      const v = (maxVal * i) / steps;
      el("line", { x1: padL, x2: width - padR, y1: y, y2: y, stroke: "var(--border)", "stroke-width": 1 }, svg);
      const t = el("text", { x: padL - 6, y: y + 3, "text-anchor": "end", "font-size": 10, fill: "var(--faint)" }, svg);
      t.textContent = yFormat ? yFormat(v) : Math.round(v);
    }

    const xAt = (i) => padL + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1));

    series.forEach((s) => {
      const pts = s.values.map((v, i) => `${xAt(i)},${padT + plotH - (maxVal ? (v / maxVal) * plotH : 0)}`);
      el("polyline", { points: pts.join(" "), fill: "none", stroke: s.color, "stroke-width": 2.2, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
      s.values.forEach((v, i) => {
        el("circle", { cx: xAt(i), cy: padT + plotH - (maxVal ? (v / maxVal) * plotH : 0), r: 3, fill: s.color }, svg);
      });
    });

    labels.forEach((lab, i) => {
      if (n > 14 && i % Math.ceil(n / 14) !== 0) return;
      const t = el("text", { x: xAt(i), y: padT + plotH + 16, "text-anchor": "middle", "font-size": 10, fill: "var(--faint)" }, svg);
      t.textContent = lab;
    });
    return svg;
  }

  /* ---- Sleep consistency: bedtime/wake plotted on a clock-time axis ---- */
  function clockLabel(minutesSinceNoon) {
    const total = ((720 + minutesSinceNoon) % 1440 + 1440) % 1440;
    let hh = Math.floor(total / 60);
    const mm = total % 60;
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12; if (hh === 0) hh = 12;
    return `${hh}${mm ? ":" + String(mm).padStart(2, "0") : ""}${ampm}`;
  }

  function renderSleepTimeChart(container, opts) {
    const { labels, bedtimes, wakes, height = 220 } = opts;
    const n = Math.max(labels.length, 1);
    const width = Math.max(n * 44, 320);
    const padL = 46, padR = 14, padT = 14, padB = 30;
    const plotW = width - padL - padR, plotH = height - padT - padB;
    const svg = clearAndBuild(container, width, height);

    const yMin = 300, yMax = 1200; // roughly 5pm .. midnight+12h(noon) window
    const scaleY = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const v = yMin + ((yMax - yMin) * i) / steps;
      const y = scaleY(v);
      el("line", { x1: padL, x2: width - padR, y1: y, y2: y, stroke: "var(--border)", "stroke-width": 1 }, svg);
      const t = el("text", { x: padL - 6, y: y + 3, "text-anchor": "end", "font-size": 9.5, fill: "var(--faint)" }, svg);
      t.textContent = clockLabel(v);
    }

    const xAt = (i) => padL + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1));

    function drawSeries(values, color) {
      const pts = [];
      values.forEach((v, i) => { if (v != null) pts.push([xAt(i), scaleY(v)]); });
      const line = pts.map((p) => p.join(",")).join(" ");
      el("polyline", { points: line, fill: "none", stroke: color, "stroke-width": 2.2, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
      values.forEach((v, i) => {
        if (v == null) return;
        el("circle", { cx: xAt(i), cy: scaleY(v), r: 3, fill: color }, svg);
      });
    }
    drawSeries(bedtimes, "var(--sleep)");
    drawSeries(wakes, "var(--accent)");

    labels.forEach((lab, i) => {
      if (n > 14 && i % Math.ceil(n / 14) !== 0) return;
      const t = el("text", { x: xAt(i), y: padT + plotH + 16, "text-anchor": "middle", "font-size": 10, fill: "var(--faint)" }, svg);
      t.textContent = lab;
    });
    return svg;
  }

  /* ---- Horizontal bar (top tasks by time) ---- */
  function renderHBarChart(container, opts) {
    const { labels, values, color, unit = "m" } = opts;
    const n = Math.max(labels.length, 1);
    const rowH = 28;
    const padL = 4, padR = 50, padT = 6;
    const width = 520;
    const height = padT + n * rowH + 6;
    const svg = clearAndBuild(container, width, height);
    const maxVal = niceMax(Math.max(...values, 1));
    const barMaxW = width - padL - padR - 130;

    labels.forEach((lab, i) => {
      const y = padT + i * rowH;
      const v = values[i] || 0;
      const w = maxVal ? (v / maxVal) * barMaxW : 0;
      const labelT = el("text", { x: padL, y: y + rowH / 2 + 4, "font-size": 11.5, fill: "var(--text)" }, svg);
      labelT.textContent = lab.length > 20 ? lab.slice(0, 19) + "…" : lab;
      el("rect", { x: 130, y: y + 5, width: Math.max(w, v > 0 ? 3 : 0), height: rowH - 12, rx: 4, fill: color || "var(--primary)" }, svg);
      const vt = el("text", { x: 130 + Math.max(w, 3) + 8, y: y + rowH / 2 + 4, "font-size": 11, fill: "var(--muted)" }, svg);
      vt.textContent = `${v}${unit}`;
    });
    return svg;
  }

  window.Charts = { renderBarChart, renderLineChart, renderSleepTimeChart, renderHBarChart, clockLabel };
})();
