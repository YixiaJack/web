/* color-mode.js
 *
 * Toggles the page between a light and dark palette by setting
 * a `data-theme` attribute on <html>. Every color in style.css
 * is defined as a CSS custom property whose value depends on
 * that attribute, so flipping it swaps the entire palette in
 * one step. The choice is persisted in localStorage so the
 * site remembers the visitor's preference between page loads
 * and across pages of the site.
 *
 * The icon button is rendered in HTML on every page (see the
 * .color-mode-toggle <button>); CSS shows the sun or moon glyph
 * depending on the current theme, so this file does not have
 * to swap any markup.
 */

(function () {
  var STORAGE_KEY = 'jepa-site-theme';
  var root = document.documentElement;

  // Read the saved preference and apply it before the page paints
  // so visitors do not see a brief flash of the wrong palette.
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    saved = null;
  }
  if (saved === 'dark') {
    root.setAttribute('data-theme', 'dark');
  }

  // Wire up the click handler once the DOM is ready.
  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.color-mode-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        // Ignore — private browsing or storage disabled. The
        // theme still applies for the current session.
      }
      // Update aria-label so screen readers announce the new state.
      toggle.setAttribute(
        'aria-label',
        next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });
  });
})();
