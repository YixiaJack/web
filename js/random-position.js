/* random-position.js — Reposition the decontextualized raster
   image to a different spot on the page each time it loads.

   The page is "Wandering Through the Colorful Streets in Guanajuato",
   so it makes sense for the figure to appear somewhere different
   on every visit — as if she has wandered to a new corner.

   Strategy: pick one of nine regions (a 3×3 grid) using
   Math.random() with an if / else if chain, then add a small
   random jitter inside that region plus a random tilt and a
   random scale. */

(function () {
  // Find the foreground image. The raster page only has one <img>
  // with a srcset, but we still scope to <main> if available.
  var img = document.querySelector("img[srcset]") || document.querySelector("img");
  if (!img) return;

  // Reset the original CSS positioning so JS can take over fully.
  img.style.position  = "fixed";
  img.style.left      = "0";
  img.style.right     = "auto";
  img.style.top       = "0";
  img.style.bottom    = "auto";
  img.style.transform = "none";

  // Pick a region with Math.random + if/else if (assignment requirement).
  var roll = Math.random();
  var region;
  if      (roll < 1 / 9) region = "top-left";
  else if (roll < 2 / 9) region = "top-center";
  else if (roll < 3 / 9) region = "top-right";
  else if (roll < 4 / 9) region = "middle-left";
  else if (roll < 5 / 9) region = "middle-center";
  else if (roll < 6 / 9) region = "middle-right";
  else if (roll < 7 / 9) region = "bottom-left";
  else if (roll < 8 / 9) region = "bottom-center";
  else                    region = "bottom-right";

  // Random scale between 0.6 and 1.0 of the original 30vw width.
  // Math.random() produces [0,1); scale it to [0.6, 1.0).
  var scaleFactor = 0.6 + Math.random() * 0.4;
  var widthVw     = 30 * scaleFactor;
  img.style.width    = widthVw + "vw";
  img.style.height   = "auto";
  img.style.maxWidth = "none";

  // We need real pixel dimensions to keep the figure inside the
  // viewport, so wait for the image to report its natural size.
  function place() {
    var renderedWidth  = img.offsetWidth;
    var renderedHeight = img.offsetHeight;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Anchor coordinates for each region. We give a margin
    // around the edges so the figure never touches the side.
    var margin = Math.min(vw, vh) * 0.04;

    // Horizontal anchor.
    var x;
    if (region.indexOf("left") !== -1) {
      x = margin;
    } else if (region.indexOf("right") !== -1) {
      x = vw - renderedWidth - margin;
    } else {
      x = (vw - renderedWidth) / 2;
    }

    // Vertical anchor.
    var y;
    if (region.indexOf("top") !== -1) {
      y = margin + 80; // leave room for the heading at the top
    } else if (region.indexOf("bottom") !== -1) {
      y = vh - renderedHeight - margin;
    } else {
      y = (vh - renderedHeight) / 2;
    }

    // Add small jitter inside each region so even repeat visits
    // to the same region feel fresh.
    var jitterRange = Math.min(vw, vh) * 0.04;
    x += (Math.random() - 0.5) * jitterRange;
    y += (Math.random() - 0.5) * jitterRange;

    // Clamp inside the viewport just in case.
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + renderedWidth  > vw) x = vw - renderedWidth;
    if (y + renderedHeight > vh) y = vh - renderedHeight;

    // Random tilt — between -12° and +12°, biased toward small angles.
    var tilt = (Math.random() - 0.5) * 24;

    img.style.left      = x + "px";
    img.style.top       = y + "px";
    img.style.transform = "rotate(" + tilt.toFixed(2) + "deg)";
    img.style.transformOrigin = "center center";

    // Update an optional caption with the region name (for debugging
    // / showing off the randomness if the page wants to display it).
    var label = document.getElementById("position-label");
    if (label) {
      label.textContent =
        "Jack wandered to: " + region.replace("-", " ") +
        " (tilt " + tilt.toFixed(0) + "°, scale " + scaleFactor.toFixed(2) + ")";
    }
  }

  // The image may already be cached. If so, place immediately;
  // otherwise wait for it to load so we know its rendered size.
  if (img.complete && img.naturalWidth > 0) {
    place();
  } else {
    img.addEventListener("load", place);
  }

  // Re-place on resize so the layout stays sensible if the user
  // rotates a tablet or resizes the window.
  window.addEventListener("resize", place);
})();
