/**
 * scroll-top.js — Scroll-to-top button, shared across all RO-MESH pages.
 * Injects the button into <body> and handles show/hide on scroll.
 */
(function () {
  'use strict';

  // Create button
  var btn = document.createElement('button');
  btn.id = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Înapoi sus');
  btn.setAttribute('title', 'Înapoi sus');
  btn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="18 15 12 9 6 15"/>' +
    '</svg>';

  document.body.appendChild(btn);

  // Show/hide on scroll
  var THRESHOLD = 300;
  function onScroll() {
    if (window.scrollY > THRESHOLD) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Scroll to top on click
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
