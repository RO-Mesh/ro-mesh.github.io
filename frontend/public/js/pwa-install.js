// frontend/public/js/pwa-install.js
let deferredPrompt;

document.addEventListener('DOMContentLoaded', () => {
  const pwaInstallBanner = document.getElementById('pwa-install-banner');
  const pwaInstallBtn = document.getElementById('pwa-install-btn');
  const pwaDismissBtn = document.getElementById('pwa-dismiss-btn');

  if (!pwaInstallBanner || !pwaInstallBtn || !pwaDismissBtn) return;

  if (localStorage.getItem('pwaPromptDismissed') === 'true') {
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaInstallBanner.classList.remove('hidden');
  });

  pwaInstallBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    pwaInstallBanner.classList.add('hidden');
    deferredPrompt = null;
  });

  pwaDismissBtn.addEventListener('click', () => {
    pwaInstallBanner.classList.add('hidden');
    localStorage.setItem('pwaPromptDismissed', 'true');
  });

  window.addEventListener('appinstalled', () => {
    pwaInstallBanner.classList.add('hidden');
    console.log('RO-MESH was successfully installed as a PWA.');
  });
});
