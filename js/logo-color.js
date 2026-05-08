/* logo-color.js
   Daily theme + class-day SVG repaint.

   The page used to choose the day only once at load time. If the tab stayed
   open across midnight, Monday stayed Monday until refresh. This version keeps
   the same palette logic, schedules one exact local-midnight update, and
   rechecks when the page becomes active again. */

(function () {
  var dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var lastDateKey = "";
  var midnightTimer = null;

  var palettes = [
    {
      element: "Sun",
      zh: "Sun",
      accent: "#e8a13a",
      label: "Sunday - Sun - begin again"
    },
    {
      element: "Moon",
      zh: "Moon",
      accent: "#5b6da3",
      label: "Monday - Moon - quiet focus"
    },
    {
      element: "Fire",
      zh: "Fire",
      accent: "#c93c2c",
      label: "Tuesday - Fire - class day for Introduction to Web Design",
      svg: {
        ocean: "#3a0e1a",
        ringStroke: "#ffd166",
        sun: "#ff6b35",
        sunGlow: "#ff6b3540",
        sunRays: "#ffb347",
        sand: "#e89a4a",
        sandHighlight: "#f5b96e",
        smallSand: "#c97a3a",
        treeTrunk: "#5a2e0a",
        treeLeaf: "#5cb85c",
        treeLeaf2: "#7ed957",
        flowerStem: "#6b2e10",
        flowerLeaf: "#f2a65a",
        flowerLeaf2: "#ffcf6a",
        flowerPetal: "#ff6b6b",
        flowerPetal2: "#ff9f80",
        flowerCenter: "#ffd166",
        seaOatsStem: "#ffd166",
        seaOatsStem2: "#e89a4a",
        seaOatsLeaf: "#f2a65a",
        seaOatsLeaf2: "#ffcf6a",
        seaOatsSeed: "#ffe08a",
        seaOatsSeed2: "#f5b96e",
        initials: "#ffd166"
      }
    },
    {
      element: "Water",
      zh: "Water",
      accent: "#2c6f9c",
      label: "Wednesday - Water - flow through"
    },
    {
      element: "Wood",
      zh: "Wood",
      accent: "#3a8a4e",
      label: "Thursday - Wood - class day for Introduction to Web Design",
      svg: {
        ocean: "#0e2e1c",
        ringStroke: "#a8d59b",
        sun: "#f0e68c",
        sunGlow: "#f0e68c40",
        sunRays: "#ffe680",
        sand: "#8ab06a",
        sandHighlight: "#a8c98a",
        smallSand: "#5e7e44",
        treeTrunk: "#3a5e1a",
        treeLeaf: "#3a8a4e",
        treeLeaf2: "#5cb85c",
        flowerStem: "#2e6f35",
        flowerLeaf: "#4f9d58",
        flowerLeaf2: "#7ecf7a",
        flowerPetal: "#d7f2a8",
        flowerPetal2: "#f0e68c",
        flowerCenter: "#a8d59b",
        seaOatsStem: "#a8d59b",
        seaOatsStem2: "#7aa86a",
        seaOatsLeaf: "#4f9d58",
        seaOatsLeaf2: "#7ecf7a",
        seaOatsSeed: "#d7f2a8",
        seaOatsSeed2: "#c2dfa0",
        initials: "#a8d59b"
      }
    },
    {
      element: "Metal",
      zh: "Metal",
      accent: "#8a8c95",
      label: "Friday - Metal - sharp finish"
    },
    {
      element: "Earth",
      zh: "Earth",
      accent: "#9a6b3f",
      label: "Saturday - Earth - return & rest"
    }
  ];

  function applyTodayMode() {
    var now = new Date();
    var dayIndex = now.getDay();
    var palette = getPalette(dayIndex);
    var isClassDay = dayIndex === 2 || dayIndex === 4;

    window.todayPalette = palette;
    exposeAsCssVars(palette.accent);
    updateCaption(palette);
    updateBodyClasses(dayIndex, isClassDay);

    var svg = document.querySelector("svg.logo");
    if (!svg) return;

    recordOriginalSvgColors(svg);
    restoreSvgColors(svg);

    if (isClassDay && palette.svg) {
      repaintSvg(svg, palette.svg);
    }
  }

  function getPalette(dayIndex) {
    if (dayIndex === 0) return palettes[0];
    if (dayIndex === 1) return palettes[1];
    if (dayIndex === 2) return palettes[2];
    if (dayIndex === 3) return palettes[3];
    if (dayIndex === 4) return palettes[4];
    if (dayIndex === 5) return palettes[5];
    return palettes[6];
  }

  function updateCaption(palette) {
    var caption = document.getElementById("logo-mode");
    if (!caption) return;
    caption.textContent = palette.label;
    caption.style.color = palette.accent;
  }

  function updateBodyClasses(dayIndex, isClassDay) {
    for (var i = 0; i < dayNames.length; i++) {
      document.body.classList.remove("day-" + dayNames[i]);
    }
    document.body.classList.remove("class-day");
    document.body.classList.remove("off-day");

    document.body.classList.add("day-" + dayNames[dayIndex]);
    document.body.classList.add(isClassDay ? "class-day" : "off-day");
  }

  function recordOriginalSvgColors(svg) {
    if (svg.getAttribute("data-original-colors-recorded") === "true") return;

    var nodes = svg.querySelectorAll("[fill], [stroke]");
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].hasAttribute("fill")) {
        nodes[i].setAttribute("data-original-fill", nodes[i].getAttribute("fill"));
      }
      if (nodes[i].hasAttribute("stroke")) {
        nodes[i].setAttribute("data-original-stroke", nodes[i].getAttribute("stroke"));
      }
    }

    svg.setAttribute("data-original-colors-recorded", "true");
  }

  function restoreSvgColors(svg) {
    var nodes = svg.querySelectorAll("[data-original-fill], [data-original-stroke]");
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].hasAttribute("data-original-fill")) {
        nodes[i].setAttribute("fill", nodes[i].getAttribute("data-original-fill"));
      }
      if (nodes[i].hasAttribute("data-original-stroke")) {
        nodes[i].setAttribute("stroke", nodes[i].getAttribute("data-original-stroke"));
      }
    }
  }

  function repaintSvg(svg, p) {
    var ocean = svg.querySelector('circle[cx="150"][cy="150"][r="140"]');
    if (ocean) ocean.setAttribute("fill", p.ocean);

    var ring = svg.querySelector('circle[cx="150"][cy="150"][r="145"]');
    if (ring) ring.setAttribute("stroke", p.ringStroke);

    setFillAll(".sun", p.sun);
    setFillAll(".sun-glow", p.sunGlow);
    setStrokeAll(".sun-rays", p.sunRays);

    var islandShapes = svg.querySelectorAll(".island-shape");
    for (var i = 0; i < islandShapes.length; i++) {
      islandShapes[i].setAttribute("fill", i === 0 ? p.sand : p.smallSand);
    }
    setFillAll(".island-highlight", p.sandHighlight);

    setStrokeAll(".tree-trunk", p.treeTrunk);
    setAlternating(".tree-leaf", "stroke", p.treeLeaf, p.treeLeaf2);

    setStrokeAll(".flower-stem", p.flowerStem);
    setAlternating(".flower-leaf", "fill", p.flowerLeaf, p.flowerLeaf2);
    setAlternating(".flower-petal", "fill", p.flowerPetal, p.flowerPetal2);
    setFillAll(".flower-center", p.flowerCenter);
    setStrokeAll(".flower-center", p.flowerStem);

    setAlternating(".sea-oats-stem", "stroke", p.seaOatsStem, p.seaOatsStem2);
    setAlternating(".sea-oats-leaf", "fill", p.seaOatsLeaf, p.seaOatsLeaf2);
    setAlternating(".sea-oats-panicle ellipse", "fill", p.seaOatsSeed, p.seaOatsSeed2);

    var initials = svg.querySelector("text");
    if (initials) initials.setAttribute("fill", p.initials);
  }

  function setFillAll(selector, color) {
    setAttrAll(selector, "fill", color);
  }

  function setStrokeAll(selector, color) {
    setAttrAll(selector, "stroke", color);
  }

  function setAttrAll(selector, attr, color) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute(attr, color);
    }
  }

  function setAlternating(selector, attr, colorA, colorB) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute(attr, i % 2 === 0 ? colorA : colorB);
    }
  }

  function exposeAsCssVars(accent) {
    var root = document.documentElement;
    root.style.setProperty("--day-accent", accent);
    root.style.setProperty("--day-accent-soft", hexToRgba(accent, 0.12));
    root.style.setProperty("--day-accent-medium", hexToRgba(accent, 0.30));
    root.style.setProperty("--day-accent-strong", hexToRgba(accent, 0.85));
  }

  function hexToRgba(hex, alpha) {
    var h = hex.replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  function getDateKey() {
    var now = new Date();
    return now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
  }

  function applyIfDateChanged() {
    var dateKey = getDateKey();
    if (dateKey === lastDateKey) return;
    lastDateKey = dateKey;
    applyTodayMode();
  }

  function syncTodayMode() {
    applyIfDateChanged();
    scheduleNextMidnightCheck();
  }

  function scheduleNextMidnightCheck() {
    if (midnightTimer) {
      clearTimeout(midnightTimer);
    }

    var now = new Date();
    var next = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1
    );

    midnightTimer = setTimeout(function () {
      syncTodayMode();
    }, next.getTime() - now.getTime());
  }

  function syncWhenVisible() {
    if (document.visibilityState === "visible") {
      syncTodayMode();
    }
  }

  syncTodayMode();

  document.addEventListener("visibilitychange", syncWhenVisible);
  window.addEventListener("focus", syncTodayMode);
  window.addEventListener("pageshow", syncTodayMode);
})();
