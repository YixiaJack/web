/* daily.js — 七曜 (seven luminaries) daily content for the portfolio page.
   Each day of the week is mapped to one of the seven elements
   in the East-Asian seven-day system: 日月火水木金土
   (Sun, Moon, Fire, Water, Wood, Metal, Earth).
   The page picks today's element, swaps in themed copy, a featured
   course, an accent color, and a class-day badge for Tue/Thu. */

(function () {
  var today = new Date();
  var dayIndex = today.getDay(); // 0 = Sunday … 6 = Saturday

  // Seven luminaries — one record per day of the week.
  var elements = [
    {
      // Sunday — 日 Sun
      symbol: "☀️",
      zh: "日曜",            // 日曜
      en: "Sun",
      motto: "始 — Begin again",
      greeting: "Sunday — a clean page in front of you",
      reflection: "On the day of the Sun, return to the foundations — the things that make every other idea possible.",
      course: "Honors Calculus",
      courseNote: "The bedrock of every math course that comes after it. A fitting place to start the week.",
      accent: "#e8a13a",
      bg: "#fff4e0"
    },
    {
      // Monday — 月 Moon
      symbol: "🌙",
      zh: "月曜",            // 月曜
      en: "Moon",
      motto: "静 — Quiet focus",
      greeting: "Monday — work in the soft, early light",
      reflection: "On the day of the Moon, the abstract wins. The proofs that only show themselves when the room is quiet.",
      course: "Complex Variable",
      courseNote: "Quiet, elegant, almost lunar. A course that rewards patience over speed.",
      accent: "#5b6da3",
      bg: "#eceff7"
    },
    {
      // Tuesday — 火 Fire (CLASS DAY for Web Design)
      symbol: "🔥",
      zh: "火曜",            // 火曜
      en: "Fire",
      motto: "动 — Move with intent",
      greeting: "Tuesday — web design class day; ship something",
      reflection: "On the day of Fire, build. The internet rewards the people who turn ideas into pages while the spark is still hot.",
      course: "Introduction to Web Design and Computer Principles",
      courseNote: "Class day. Today the page you are reading is itself the homework — fitting.",
      accent: "#c93c2c",
      bg: "#fbe6e2",
      isClassDay: true
    },
    {
      // Wednesday — 水 Water
      symbol: "💧",
      zh: "水曜",            // 水曜
      en: "Water",
      motto: "流 — Flow through",
      greeting: "Wednesday — let the work move at its own pace",
      reflection: "On the day of Water, follow the gradient. Heat and waves and probability all move toward the same kind of equilibrium.",
      course: "Partial Differential Equations",
      courseNote: "The course is literally about how things flow — heat, waves, populations. Today’s element matches.",
      accent: "#2c6f9c",
      bg: "#e0eef7"
    },
    {
      // Thursday — 木 Wood (CLASS DAY for Web Design)
      symbol: "🌱",
      zh: "木曜",            // 木曜
      en: "Wood",
      motto: "長 — Grow steadily",
      greeting: "Thursday — web design class day; iterate, don’t restart",
      reflection: "On the day of Wood, growth comes from compounding small commits. A model is not trained in one epoch.",
      course: "Foundations of Machine Learning",
      courseNote: "Models grow the way trees do — a little every iteration, in roughly the right direction.",
      accent: "#3a8a4e",
      bg: "#e4f2e6",
      isClassDay: true
    },
    {
      // Friday — 金 Metal
      symbol: "✨",
      zh: "金曜",            // 金曜
      en: "Metal",
      motto: "鋭 — Sharp finish",
      greeting: "Friday — close the loops you opened on Monday",
      reflection: "On the day of Metal, precision matters. An algebra proof either holds or it doesn’t — a clean place to end the week.",
      course: "Honors Algebra",
      courseNote: "All structure, no slack. The kind of clarity that feels good on a Friday.",
      accent: "#8a8c95",
      bg: "#eef0f3"
    },
    {
      // Saturday — 土 Earth
      symbol: "🍄",
      zh: "土曜",            // 土曜
      en: "Earth",
      motto: "歸 — Return & rest",
      greeting: "Saturday — step back and look at the whole system",
      reflection: "On the day of Earth, zoom out. Atmospheres and climates remind you that the system you’re part of is older and slower than your week.",
      course: "Foundamental Dynamics of Earth’s Atmosphere and Climate",
      courseNote: "A course about the planet itself. Saturdays are the right size for thinking that big.",
      accent: "#9a6b3f",
      bg: "#f3e9dc"
    }
  ];

  // Pick today's element. The if / else if chain below makes the
  // decision structure explicit (assignment requirement), even
  // though we could also index directly into the array.
  var todayData;
  if (dayIndex === 0)        todayData = elements[0];
  else if (dayIndex === 1)   todayData = elements[1];
  else if (dayIndex === 2)   todayData = elements[2];
  else if (dayIndex === 3)   todayData = elements[3];
  else if (dayIndex === 4)   todayData = elements[4];
  else if (dayIndex === 5)   todayData = elements[5];
  else                        todayData = elements[6];

  // Helper: set text content if the element exists.
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  setText("daily-symbol",     todayData.symbol);
  setText("daily-element-zh", todayData.zh);
  setText("daily-element-en", todayData.en);
  setText("daily-greeting",   todayData.greeting);
  setText("daily-motto",      todayData.motto);
  setText("daily-reflection", todayData.reflection);
  setText("daily-course",     todayData.course);
  setText("daily-note",       todayData.courseNote);

  // Class-day badge — only shown on Tue and Thu.
  var badge = document.getElementById("daily-class-day");
  if (badge) {
    if (todayData.isClassDay) {
      badge.textContent = "Today is Introduction to Web Design class day.";
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  // Apply themed accent color via CSS custom properties so the
  // entire card retints in one shot.
  var card = document.getElementById("daily-card");
  if (card) {
    card.style.setProperty("--daily-accent", todayData.accent);
    card.style.setProperty("--daily-bg",     todayData.bg);
  }

  // Also add the day name as a class on <body> so any other
  // styles can react to it if they want to.
  var dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  document.body.classList.add("day-" + dayNames[dayIndex]);
})();
