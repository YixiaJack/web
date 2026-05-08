/* clock.js
   Rotates the SVG clock hands that are drawn directly in index.html:
   - flower = hour hand
   - sea oats = minute hand
   - palm tree = second hand

   Each hand is drawn in absolute SVG coordinates with its base at
   the clock center, so rotation always uses the same explicit center. */

(function () {
  var CENTER_X = 150;
  var CENTER_Y = 150;

  var hourHand = document.getElementById("hour-hand-flower");
  var minuteHand = document.getElementById("minute-hand-sea-oats");
  var secondHand = document.getElementById("second-hand-tree");

  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function rotateHand(hand, angle) {
    if (!hand) return;
    hand.setAttribute(
      "transform",
      "rotate(" + angle + " " + CENTER_X + " " + CENTER_Y + ")"
    );
  }

  function tick() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var ms = now.getMilliseconds();
    var smoothSeconds = s + ms / 1000;

    rotateHand(hourHand, ((h % 12) + m / 60 + smoothSeconds / 3600) * 30);
    rotateHand(minuteHand, (m + smoothSeconds / 60) * 6);
    rotateHand(secondHand, smoothSeconds * 6);

    var ampm = h >= 12 ? "pm" : "am";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;

    var display = document.getElementById("live-clock");
    if (display) {
      display.textContent = pad2(h12) + ":" + pad2(m) + ":" + pad2(s) + " " + ampm;
    }
  }

  tick();
  requestAnimationFrame(function animate() {
    tick();
    requestAnimationFrame(animate);
  });
})();
