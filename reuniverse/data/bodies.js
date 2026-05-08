// Real NASA / JPL celestial bodies. Public-domain catalog data.
// Used by the demo to assign each idea a real, permanent astronomical identity.

window.REUNIVERSE_BODIES = [
  // Exoplanets
  { catalog: "exoplanet", designation: "Kepler-186f", host: "Kepler-186", distance: "582 ly", note: "First Earth-sized planet found in a habitable zone." },
  { catalog: "exoplanet", designation: "TRAPPIST-1e", host: "TRAPPIST-1", distance: "40 ly", note: "Rocky world inside the habitable zone of an ultra-cool dwarf." },
  { catalog: "exoplanet", designation: "Proxima Centauri b", host: "Proxima Centauri", distance: "4.24 ly", note: "Closest known exoplanet to Earth." },
  { catalog: "exoplanet", designation: "K2-18 b", host: "K2-18", distance: "124 ly", note: "Sub-Neptune with hydrogen-rich atmosphere; possible water vapor." },
  { catalog: "exoplanet", designation: "HD 209458 b", host: "HD 209458", distance: "157 ly", note: "First exoplanet with a detected atmosphere." },
  { catalog: "exoplanet", designation: "GJ 1214 b", host: "GJ 1214", distance: "47 ly", note: "Steamy super-Earth, possibly an ocean world." },

  // Asteroids
  { catalog: "asteroid", designation: "(4) Vesta", host: null, distance: "2.36 AU", note: "Second-largest object in the asteroid belt; visited by Dawn." },
  { catalog: "asteroid", designation: "(153814) 2001 WN5", host: null, distance: "0.97 AU", note: "Near-Earth asteroid, future close approach in 2028." },
  { catalog: "asteroid", designation: "(101955) Bennu", host: null, distance: "1.13 AU", note: "Carbonaceous near-Earth object; OSIRIS-REx returned samples." },
  { catalog: "asteroid", designation: "(433) Eros", host: null, distance: "1.46 AU", note: "First asteroid orbited and landed on by a spacecraft." },
  { catalog: "asteroid", designation: "(99942) Apophis", host: null, distance: "0.92 AU", note: "Notable near-Earth asteroid; close approach in 2029." },
  { catalog: "asteroid", designation: "(243) Ida", host: null, distance: "2.86 AU", note: "First asteroid confirmed to have its own moon, Dactyl." },

  // Comets
  { catalog: "comet", designation: "67P/Churyumov-Gerasimenko", host: null, distance: "var.", note: "Visited by ESA Rosetta mission and the Philae lander." },
  { catalog: "comet", designation: "1P/Halley", host: null, distance: "var.", note: "Most famous periodic comet; returns every 76 years." },
  { catalog: "comet", designation: "C/1995 O1 (Hale-Bopp)", host: null, distance: "var.", note: "Great Comet of 1997; visible to the naked eye for 18 months." },

  // Moons
  { catalog: "moon", designation: "Europa", host: "Jupiter", distance: "5.20 AU", note: "Subsurface ocean candidate for extraterrestrial life." },
  { catalog: "moon", designation: "Enceladus", host: "Saturn", distance: "9.58 AU", note: "Ice geysers eject water from a global subsurface ocean." }
];

// Civilization stages, indexed 0..9. Star thresholds match the architecture spec.
window.REUNIVERSE_STAGES = [
  { id: 0, name: "Pre-life",      threshold: 0,      surface: "Barren rock",                  color: "#3a3a4a" },
  { id: 1, name: "Microbial",     threshold: 1,      surface: "Faint green patches",          color: "#4a6a3a" },
  { id: 2, name: "Multicellular", threshold: 5,      surface: "Vegetation blooms",            color: "#5fa05f" },
  { id: 3, name: "Tribal",        threshold: 25,     surface: "Firelights at night",          color: "#c97a4a" },
  { id: 4, name: "Agrarian",      threshold: 100,    surface: "Patchwork fields",             color: "#d8a850" },
  { id: 5, name: "Industrial",    threshold: 500,    surface: "City lights and chimneys",     color: "#e0c060" },
  { id: 6, name: "Information",   threshold: 2500,   surface: "Global lattice + satellites",  color: "#7fd0ff" },
  { id: 7, name: "Type I",        threshold: 10000,  surface: "Planetary megastructures",     color: "#a78bfa" },
  { id: 8, name: "Type II",       threshold: 50000,  surface: "Partial Dyson swarm",          color: "#f472b6" },
  { id: 9, name: "Type III",      threshold: 250000, surface: "Galaxy-scale civilization",    color: "#fde047" }
];

// Pre-loaded showcase planets (the user's three real ideas).
window.REUNIVERSE_SHOWCASE = [
  {
    title: "ai4math #4",
    summary: "Train a neural net to read a knot diagram and predict the s-invariant directly, targeting 20-30 crossing knots where current Khovanov computations are infeasible.",
    domain: "research",
    tags: ["math", "topology", "ml", "knot-theory"],
    body: { catalog: "exoplanet", designation: "Kepler-186f", host: "Kepler-186", distance: "582 ly" },
    stars: 612,
    stage: 5
  },
  {
    title: "DAW + Score Therapy",
    summary: "Hum two bars. The AI transcribes you to symbolic notation, suggests next moves, picks a track, swaps timbres. A music-therapy modality for patients who can't play live instruments.",
    domain: "health",
    tags: ["music", "therapy", "ai", "accessibility"],
    body: { catalog: "moon", designation: "Enceladus", host: "Saturn", distance: "9.58 AU" },
    stars: 89,
    stage: 3
  },
  {
    title: "Bridge AI Tutor",
    summary: "An English-speaking bridge coach for absolute beginners. Teaches bidding, declarer play, and defense. Searches the web mid-lesson when a convention comes up the student hasn't seen.",
    domain: "education",
    tags: ["bridge", "tutor", "ai", "games"],
    body: { catalog: "asteroid", designation: "(101955) Bennu", host: null, distance: "1.13 AU" },
    stars: 31,
    stage: 3
  }
];
