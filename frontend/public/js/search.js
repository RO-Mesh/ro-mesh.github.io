document.addEventListener('DOMContentLoaded', () => {
  const openSearchBtn = document.getElementById('open-search-btn');
  const closeSearchBtn = document.getElementById('close-search-overlay');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('giant-search-input');
  const searchResults = document.getElementById('search-results-container');

  if (!openSearchBtn || !searchOverlay || !searchInput) return;

  const searchIndex = window.roMeshSearchIndex || [];

  function openSearch() {
    searchOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Small timeout to allow display block to apply before focusing
    setTimeout(() => searchInput.focus(), 50);
  }

  function closeSearch() {
    searchOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    searchInput.value = '';
    searchResults.innerHTML = '';
  }

  openSearchBtn.addEventListener('click', openSearch);
  closeSearchBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('search-overlay').classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore scroll
    document.getElementById('giant-search-input').value = ''; // Clear input
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
      closeSearch();
    }
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    const matches = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      (item.snippet && item.snippet.toLowerCase().includes(query))
    );

    if (matches.length > 0) {
      searchResults.innerHTML = matches.map(match => `
        <a href="${match.url}" class="search-result-item" onclick="document.body.style.overflow = '';">
          <div class="search-result-title">${match.title}</div>
          <div class="search-result-url">${match.url}</div>
          ${match.snippet ? `<div class="search-result-snippet">${match.snippet}</div>` : ''}
        </a>
      `).join('');
    } else {
      searchResults.innerHTML = `<div class="search-no-results">Niciun rezultat găsit.</div>`;
    }
  });
});
