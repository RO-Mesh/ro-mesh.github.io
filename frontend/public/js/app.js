/**
 * RO-MESH — Application JavaScript
 * Handles:
 *  - Service Worker registration
 *  - PWA install prompt
 *  - Network state detection (online/offline)
 *  - Async widget loading (stats, relay map)
 *  - Navigation interactivity (scroll, mobile menu)
 *  - Scroll-triggered animations
 */

'use strict';

/* ════════════════════════════════════════════════════════════════════════════
   CONFIG
   ════════════════════════════════════════════════════════════════════════════ */
// In Docker/Nginx production: /api is proxied to the backend container.
// In local dev (http-server on :8080): call backend directly on :3000.
const IS_DEV_SERVER = (
  window.location.port === '8080' ||
  window.location.port === '5000'
);
const API_ORIGIN = IS_DEV_SERVER
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : '';

const CONFIG = {
  apiBase: `${API_ORIGIN}/api`,
  statsEndpoint: `${API_ORIGIN}/api/stats`,
  healthEndpoint: `${API_ORIGIN}/api/health`,
  statsRetryDelay: 3000,    // ms
  statsMaxRetries: 2,
  animationThreshold: 0.15, // IntersectionObserver threshold
};

/* ════════════════════════════════════════════════════════════════════════════
   1. SERVICE WORKER REGISTRATION
   ════════════════════════════════════════════════════════════════════════════ */
async function registerServiceWorker() {
  const swStatusText = document.getElementById('sw-status-text');
  const swDot        = document.querySelector('.sw-dot');

  if (!('serviceWorker' in navigator)) {
    setSwStatus('Service Worker indisponibil în acest browser', 'error', swStatusText, swDot);
    return;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none', // Always re-fetch the SW script
    });

    console.log('[RO-MESH SW] Înregistrat cu succes. Scope:', reg.scope);
    setSwStatus('Disponibil offline ✓', 'active', swStatusText, swDot);

    // Check for updates in background
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      console.log('[RO-MESH SW] Actualizare găsită, instalând…');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[RO-MESH SW] Conținut nou disponibil, reîncarcă pagina pentru actualizare.');
          // Could show a "refresh for update" banner here
        }
      });
    });

    // Ensure SW is controlling this page
    if (!navigator.serviceWorker.controller) {
      reg.active?.postMessage({ type: 'SKIP_WAITING' });
    }

  } catch (err) {
    console.warn('[RO-MESH SW] Înregistrare eșuată:', err);
    setSwStatus('Cache offline indisponibil', 'error', swStatusText, swDot);
  }
}

function setSwStatus(text, state, textEl, dotEl) {
  if (textEl) textEl.textContent = text;
  if (dotEl) {
    dotEl.className = 'sw-dot';
    if (state === 'active') dotEl.classList.add('active');
    if (state === 'error')  dotEl.classList.add('error');
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   2. NETWORK STATE DETECTION
   ════════════════════════════════════════════════════════════════════════════ */
const NetworkManager = {
  isOnline: navigator.onLine,
  listeners: [],

  init() {
    window.addEventListener('online',  () => this._handleChange(true));
    window.addEventListener('offline', () => this._handleChange(false));
    // Run initial state immediately
    this._applyState(this.isOnline);
  },

  _handleChange(online) {
    this.isOnline = online;
    console.log(`[RO-MESH Network] ${online ? 'Online ✓' : 'Offline ✗'}`);
    this._applyState(online);
    this.listeners.forEach(fn => fn(online));
  },

  _applyState(online) {
    const banner = document.getElementById('offline-banner');
    if (banner) {
      banner.hidden = online;
    }
  },

  on(fn) {
    this.listeners.push(fn);
    // Call immediately with current state
    fn(this.isOnline);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   3. ASYNC STATS WIDGET
   Fetches live stats from backend. Degrades gracefully when offline.
   ════════════════════════════════════════════════════════════════════════════ */
const StatsWidget = {
  retries: 0,

  init() {
    const retryBtn = document.getElementById('stats-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.load());
    }

    // React to network changes
    NetworkManager.on((online) => {
      if (online) {
        this.load();
      } else {
        this.showOffline();
      }
    });
  },

  async load() {
    if (!NetworkManager.isOnline) {
      this.showOffline();
      return;
    }

    this.showLoading();
    this.retries = 0;
    await this._fetchWithRetry();
  },

  async _fetchWithRetry() {
    try {
      // Use low-priority background fetch to not block user-visible resources
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(CONFIG.statsEndpoint, {
        signal:  controller.signal,
        headers: { 'Accept': 'application/json' },
        // Deprioritize this background fetch (modern browsers)
        priority: 'low',
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.render(data);

    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('[StatsWidget] Cererea a expirat.');
      } else {
        console.warn('[StatsWidget] Eroare fetch:', err.message);
      }

      if (this.retries < CONFIG.statsMaxRetries) {
        this.retries++;
        console.log(`[StatsWidget] Reîncercare ${this.retries}/${CONFIG.statsMaxRetries}…`);
        setTimeout(() => this._fetchWithRetry(), CONFIG.statsRetryDelay);
      } else {
        // If offline, show offline; otherwise show error
        if (!NetworkManager.isOnline) {
          this.showOffline();
        } else {
          this.showError();
        }
      }
    }
  },

  render(data) {
    // Update widget card values
    const setValue = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = val ?? '—';
        el.classList.add('loaded');
      }
    };

    setValue('scard-noduri-val',    data.activeNodes);
    setValue('scard-repetoare-val', data.relayCount);
    setValue('scard-mesaje-val',    data.messagesLast24h);
    setValue('scard-judete-val',    data.countiesReached);

    // Also update hero stat bar
    const heroVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        const valEl = el.querySelector('.stat-value');
        if (valEl) {
          valEl.textContent = val ?? '—';
          valEl.classList.add('loaded');
        }
      }
    };
    heroVal('stat-noduri',    data.activeNodes);
    heroVal('stat-repetoare', data.relayCount);
    heroVal('stat-judete',    data.countiesReached);

    // Update map badge
    const mapBadge = document.getElementById('map-status-badge');
    if (mapBadge) {
      mapBadge.textContent = `${data.activeNodes} noduri online`;
    }

    this._showPanel('stats-grid');
  },

  showLoading() {
    this._showPanel('stats-loading');
  },

  showOffline() {
    this._showPanel('stats-offline');
    // Also show offline state for relay map
    const mapOffline = document.getElementById('relay-map-offline');
    if (mapOffline) mapOffline.hidden = false;
    const mapBadge = document.getElementById('map-status-badge');
    if (mapBadge) mapBadge.textContent = 'Offline';
  },

  showError() {
    this._showPanel('stats-error');
  },

  _showPanel(panelId) {
    const panels = ['stats-loading', 'stats-grid', 'stats-offline', 'stats-error'];
    panels.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = (id !== panelId);
    });
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   4. PWA INSTALL PROMPT
   ════════════════════════════════════════════════════════════════════════════ */
const PWAInstall = {
  deferredPrompt: null,

  init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome's default mini-infobar
      e.preventDefault();
      this.deferredPrompt = e;
      this._showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('[RO-MESH PWA] Aplicație instalată cu succes.');
      this.deferredPrompt = null;
      this._hideInstallButton();
    });

    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.addEventListener('click', () => this._triggerInstall());
    }
  },

  async _triggerInstall() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`[PWA Install] Utilizatorul a ales: ${outcome}`);
    this.deferredPrompt = null;
    this._hideInstallButton();
  },

  _showInstallButton() {
    const container = document.getElementById('pwa-install-container');
    if (container) container.hidden = false;
  },

  _hideInstallButton() {
    const container = document.getElementById('pwa-install-container');
    if (container) container.hidden = true;
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   5. NAVIGATION
   ════════════════════════════════════════════════════════════════════════════ */
const Navigation = {
  init() {
    this._initScrollHeader();
    this._initMobileMenu();
    this._initActiveLink();
    this._initSmoothClose();
  },

  _initScrollHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  },

  _initMobileMenu() {
    const btn  = document.getElementById('nav-hamburger-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      menu.hidden = isOpen;
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) {
        btn.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        document.body.style.overflow = '';
        btn.focus();
      }
    });
  },

  _initSmoothClose() {
    // Close mobile menu when any link inside is clicked
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        const btn = document.getElementById('nav-hamburger-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        document.body.style.overflow = '';
      });
    });
  },

  _initActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   6. SCROLL-TRIGGERED ANIMATIONS
   Uses IntersectionObserver for efficient, jank-free reveal animations.
   Respects prefers-reduced-motion.
   ════════════════════════════════════════════════════════════════════════════ */
const AnimationManager = {
  init() {
    // Only run animations if the user hasn't requested reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = document.querySelectorAll(
      '.problem-card, .step-item, .community-card, .stat-card, .solution-feature, .cta-card'
    );

    elements.forEach((el, i) => {
      el.classList.add('fade-in-up');
      // Stagger based on position in group
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, { threshold: CONFIG.animationThreshold });

    elements.forEach(el => observer.observe(el));
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   7. COUNTER ANIMATION
   Animates number counting for loaded stats
   ════════════════════════════════════════════════════════════════════════════ */
function animateCounter(element, targetValue, duration = 1000) {
  if (typeof targetValue !== 'number' || isNaN(targetValue)) {
    element.textContent = targetValue ?? '—';
    return;
  }

  const start     = 0;
  const startTime = performance.now();

  const tick = (now) => {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(start + (targetValue - start) * eased);
    element.textContent = current.toLocaleString('ro-RO');

    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/* Patch StatsWidget.render to use counters */
const originalRender = StatsWidget.render.bind(StatsWidget);
StatsWidget.render = function(data) {
  originalRender(data);

  // Apply counter animation to card values
  const fields = {
    'scard-noduri-val':    data.activeNodes,
    'scard-repetoare-val': data.relayCount,
    'scard-mesaje-val':    data.messagesLast24h,
    'scard-judete-val':    data.countiesReached,
  };

  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && typeof val === 'number') {
      animateCounter(el, val);
    }
  });
};

/* ════════════════════════════════════════════════════════════════════════════
   8. INITIALISE EVERYTHING
   ════════════════════════════════════════════════════════════════════════════ */
function init() {
  console.log('[RO-MESH] Inițializare aplicație…');

  // Order matters: Network first, then SW, then UI
  NetworkManager.init();
  Navigation.init();
  AnimationManager.init();
  StatsWidget.init();
  PWAInstall.init();

  // Register SW after page is interactive (defer SW reg to not block LCP)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => registerServiceWorker(), { timeout: 2000 });
  } else {
    setTimeout(() => registerServiceWorker(), 500);
  }

  console.log('[RO-MESH] ✓ Aplicație inițializată');
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
