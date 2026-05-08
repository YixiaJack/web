/* main.js
 *
 * Powers the interactive JEPA architecture diagram on
 * architecture.html. Each labelled box in the SVG is wrapped
 * in a <g class="jepa-part" data-part="encoder"> ... </g>; this
 * script wires those groups up to two kinds of DOM events:
 *
 *   1. click → selectComponent(): updates the description panel
 *      (page CONTENT change) and adds the .is-active class to
 *      the chosen group (CSS PROPERTY change via class swap —
 *      style.css restyles fill, stroke, and stroke-width when
 *      .is-active is present).
 *
 *   2. mouseenter → previewComponent(): adds the .is-hover class
 *      so the box receives a brighter background while the
 *      pointer is over it. mouseleave clears it.
 *
 * Two distinct DOM queries are used:
 *   - document.querySelectorAll('.jepa-part') for the boxes
 *   - document.getElementById('diagram-info') for the panel
 *
 * The descriptions live as a data dictionary inside this file
 * rather than in the HTML, so the panel is rebuilt purely from
 * JavaScript on each click — that is the "update page content"
 * step the assignment asks for.
 */

(function () {
  // Per-component descriptions. Keyed by the data-part attribute.
  var DESCRIPTIONS = {
    'context-encoder': {
      title: 'Context Encoder  f_θ(x)',
      body:
        'Takes the visible context — for I-JEPA, a single block of an image; for V-JEPA, a clip of video — and maps it into an abstract representation s_x. Crucially, it does NOT try to reconstruct pixels. Yann LeCun argues that wasting capacity on pixel-level detail is exactly what makes generative models inefficient world models.'
    },
    'predictor': {
      title: 'Predictor  g_φ(s_x, z)',
      body:
        'Given the context representation s_x and a small latent variable z that encodes "where" the prediction should land, the predictor outputs ŝ_y — its guess at the target representation. This is the only module that does any forecasting; the encoders are only feature extractors. Predicting in representation space is the central JEPA idea.'
    },
    'target-encoder': {
      title: 'Target Encoder  f_ξ(y)',
      body:
        'Encodes the target portion y (a different image block, or a future video clip) into s_y. In I-JEPA and V-JEPA the target encoder is an exponential-moving-average (EMA) copy of the context encoder, with no gradient flow. This asymmetry — student predicts, teacher provides stable targets — is what prevents the network from collapsing to a trivial solution.'
    },
    'energy': {
      title: 'Energy / Loss  D(ŝ_y, s_y)',
      body:
        'The training objective is simply the distance between the predicted representation ŝ_y and the actual target representation s_y, typically an L2 loss. Because both live in latent space rather than pixel space, the encoder is free to throw away unpredictable noise (the exact texture of leaves, the precise pose of a fly) and keep only what is structurally predictable.'
    },
    'context': {
      title: 'Context Input  x',
      body:
        'The visible portion of the input. In I-JEPA this is a single large rectangular block of an image; the rest of the image is hidden. In V-JEPA it is the past frames of a clip and the future frames are hidden. The model never sees the target directly while making its prediction.'
    },
    'target': {
      title: 'Target Input  y',
      body:
        'The held-out portion the model is trying to predict. Selecting good targets is non-trivial: I-JEPA samples several large target blocks per image (rather than tiny patches as in masked-autoencoders), which forces the network to predict object-level structure instead of local texture.'
    }
  };

  var DEFAULT_INFO = {
    title: 'Click any block to learn what it does',
    body:
      'JEPA — Joint Embedding Predictive Architecture — has four moving parts. Click on the context encoder, the predictor, the target encoder, or the energy node to see what each one is for. Hover to preview.'
  };

  document.addEventListener('DOMContentLoaded', function () {
    /* ----- DOM QUERY #1: every clickable group inside the SVG ----- */
    var parts = document.querySelectorAll('.jepa-part');
    /* ----- DOM QUERY #2: the description panel below the diagram ----- */
    var infoPanel = document.getElementById('diagram-info');

    if (!parts.length || !infoPanel) {
      // Page does not have the diagram — nothing to do.
      return;
    }

    // Render the default state once, so the panel is never empty.
    renderInfo(DEFAULT_INFO);

    parts.forEach(function (part) {
      part.addEventListener('click', selectComponent);
      part.addEventListener('mouseenter', previewComponent);
      part.addEventListener('mouseleave', clearPreview);

      // Keyboard accessibility: Enter or Space activates the part.
      part.setAttribute('tabindex', '0');
      part.setAttribute('role', 'button');
      part.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectComponent.call(part, e);
        }
      });
    });

    /* FUNCTION 1 — bound to the click event.
     * Updates page CONTENT (rewrites the panel text) and changes
     * a CSS PROPERTY (toggles .is-active, which restyles fill,
     * stroke, and stroke-width per style.css).
     */
    function selectComponent() {
      var key = this.getAttribute('data-part');
      var data = DESCRIPTIONS[key] || DEFAULT_INFO;

      // Clear previous active state on every part, then mark this one.
      parts.forEach(function (p) { p.classList.remove('is-active'); });
      this.classList.add('is-active');

      // Update the description panel — this is the CONTENT change.
      renderInfo(data);
    }

    /* FUNCTION 2 — bound to the mouseenter event.
     * Pure CSS PROPERTY change: adds .is-hover, which gives the
     * box a brighter background while the pointer is over it.
     * No content updates here.
     */
    function previewComponent() {
      this.classList.add('is-hover');
    }

    function clearPreview() {
      this.classList.remove('is-hover');
    }

    function renderInfo(data) {
      // Build the panel from scratch each time — small enough that
      // there is no need for a templating library.
      infoPanel.innerHTML = '';

      var heading = document.createElement('h4');
      heading.textContent = data.title;

      var body = document.createElement('p');
      body.textContent = data.body;

      infoPanel.appendChild(heading);
      infoPanel.appendChild(body);
    }
  });
})();

/* ------------------------------------------------------------
 * Generative-vs-JEPA comparison toggle.
 * Lives on variants.html. Two buttons each select one of two
 * panels; the active panel gets .is-shown (display: block via
 * style.css), the inactive ones stay display: none.
 *
 * This is a second small interactive feature on a different
 * page — a different DOM query, a different event handler.
 * ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function () {
  var buttons = document.querySelectorAll('.compare-toggle button');
  var panels = document.querySelectorAll('.compare-panel');
  if (!buttons.length || !panels.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-target');

      buttons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      panels.forEach(function (panel) {
        if (panel.id === target) {
          panel.classList.add('is-shown');
        } else {
          panel.classList.remove('is-shown');
        }
      });
    });
  });
});
