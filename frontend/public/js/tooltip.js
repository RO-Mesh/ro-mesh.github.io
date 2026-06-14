document.addEventListener('DOMContentLoaded', () => {
  const terms = document.querySelectorAll('.glossary-term');
  if (terms.length === 0) return;

  const tooltipBox = document.createElement('div');
  tooltipBox.className = 'tooltip-box';
  document.body.appendChild(tooltipBox);

  let activeTerm = null;

  function hideTooltip() {
    tooltipBox.classList.remove('visible');
    activeTerm = null;
  }

  function showTooltip(el) {
    const termKey = el.getAttribute('data-term');
    const termData = window.glossaryTerms && window.glossaryTerms[termKey];
    if (!termData) return;

    tooltipBox.innerHTML = `
      <div class="tooltip-header">
        <button class="tooltip-close" aria-label="Închide">&times;</button>
      </div>
      <p class="tooltip-desc">${termData.short}</p>
      <a href="/dictionar.html#${termKey}" class="tooltip-link">Detalii &rarr;</a>
    `;

    tooltipBox.querySelector('.tooltip-close').addEventListener('click', (e) => {
      e.stopPropagation();
      hideTooltip();
    });

    const rect = el.getBoundingClientRect();
    tooltipBox.style.top = `${rect.bottom + window.scrollY + 8}px`;
    tooltipBox.style.left = `${Math.max(10, rect.left + window.scrollX - 20)}px`;
    tooltipBox.classList.add('visible');
    activeTerm = el;
  }

  terms.forEach(term => {
    term.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeTerm === term) {
        hideTooltip();
      } else {
        showTooltip(term);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (activeTerm && !activeTerm.contains(e.target) && !tooltipBox.contains(e.target)) {
      hideTooltip();
    }
  });
});
