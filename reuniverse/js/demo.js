// Reuniverse demo: publish an idea draft, assign a real celestial body,
// inspect the Surface / Workspace summary, and simulate public attention.

(function () {
  "use strict";

  const BODIES = window.REUNIVERSE_BODIES || [];
  const STAGES = window.REUNIVERSE_STAGES || [];
  const SHOWCASE = window.REUNIVERSE_SHOWCASE || [];
  const GROWTH_TARGETS = [1, 5, 25, 100, 500, 2500, 10000, 50000, 250000];

  const form = document.querySelector("#assign-form");
  const titleInput = document.querySelector("#idea-title");
  const summaryInput = document.querySelector("#idea-summary");
  const cardSection = document.querySelector("#planet-card");
  const planetVisual = cardSection.querySelector(".planet-visual");
  const planetShell = cardSection.querySelector(".planet-shell");
  const cardOrb = cardSection.querySelector(".planet-globe");
  const globeContext = cardOrb.getContext("2d");
  const cardTitle = cardSection.querySelector(".planet-title");
  const cardBodyId = cardSection.querySelector(".body-id");
  const cardCivLine = cardSection.querySelector(".civ-line");
  const cardNote = cardSection.querySelector(".note");
  const stageBadge = cardSection.querySelector("#stage-badge");
  const starCount = cardSection.querySelector(".star-count");
  const vitalityReadout = cardSection.querySelector(".vitality-readout");
  const meterFill = cardSection.querySelector(".meter-fill");
  const starBtn = cardSection.querySelector("#star-btn");
  const simulateBtn = cardSection.querySelector("#simulate-btn");
  const resetBtn = document.querySelector("#reset-btn");
  const closeBtn = cardSection.querySelector("#close-planet-card");
  const tabButtons = cardSection.querySelectorAll('[role="tab"]');
  const tabPanels = cardSection.querySelectorAll('[role="tabpanel"]');
  const epochName = cardSection.querySelector(".epoch-name");
  const syncState = cardSection.querySelector(".sync-state");
  const workspaceLink = cardSection.querySelector("#workspace-link");
  const showcaseGrid = document.querySelector("#showcase-grid");
  const hoverPreview = document.querySelector("#planet-hover-preview");

  let current = null;
  const rotationState = {
    active: false,
    x: -8,
    y: 14,
    lastX: 0,
    lastY: 0
  };
  const globeState = {
    stage: STAGES[0] || { id: 0, color: "#0b3d91" },
    seed: 1,
    frame: 0
  };

  function stringHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function pickBody(seed) {
    if (BODIES.length === 0) return { body: null, index: 0 };
    const index = stringHash(seed) % BODIES.length;
    return { body: BODIES[index], index: index };
  }

  function findBodyIndex(body) {
    const index = BODIES.findIndex(function (item) {
      return item.designation === body.designation;
    });
    return index >= 0 ? index : 0;
  }

  function stageForStars(stars) {
    let result = STAGES[0];
    for (const stage of STAGES) {
      if (stars >= stage.threshold) result = stage;
    }
    return result;
  }

  function nextPublicAttentionTarget(stars) {
    for (const target of GROWTH_TARGETS) {
      if (stars < target) return target;
    }
    return stars + 250000;
  }

  function vitalityFor(stars) {
    if (stars >= 2500) return "High";
    if (stars >= 100) return "Active";
    if (stars >= 1) return "Awake";
    return "Dormant";
  }

  function progressForStage(stage) {
    return Math.min(100, Math.round((stage.id / 9) * 100));
  }

  function hasNativeDialog() {
    return typeof cardSection.showModal === "function" && typeof cardSection.close === "function";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hexToRgb(hex) {
    const value = (hex || "#0b3d91").replace("#", "");
    const full = value.length === 3
      ? value.split("").map(function (char) { return char + char; }).join("")
      : value.padEnd(6, "0").slice(0, 6);
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16)
    };
  }

  function mixRgb(a, b, amount) {
    return {
      r: Math.round(a.r + (b.r - a.r) * amount),
      g: Math.round(a.g + (b.g - a.g) * amount),
      b: Math.round(a.b + (b.b - a.b) * amount)
    };
  }

  function drawGlobe() {
    if (!globeContext) return;

    const width = cardOrb.width;
    const height = cardOrb.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.42;
    const stage = globeState.stage || STAGES[0] || { id: 0, color: "#0b3d91" };
    const stageColor = hexToRgb(stage.color);
    const dark = { r: 8, g: 11, b: 18 };
    const bright = mixRgb(stageColor, { r: 255, g: 157, b: 30 }, 0.34);
    const cool = mixRgb(stageColor, { r: 2, g: 191, b: 231 }, 0.28);
    const seed = globeState.seed * 0.00013;
    const yaw = rotationState.y * Math.PI / 180;
    const pitch = rotationState.x * Math.PI / 180;
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const light = { x: -0.42, y: -0.48, z: 0.76 };
    const image = globeContext.createImageData(width, height);
    const data = image.data;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const dx = (px - centerX) / radius;
        const dy = (py - centerY) / radius;
        const dist = dx * dx + dy * dy;
        const index = (py * width + px) * 4;

        if (dist > 1) {
          data[index + 3] = 0;
          continue;
        }

        const z = Math.sqrt(1 - dist);
        const rotatedY = dy * cosPitch - z * sinPitch;
        const rotatedZ = dy * sinPitch + z * cosPitch;
        const rotatedX = dx;
        const sphereX = rotatedX * cosYaw + rotatedZ * sinYaw;
        const sphereZ = -rotatedX * sinYaw + rotatedZ * cosYaw;
        const sphereY = rotatedY;
        const lon = Math.atan2(sphereZ, sphereX);
        const lat = Math.asin(clamp(sphereY, -1, 1));
        const ridges =
          Math.sin(lon * 3.2 + seed * 19) +
          Math.sin((lon + lat) * 6.4 - seed * 31) * 0.56 +
          Math.cos(lat * 11.5 + lon * 1.7 + seed * 13) * 0.34;
        const belts = Math.sin(lat * 13 + seed * 9) * 0.22;
        const crater = Math.sin(lon * 18.5 + seed * 37) * Math.cos(lat * 15.5 - seed * 23);
        const terrain = ridges + belts + crater * 0.16;
        const highland = terrain > 0.28;
        const mineral = terrain > -0.22;
        let color = highland
          ? mixRgb(stageColor, bright, 0.42)
          : mineral
            ? mixRgb(stageColor, cool, 0.24)
            : mixRgb(dark, stageColor, 0.52);

        if (stage.id >= 4 && Math.abs(Math.sin(lon * 4.5 + seed)) < 0.08) {
          color = mixRgb(color, { r: 255, g: 245, b: 214 }, 0.18);
        }

        if (
          stage.id >= 3 &&
          Math.sin(lon * 43 + seed * 7) * Math.cos(lat * 37 - seed * 4) > 0.88 &&
          z > 0.18
        ) {
          color = mixRgb(color, { r: 255, g: 196, b: 117 }, Math.min(0.58, stage.id / 12));
        }

        const diffuse = clamp(dx * light.x + dy * light.y + z * light.z, 0, 1);
        const limb = Math.pow(z, 0.52);
        const shade = 0.18 + diffuse * 0.82;
        const atmosphere = Math.pow(1 - z, 3.2);
        data[index] = clamp(color.r * shade * limb + stageColor.r * atmosphere * 0.45, 0, 255);
        data[index + 1] = clamp(color.g * shade * limb + stageColor.g * atmosphere * 0.45, 0, 255);
        data[index + 2] = clamp(color.b * shade * limb + stageColor.b * atmosphere * 0.45, 0, 255);
        data[index + 3] = 255;
      }
    }

    globeContext.clearRect(0, 0, width, height);
    globeContext.putImageData(image, 0, 0);

    const highlight = globeContext.createRadialGradient(
      centerX - radius * 0.36,
      centerY - radius * 0.38,
      radius * 0.02,
      centerX - radius * 0.2,
      centerY - radius * 0.3,
      radius * 1.1
    );
    highlight.addColorStop(0, "rgba(255,255,255,0.55)");
    highlight.addColorStop(0.18, "rgba(255,255,255,0.16)");
    highlight.addColorStop(0.62, "rgba(255,255,255,0)");
    globeContext.fillStyle = highlight;
    globeContext.beginPath();
    globeContext.arc(centerX, centerY, radius, 0, Math.PI * 2);
    globeContext.fill();

    const shadow = globeContext.createRadialGradient(
      centerX + radius * 0.46,
      centerY + radius * 0.5,
      radius * 0.1,
      centerX,
      centerY,
      radius * 1.08
    );
    shadow.addColorStop(0, "rgba(0,0,0,0.28)");
    shadow.addColorStop(0.64, "rgba(0,0,0,0.04)");
    shadow.addColorStop(1, "rgba(0,0,0,0.56)");
    globeContext.fillStyle = shadow;
    globeContext.beginPath();
    globeContext.arc(centerX, centerY, radius, 0, Math.PI * 2);
    globeContext.fill();

    globeContext.strokeStyle = "rgba(255,255,255,0.22)";
    globeContext.lineWidth = 2;
    globeContext.beginPath();
    globeContext.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
    globeContext.stroke();
  }

  function requestGlobeDraw() {
    if (globeState.frame) return;
    globeState.frame = window.requestAnimationFrame(function () {
      globeState.frame = 0;
      drawGlobe();
    });
  }

  function applyPlanetRotation() {
    planetShell.style.setProperty("--globe-yaw", rotationState.y + "deg");
    planetShell.style.setProperty("--globe-pitch", rotationState.x + "deg");
    requestGlobeDraw();
  }

  function handlePlanetPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    rotationState.active = true;
    rotationState.lastX = event.clientX;
    rotationState.lastY = event.clientY;
    planetVisual.classList.add("is-rotating");
    if (planetVisual.setPointerCapture) {
      planetVisual.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  }

  function handlePlanetPointerMove(event) {
    if (!rotationState.active) return;
    const deltaX = event.clientX - rotationState.lastX;
    const deltaY = event.clientY - rotationState.lastY;
    rotationState.lastX = event.clientX;
    rotationState.lastY = event.clientY;
    rotationState.y = (rotationState.y + deltaX * 0.42) % 360;
    rotationState.x = clamp(rotationState.x - deltaY * 0.34, -70, 70);
    applyPlanetRotation();
    event.preventDefault();
  }

  function stopPlanetRotation(event) {
    if (!rotationState.active) return;
    rotationState.active = false;
    planetVisual.classList.remove("is-rotating");
    if (
      planetVisual.releasePointerCapture &&
      planetVisual.hasPointerCapture &&
      planetVisual.hasPointerCapture(event.pointerId)
    ) {
      planetVisual.releasePointerCapture(event.pointerId);
    }
  }

  function resetPlanetRotation() {
    rotationState.x = -8;
    rotationState.y = 14;
    applyPlanetRotation();
  }

  function handlePlanetKeydown(event) {
    const step = event.shiftKey ? 18 : 8;
    if (event.key === "ArrowLeft") {
      rotationState.y -= step;
    } else if (event.key === "ArrowRight") {
      rotationState.y += step;
    } else if (event.key === "ArrowUp") {
      rotationState.x = clamp(rotationState.x - step, -70, 70);
    } else if (event.key === "ArrowDown") {
      rotationState.x = clamp(rotationState.x + step, -70, 70);
    } else if (event.key === "Home") {
      resetPlanetRotation();
      event.preventDefault();
      return;
    } else {
      return;
    }
    applyPlanetRotation();
    event.preventDefault();
  }

  function render() {
    if (!current) {
      closePlanetCard();
      return;
    }

    const stage = stageForStars(current.stars);
    const progress = progressForStage(stage);

    cardSection.className = "planet-card stage-" + stage.id;
    cardSection.style.setProperty("--stage-color", stage.color);
    cardTitle.textContent = current.title;
    stageBadge.textContent = "Stage " + stage.id;
    stageBadge.style.borderColor = stage.color;
    stageBadge.style.color = stage.color;
    starCount.textContent = current.stars + " public star" + (current.stars === 1 ? "" : "s");
    vitalityReadout.textContent = vitalityFor(current.stars);
    meterFill.style.width = progress + "%";

    renderIdentity();
    renderSurface(stage);
    renderWorkspaceSummary(stage);
    renderStarButton();
  }

  function renderIdentity() {
    cardBodyId.innerHTML = "";

    const label = document.createElement("span");
    label.className = "identity-label";
    label.textContent = current.body.catalog + " identity";

    const designation = document.createElement("strong");
    designation.textContent = current.body.designation;

    const detail = document.createElement("span");
    detail.className = "body-detail";
    detail.textContent = current.body.host
      ? "host: " + current.body.host + " / " + current.body.distance
      : current.body.distance;

    const note = document.createElement("span");
    note.className = "body-note";
    note.textContent = current.body.note || "Catalog identity is permanent.";

    cardBodyId.appendChild(label);
    cardBodyId.appendChild(designation);
    cardBodyId.appendChild(detail);
    cardBodyId.appendChild(note);
  }

  function renderSurface(stage) {
    const next = nextStageInfo(current.stars);
    const progressNote = next
      ? formatNumber(current.stars) + " / " + formatNumber(next.threshold) + " to " + next.name
      : "Apex of the ladder";

    cardCivLine.innerHTML =
      '<span class="civ-chip" role="group" aria-label="Civilization stage">' +
        '<span class="civ-dot" aria-hidden="true"></span>' +
        '<span class="civ-meta">' +
          '<span class="civ-eyebrow">Civilization stage</span>' +
          '<span class="civ-stage-name">' + escapeText(stage.name) + '</span>' +
        '</span>' +
        '<span class="civ-progress">' + escapeText(progressNote) + '</span>' +
      '</span>';

    cardNote.textContent =
      stage.surface + ". The real body stays fixed; public attention changes the civilization layer.";
    globeState.stage = stage;
    globeState.seed = stringHash(current.title + "|" + current.body.designation);
    cardOrb.className = "planet-globe stage-" + stage.id;
    drawGlobe();
  }

  function nextStageInfo(stars) {
    for (const s of STAGES) {
      if (stars < s.threshold) return s;
    }
    return null;
  }

  function formatNumber(n) {
    return Number(n).toLocaleString("en-US");
  }

  function escapeText(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderWorkspaceSummary(stage) {
    if (stage.id >= 5) {
      epochName.textContent = "Industrial Epoch / First MVP";
      syncState.textContent = "Roadmap ready";
    } else if (stage.id >= 3) {
      epochName.textContent = "Tribal Epoch / Repo Binding";
      syncState.textContent = "GitHub binding unlocked";
    } else if (stage.id >= 2) {
      epochName.textContent = "Multicellular Epoch / First Board";
      syncState.textContent = "Native workspace active";
    } else {
      epochName.textContent = "Pre-life Draft";
      syncState.textContent = "Workspace unlocks at Stage 2";
    }
    workspaceLink.href = buildWorkspaceUrl();
  }

  function buildWorkspaceUrl() {
    const params = new URLSearchParams();
    params.set("title", current.title);
    params.set("summary", current.summary || "");
    params.set("body", String(current.bodyIndex));
    params.set("stars", String(current.stars));
    return "workspace.html?" + params.toString();
  }

  function renderStarButton() {
    starBtn.textContent = current.starred ? "Starred as visitor" : "Star as visitor";
    starBtn.disabled = current.starred;
    starBtn.setAttribute("aria-pressed", current.starred ? "true" : "false");
  }

  function flashStageAdvance(stage) {
    if (!cardOrb.animate) return;
    cardOrb.animate(
      [
        { transform: "scale(1) rotate(0deg)", filter: "brightness(1)" },
        { transform: "scale(1.08) rotate(10deg)", filter: "brightness(1.35)" },
        { transform: "scale(1) rotate(0deg)", filter: "brightness(1)" }
      ],
      { duration: 860, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    meterFill.animate(
      [
        { boxShadow: "0 0 0 rgba(255,255,255,0)" },
        { boxShadow: "0 0 28px " + stage.color },
        { boxShadow: "0 0 0 rgba(255,255,255,0)" }
      ],
      { duration: 860, easing: "ease-out" }
    );
  }

  function handleAssign(event) {
    event.preventDefault();
    const title = (titleInput.value || "").trim();
    const summary = (summaryInput.value || "").trim();
    if (!title) {
      titleInput.focus();
      return;
    }

    const assignment = pickBody(title + "|" + summary);
    current = {
      title: title,
      summary: summary,
      body: assignment.body,
      bodyIndex: assignment.index,
      stars: 0,
      starred: false
    };
    activateTab("surface-tab");
    render();
    openPlanetCard();
  }

  function handleStar() {
    if (!current || current.starred) return;
    const before = stageForStars(current.stars);
    current.starred = true;
    current.stars += 1;
    const after = stageForStars(current.stars);
    render();
    if (after.id > before.id) flashStageAdvance(after);
  }

  function handleSimulate() {
    if (!current) return;
    const before = stageForStars(current.stars);
    current.stars = nextPublicAttentionTarget(current.stars);
    const after = stageForStars(current.stars);
    render();
    if (after.id > before.id) flashStageAdvance(after);
  }

  function handleReset() {
    current = null;
    titleInput.value = "";
    summaryInput.value = "";
    render();
    titleInput.focus();
  }

  function loadShowcase(planet) {
    current = {
      title: planet.title,
      summary: planet.summary,
      body: planet.body,
      bodyIndex: findBodyIndex(planet.body),
      stars: planet.stars,
      starred: false
    };
    titleInput.value = planet.title;
    summaryInput.value = planet.summary;
    activateTab("surface-tab");
    render();
    openPlanetCard();
  }

  function openPlanetCard() {
    if (hasNativeDialog()) {
      if (!cardSection.open) cardSection.showModal();
    } else {
      cardSection.hidden = false;
      cardSection.setAttribute("open", "");
    }
    document.body.classList.add("planet-modal-open");
    closeBtn.focus();
  }

  function closePlanetCard() {
    if (hasNativeDialog()) {
      if (cardSection.open) cardSection.close();
    } else {
      cardSection.hidden = true;
      cardSection.removeAttribute("open");
    }
    document.body.classList.remove("planet-modal-open");
  }

  function activateTab(tabId) {
    tabButtons.forEach(function (tab) {
      const selected = tab.id === tabId;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
    });

    tabPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("aria-labelledby") !== tabId;
    });
  }

  function handleTabClick(event) {
    activateTab(event.currentTarget.id);
  }

  function handleTabKeydown(event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const tabs = Array.from(tabButtons);
    const currentIndex = tabs.indexOf(event.currentTarget);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex].id);
  }

  function renderShowcase() {
    if (!showcaseGrid) return;
    SHOWCASE.forEach(function (planet) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "showcase";
      card.setAttribute("aria-label", "Load showcase planet: " + planet.title);

      const orb = document.createElement("span");
      orb.className = "showcase-mini";
      orb.style.background =
        "radial-gradient(circle at 35% 30%, " +
        STAGES[planet.stage].color + " 0%, #2a2c45 60%, #0a0c1a 100%)";
      card.appendChild(orb);

      const title = document.createElement("span");
      title.className = "showcase-title";
      title.textContent = planet.title;
      card.appendChild(title);

      const summary = document.createElement("span");
      summary.className = "showcase-copy";
      summary.textContent = planet.summary;
      card.appendChild(summary);

      const meta = document.createElement("span");
      meta.className = "showcase-meta";
      meta.textContent =
        planet.body.designation + " - " + planet.stars + " stars - Stage " + planet.stage;
      card.appendChild(meta);

      card.addEventListener("click", function () { loadShowcase(planet); });
      card.addEventListener("mouseenter", function (event) { showPlanetPreview(planet, event); });
      card.addEventListener("mousemove", function (event) { movePlanetPreview(event); });
      card.addEventListener("mouseleave", hidePlanetPreview);
      card.addEventListener("focus", function (event) { showPlanetPreview(planet, event); });
      card.addEventListener("blur", hidePlanetPreview);
      showcaseGrid.appendChild(card);
    });
  }

  function showPlanetPreview(planet, event) {
    if (!hoverPreview) return;
    const stage = STAGES[planet.stage] || STAGES[0];
    hoverPreview.innerHTML = "";

    const eyebrow = document.createElement("span");
    eyebrow.className = "preview-eyebrow";
    eyebrow.textContent = "Planet preview";

    const title = document.createElement("strong");
    title.textContent = planet.title;

    const body = document.createElement("span");
    body.textContent = planet.body.designation + " / Stage " + stage.id + " " + stage.name;

    const signal = document.createElement("span");
    signal.textContent = planet.stars + " public stars";

    hoverPreview.appendChild(eyebrow);
    hoverPreview.appendChild(title);
    hoverPreview.appendChild(body);
    hoverPreview.appendChild(signal);
    hoverPreview.hidden = false;
    movePlanetPreview(event);
  }

  function movePlanetPreview(event) {
    if (!hoverPreview || hoverPreview.hidden) return;
    const rect = event.currentTarget && event.currentTarget.getBoundingClientRect
      ? event.currentTarget.getBoundingClientRect()
      : null;
    const pointerX = Number.isFinite(event.clientX) ? event.clientX : (rect ? rect.right : 24);
    const pointerY = Number.isFinite(event.clientY) ? event.clientY : (rect ? rect.top : 24);
    const x = Math.max(12, Math.min(pointerX + 18, window.innerWidth - 294));
    const y = Math.max(12, Math.min(pointerY + 18, window.innerHeight - 168));
    hoverPreview.style.left = x + "px";
    hoverPreview.style.top = y + "px";
  }

  function hidePlanetPreview() {
    if (!hoverPreview) return;
    hoverPreview.hidden = true;
  }

  form.addEventListener("submit", handleAssign);
  starBtn.addEventListener("click", handleStar);
  simulateBtn.addEventListener("click", handleSimulate);
  resetBtn.addEventListener("click", handleReset);
  closeBtn.addEventListener("click", closePlanetCard);
  cardSection.addEventListener("click", function (event) {
    if (event.target === cardSection) closePlanetCard();
  });
  cardSection.addEventListener("close", function () {
    document.body.classList.remove("planet-modal-open");
  });
  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      !cardSection.open &&
      document.body.classList.contains("planet-modal-open")
    ) {
      closePlanetCard();
    }
  });
  tabButtons.forEach(function (tab) {
    tab.addEventListener("click", handleTabClick);
    tab.addEventListener("keydown", handleTabKeydown);
  });

  // Spotlight hover: track pointer position on tabs and the close button
  // and expose it as CSS custom properties for the radial-gradient ::before.
  function trackSpotlight(event) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", x + "%");
    el.style.setProperty("--my", y + "%");
  }
  function resetSpotlight(event) {
    const el = event.currentTarget;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }
  const spotlightTargets = [closeBtn].concat(Array.from(tabButtons));
  spotlightTargets.forEach(function (el) {
    if (!el) return;
    el.addEventListener("pointermove", trackSpotlight);
    el.addEventListener("pointerleave", resetSpotlight);
  });
  planetVisual.addEventListener("pointerdown", handlePlanetPointerDown);
  planetVisual.addEventListener("pointermove", handlePlanetPointerMove);
  planetVisual.addEventListener("pointerup", stopPlanetRotation);
  planetVisual.addEventListener("pointercancel", stopPlanetRotation);
  planetVisual.addEventListener("lostpointercapture", stopPlanetRotation);
  planetVisual.addEventListener("dblclick", resetPlanetRotation);
  planetVisual.addEventListener("keydown", handlePlanetKeydown);
  applyPlanetRotation();
  renderShowcase();
  if (!hasNativeDialog()) {
    cardSection.hidden = true;
  }
})();
