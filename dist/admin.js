// Bizim Minik Evrenimiz - Yönetici Paneli & Gizli İçerik Denetleyicisi
(function() {
  const PIN_KEY = 'minik_evren_admin_pin';
  const AUTH_KEY = 'minik_evren_admin_auth';
  const GOD_KEY = 'minik_evren_admin_god_mode';
  const DEFAULT_PIN = 'evren2026';

  function getStoredPin() {
    try {
      return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
    } catch {
      return DEFAULT_PIN;
    }
  }

  function setStoredPin(newPin) {
    try {
      localStorage.setItem(PIN_KEY, newPin);
      return true;
    } catch {
      return false;
    }
  }

  function isAuth() {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true' || sessionStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function setAuth(val) {
    try {
      if (val) {
        localStorage.setItem(AUTH_KEY, 'true');
        sessionStorage.setItem(AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
      }
    } catch {}
  }

  function isGodMode() {
    try {
      const val = localStorage.getItem(GOD_KEY);
      return val !== 'false';
    } catch {
      return true;
    }
  }

  function setGodMode(val) {
    try {
      localStorage.setItem(GOD_KEY, val ? 'true' : 'false');
    } catch {}
  }

  window.ADMIN_AUTHENTICATED = isAuth();
  window.ADMIN_UNLOCKED = isAuth() && isGodMode();
  window.SIMULATED_DATE = null;
  window.SIMULATED_START_DATE = null;

  // Global hooks
  window.openAdminPanel = openAdminDashboard;
  window.openAdminLogin = openAdminLoginModal;

  // DOM Elements
  let loginModal = null;
  let dashboardModal = null;
  let adminBar = null;
  let adminFab = null;
  let currentActiveTab = 'control';

  // 1. Secret Triggers: 5 clicks on .brand or Ctrl+Alt+A or #admin hash
  let brandClickCount = 0;
  let brandClickTimer = null;

  document.addEventListener('click', (e) => {
    if (e.target.closest('#admin-footer-btn')) {
      e.preventDefault();
      triggerAdmin();
      return;
    }
    const brand = e.target.closest('.brand');
    if (brand) {
      brandClickCount++;
      clearTimeout(brandClickTimer);
      brandClickTimer = setTimeout(() => { brandClickCount = 0; }, 2500);
      if (brandClickCount >= 5) {
        brandClickCount = 0;
        triggerAdmin();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      triggerAdmin();
    }
  });

  window.addEventListener('hashchange', () => {
    if (location.hash === '#admin') {
      triggerAdmin();
    }
  });

  function triggerAdmin() {
    if (window.ADMIN_AUTHENTICATED) {
      openAdminDashboard();
    } else {
      openAdminLoginModal();
    }
  }

  function updateFooterBtn() {
    const btn = document.querySelector('#admin-footer-btn');
    if (btn) {
      if (window.ADMIN_AUTHENTICATED) {
        btn.innerHTML = '👑 Yönetici (Kilitler Açık)';
        btn.style.color = '#7e5caa';
        btn.style.borderColor = '#7e5caa';
        btn.style.background = '#f5eef7';
      } else {
        btn.innerHTML = '🔐 Yönetici Girişi';
        btn.style.color = '#a891ae';
        btn.style.borderColor = '#d6bfd7';
        btn.style.background = 'rgba(255,255,255,0.6)';
      }
    }
  }

  // 2. Login Modal
  function createLoginModal() {
    if (loginModal) return loginModal;
    loginModal = document.createElement('dialog');
    loginModal.id = 'admin-login-dialog';
    loginModal.innerHTML = `
      <div class="admin-login-box">
        <span class="icon">👑</span>
        <h2>Yönetici Doğrulama</h2>
        <p>Admin şifreni girerek doğrulama yap; sitedeki tüm gizli bölümler, canlı videolar ve kilitli sayfalar senin için anında açılsın.</p>
        <form id="admin-login-form">
          <div class="admin-input-group">
            <input type="password" id="admin-pin-input" class="admin-input" placeholder="Yönetici Şifren" autofocus autocomplete="current-password">
            <div id="admin-login-msg" class="admin-login-error"></div>
          </div>
          <div style="font-size:12px; color:var(--admin-muted); margin-bottom:18px;">
            Varsayılan şifre: <code style="color:var(--admin-gold); font-size:13px;">evren2026</code> (Giriş yaptıktan sonra değiştirebilirsin).
          </div>
          <div style="display:flex; gap:10px; justify-content:center;">
            <button type="button" class="admin-btn" id="admin-login-cancel">Vazgeç</button>
            <button type="submit" class="admin-btn active" style="padding:10px 24px; font-weight:600;">Doğrula ve Kilitleri Aç 🔓</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(loginModal);

    const form = loginModal.querySelector('#admin-login-form');
    const input = loginModal.querySelector('#admin-pin-input');
    const msg = loginModal.querySelector('#admin-login-msg');
    const cancelBtn = loginModal.querySelector('#admin-login-cancel');

    cancelBtn.addEventListener('click', () => {
      loginModal.close();
      if (location.hash === '#admin') location.hash = '#home';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = input.value.trim();
      if (entered === getStoredPin()) {
        msg.textContent = '';
        input.value = '';
        loginModal.close();
        onLoginSuccess();
      } else {
        msg.textContent = 'Hatalı şifre. Lütfen tekrar dene.';
        input.value = '';
        input.focus();
      }
    });

    return loginModal;
  }

  function openAdminLoginModal() {
    createLoginModal();
    loginModal.querySelector('#admin-login-msg').textContent = '';
    loginModal.querySelector('#admin-pin-input').value = '';
    loginModal.showModal();
  }

  function onLoginSuccess() {
    setAuth(true);
    setGodMode(true);
    window.ADMIN_AUTHENTICATED = true;
    window.ADMIN_UNLOCKED = true;
    mountAdminUI();
    updateFooterBtn();
    refreshSiteState();
    showAdminToast('Yönetici doğrulandı! Bütün gizli anılar ve içerikler senin için açıldı 🔓✨');
    openAdminDashboard();
  }

  function logoutAdmin() {
    setAuth(false);
    setGodMode(false);
    window.ADMIN_AUTHENTICATED = false;
    window.ADMIN_UNLOCKED = false;
    window.SIMULATED_DATE = null;
    window.SIMULATED_START_DATE = null;
    if (adminBar) { adminBar.remove(); adminBar = null; }
    if (adminFab) { adminFab.remove(); adminFab = null; }
    if (dashboardModal && dashboardModal.open) dashboardModal.close();
    if (location.hash === '#admin') location.hash = '#home';
    updateFooterBtn();
    refreshSiteState();
    showAdminToast('Yönetici oturumu kapatıldı.');
  }

  // 3. UI Mount
  function mountAdminUI() {
    if (!window.ADMIN_AUTHENTICATED) return;

    // Admin Bar
    if (!adminBar) {
      adminBar = document.createElement('div');
      adminBar.className = 'admin-bar';
      adminBar.innerHTML = `
        <span class="badge">👑 Yönetici</span>
        <div class="admin-actions">
          <button class="admin-btn ${window.ADMIN_UNLOCKED ? 'active' : ''}" id="admin-bar-god-btn">
            ${window.ADMIN_UNLOCKED ? '🔓 Kilitler Açık' : '🔒 Kilitler Kapalı'}
          </button>
          <button class="admin-btn" id="admin-bar-dash-btn">⚙️ Yönetici Masası</button>
          <button class="admin-btn danger" id="admin-bar-logout-btn">Çıkış</button>
        </div>
      `;
      document.body.appendChild(adminBar);

      adminBar.querySelector('#admin-bar-god-btn').addEventListener('click', () => {
        toggleGodMode();
      });
      adminBar.querySelector('#admin-bar-dash-btn').addEventListener('click', () => {
        openAdminDashboard();
      });
      adminBar.querySelector('#admin-bar-logout-btn').addEventListener('click', () => {
        logoutAdmin();
      });
    }

    // Admin FAB
    if (!adminFab) {
      adminFab = document.createElement('button');
      adminFab.className = 'admin-fab';
      adminFab.innerHTML = `<span>⚙️</span><span>Admin</span>`;
      adminFab.addEventListener('click', () => {
        openAdminDashboard();
      });
      document.body.appendChild(adminFab);
    }
  }

  function toggleGodMode() {
    window.ADMIN_UNLOCKED = !window.ADMIN_UNLOCKED;
    setGodMode(window.ADMIN_UNLOCKED);
    updateAdminBar();
    refreshSiteState();
    showAdminToast(window.ADMIN_UNLOCKED ? 'Tüm kilitler açıldı (Önizleme Modu)! 🔓' : 'Kilitler normale döndürüldü. 🔒');
  }

  function updateAdminBar() {
    if (!adminBar) return;
    const btn = adminBar.querySelector('#admin-bar-god-btn');
    if (btn) {
      btn.className = `admin-btn ${window.ADMIN_UNLOCKED ? 'active' : ''}`;
      btn.textContent = window.ADMIN_UNLOCKED ? '🔓 Kilitler Açık' : '🔒 Kilitler Kapalı';
    }
  }

  function refreshSiteState() {
    if (typeof syncMagicMemories === 'function') syncMagicMemories();
    if (typeof syncStickerGift === 'function') syncStickerGift();
    if (typeof render === 'function') render();
  }

  function showAdminToast(msg) {
    const t = document.querySelector('#toast');
    if (t) {
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }
  }

  // 4. Admin Dashboard Modal
  function createDashboardModal() {
    if (dashboardModal) return dashboardModal;
    dashboardModal = document.createElement('dialog');
    dashboardModal.id = 'admin-dashboard-dialog';
    dashboardModal.innerHTML = `
      <div class="admin-dash-header">
        <div class="admin-dash-title">
          <span style="font-size:26px">👑</span>
          <div>
            <h2>Minik Evren Yönetici Masası</h2>
            <small style="color:var(--admin-muted)">Gizli içerikler, bölümler ve zaman kontrolleri</small>
          </div>
        </div>
        <button class="close" id="admin-dash-close" aria-label="Kapat" style="color:var(--admin-muted)">✕</button>
      </div>
      <div class="admin-dash-tabs">
        <button class="admin-tab-btn active" data-tab="control">🎛️ Genel Denetim & Zaman</button>
        <button class="admin-tab-btn" data-tab="videos">🎬 Büyülü Videolar (23)</button>
        <button class="admin-tab-btn" data-tab="chapters">📖 Çizgi Roman (15)</button>
        <button class="admin-tab-btn" data-tab="stickers">🎁 Sticker & Hediyeler</button>
        <button class="admin-tab-btn" data-tab="photos">📸 Fotoğraf Arşivi (73)</button>
        <button class="admin-tab-btn" data-tab="news">📢 Duyurular</button>
        <button class="admin-tab-btn" data-tab="security">🔐 Şifre & Güvenlik</button>
      </div>
      <div class="admin-dash-body" id="admin-dash-content">
        <!-- Tab Content -->
      </div>
    `;
    document.body.appendChild(dashboardModal);

    dashboardModal.querySelector('#admin-dash-close').addEventListener('click', () => {
      dashboardModal.close();
      if (location.hash === '#admin') location.hash = '#home';
    });

    dashboardModal.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dashboardModal.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentActiveTab = btn.dataset.tab;
        renderDashboardTab(currentActiveTab);
      });
    });

    return dashboardModal;
  }

  function openAdminDashboard() {
    createDashboardModal();
    renderDashboardTab(currentActiveTab);
    dashboardModal.showModal();
  }

  function renderDashboardTab(tab) {
    const container = document.querySelector('#admin-dash-content');
    if (!container) return;

    if (tab === 'control') renderControlTab(container);
    else if (tab === 'videos') renderVideosTab(container);
    else if (tab === 'chapters') renderChaptersTab(container);
    else if (tab === 'stickers') renderStickersTab(container);
    else if (tab === 'photos') renderPhotosTab(container);
    else if (tab === 'news') renderNewsTab(container);
    else if (tab === 'security') renderSecurityTab(container);
  }

  // --- Tab 1: Kontrol & Zaman Makinesi ---
  function renderControlTab(container) {
    const C = window.CONTENT || {};
    const hasStartDate = Boolean(C.startDate || window.SIMULATED_START_DATE);
    const currentDateDisplay = window.SIMULATED_DATE ? new Date(window.SIMULATED_DATE).toLocaleDateString('tr-TR') : 'Gerçek Zaman (Bugün)';

    container.innerHTML = `
      <div class="admin-grid-cards">
        <div class="admin-card">
          <h3><span>🔓</span> Tüm Kilitleri Kaldır (God Mode)</h3>
          <p>Büyülü anıları, henüz açılmamış çizgi roman bölümlerini ve sürpriz stickerları sitede hemen görünür ve gezilebilir kılar.</p>
          <div class="admin-toggle-row">
            <span>Önizleme Modu: <b>${window.ADMIN_UNLOCKED ? 'AÇIK' : 'KAPALI'}</b></span>
            <button class="admin-btn ${window.ADMIN_UNLOCKED ? 'active' : ''}" id="tab-god-toggle">
              ${window.ADMIN_UNLOCKED ? 'Kilitleri Kapat' : 'Tüm Kilitleri Aç'}
            </button>
          </div>
        </div>

        <div class="admin-card">
          <h3><span>⏱️</span> Zaman Makinesi (Simülatör)</h3>
          <p>Siteyi farklı tarihlerdeymiş gibi simüle et; sevgilinin o günlerde ne göreceğini birebir test et.</p>
          <p style="margin-bottom:8px">Aktif Tarih: <b style="color:var(--admin-gold)">${currentDateDisplay}</b></p>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button class="admin-btn" id="time-real">Şimdiki Zaman</button>
            <button class="admin-btn" id="time-ch1">1. Bölüm</button>
            <button class="admin-btn" id="time-ch7">7. Bölüm (Sticker)</button>
            <button class="admin-btn" id="time-ch9">9. Bölüm (Büyülü Anılar)</button>
            <button class="admin-btn" id="time-final">3 Kasım (Final)</button>
          </div>
        </div>

        <div class="admin-card">
          <h3><span>📊</span> Evrenin Genel Durumu</h3>
          <ul style="margin:0; padding-left:18px; line-height:1.8; font-size:13px; color:var(--admin-muted);">
            <li>Fotoğraf Sayısı: <b style="color:white">${C.photos?.length || 0} adet</b></li>
            <li>Canlı Video Sayısı: <b style="color:white">23 adet</b></li>
            <li>Çizgi Roman Bölümleri: <b style="color:white">15 bölüm</b></li>
            <li>Çıkartma (Sticker) Sayısı: <b style="color:white">${window.STICKERS?.length || 0} adet</b></li>
            <li>Başlangıç Tarihi (startDate): <b style="color:white">${C.startDate ? new Date(C.startDate).toLocaleDateString('tr-TR') : 'Belirlenmedi (null)'}</b></li>
            <li>Büyük Final: <b style="color:white">3 Kasım 2026</b></li>
          </ul>
        </div>
      </div>
    `;

    container.querySelector('#tab-god-toggle').addEventListener('click', () => {
      toggleGodMode();
      renderControlTab(container);
    });

    container.querySelector('#time-real').addEventListener('click', () => {
      window.SIMULATED_DATE = null;
      window.SIMULATED_START_DATE = null;
      refreshSiteState();
      renderControlTab(container);
      showAdminToast('Zaman simülatörü sıfırlandı.');
    });

    container.querySelector('#time-ch1').addEventListener('click', () => {
      window.SIMULATED_START_DATE = '2026-10-01T00:00:00+03:00';
      window.SIMULATED_DATE = '2026-10-01T12:00:00+03:00';
      refreshSiteState();
      renderControlTab(container);
      showAdminToast('1. Bölüm zamanı simüle edildi.');
    });

    container.querySelector('#time-ch7').addEventListener('click', () => {
      window.SIMULATED_START_DATE = '2026-10-01T00:00:00+03:00';
      // Chapter 7 approx date:
      const start = +new Date('2026-10-01T00:00:00+03:00');
      const end = +new Date('2026-11-03T00:00:00+03:00');
      window.SIMULATED_DATE = new Date(start + (end - start) * 6 / 14 + 1000).toISOString();
      refreshSiteState();
      renderControlTab(container);
      showAdminToast('7. Bölüm (Sticker Hediyesi) simüle edildi.');
    });

    container.querySelector('#time-ch9').addEventListener('click', () => {
      window.SIMULATED_START_DATE = '2026-10-01T00:00:00+03:00';
      const start = +new Date('2026-10-01T00:00:00+03:00');
      const end = +new Date('2026-11-03T00:00:00+03:00');
      window.SIMULATED_DATE = new Date(start + (end - start) * 8 / 14 + 1000).toISOString();
      refreshSiteState();
      renderControlTab(container);
      showAdminToast('9. Bölüm (Büyülü Anılar açılış) simüle edildi.');
    });

    container.querySelector('#time-final').addEventListener('click', () => {
      window.SIMULATED_START_DATE = '2026-10-01T00:00:00+03:00';
      window.SIMULATED_DATE = '2026-11-03T12:00:00+03:00';
      refreshSiteState();
      renderControlTab(container);
      showAdminToast('3 Kasım Büyük Final simüle edildi.');
    });
  }

  // --- Tab 2: Videolar ---
  function renderVideosTab(container) {
    const memories = window.enchantedMemories || [];
    container.innerHTML = `
      <div id="admin-video-player-container"></div>
      <p style="margin-top:0; color:var(--admin-muted)">
        Bu 23 video sitede normalde 9. Bölüm açılana kadar gizlidir. Buradan istediğin videoyu doğrudan sesli izleyebilir ve notlarını kontrol edebilirsin.
      </p>
      <div class="admin-media-grid">
        ${memories.map(m => `
          <div class="admin-video-card">
            <div class="admin-video-thumb ${m.portrait ? 'vertical' : ''}">
              <img src="assets/memories/${m.id}.jpg" alt="${m.title}" loading="lazy">
              <button class="admin-video-play-btn" data-play-id="${m.id}" title="Oynat">▶</button>
            </div>
            <div class="admin-video-meta">
              <small>${m.type}</small>
              <h4>${m.title}</h4>
              <p>${m.note}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('[data-play-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.playId;
        const mem = memories.find(m => m.id === id);
        const playerBox = container.querySelector('#admin-video-player-container');
        if (mem && playerBox) {
          playerBox.innerHTML = `
            <div class="admin-player-overlay">
              <h3 style="margin:0 0 10px; color:white">${mem.title} (${mem.type})</h3>
              <video controls autoplay playsinline poster="assets/memories/${mem.id}.jpg" style="max-height:48vh">
                <source src="assets/memories/${mem.id}.mp4" type="video/mp4">
              </video>
              <p style="margin:8px 0 0; color:var(--admin-muted)">${mem.note}</p>
              <button class="admin-btn" id="admin-player-close" style="margin-top:10px">Oynatıcıyı Kapat ✕</button>
            </div>
          `;
          playerBox.querySelector('#admin-player-close').addEventListener('click', () => {
            playerBox.innerHTML = '';
          });
          playerBox.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // --- Tab 3: Çizgi Roman Bölümleri ---
  function renderChaptersTab(container) {
    const C = window.CONTENT || {};
    const chapters = C.chapters || [];
    container.innerHTML = `
      <p style="margin-top:0; color:var(--admin-muted)">
        Toplam 15 bölümün kilit durumları ve hazır olan sayfaları. İlgili bölüme tıklayarak doğrudan okuma penceresini açabilirsin.
      </p>
      <div class="admin-chapter-list">
        ${Array.from({ length: 15 }, (_, i) => {
          const ch = chapters[i];
          const pageCount = ch?.pages?.length || 0;
          const isReady = pageCount > 0;
          return `
            <div class="admin-chapter-row">
              <div class="admin-chapter-info">
                <span class="admin-chapter-num">${String(i+1).padStart(2, '0')}</span>
                <div>
                  <strong style="color:white">${i === 14 ? '15. Bölüm · Büyük Final' : (i+1) + '. Bölüm'}</strong>
                  <div style="font-size:12px; color:var(--admin-muted)">
                    ${isReady ? `${pageCount} sayfa yüklü` : 'Sayfalar henüz eklenmedi'}
                  </div>
                </div>
              </div>
              <button class="admin-btn" data-preview-chapter="${i}">
                ${isReady ? 'İncele & Oku ↗' : 'Önizle (Boş)'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('[data-preview-chapter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.previewChapter);
        dashboardModal.close();
        if (location.hash !== '#story') location.hash = '#story';
        setTimeout(() => {
          const chBtn = document.querySelector(`button[data-chapter="${idx}"]`);
          if (chBtn) chBtn.click();
        }, 150);
      });
    });
  }

  // --- Tab 4: Stickerlar & Hediyeler ---
  function renderStickersTab(container) {
    const stickers = window.STICKERS || [];
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <p style="margin:0; color:var(--admin-muted)">
          7. Bölüm hediyesi olarak saklanan 20 adet özel chibi WhatsApp stickerı.
        </p>
        <button class="admin-btn" id="admin-reset-gift-btn">Hediye Kutusunu Baştan Aç</button>
      </div>
      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <a class="admin-btn active" href="stickers/bizim-minik-evrenimiz.wastickers" download>WAStickers İndir ↓</a>
        <a class="admin-btn" href="stickers/bizim-minik-evrenimiz.zip" download>ZIP Dosyası İndir ↓</a>
      </div>
      <div class="admin-media-grid">
        ${stickers.length ? stickers.map(s => `
          <div class="admin-video-card" style="padding:12px; text-align:center;">
            <img src="${s.png}" alt="${s.title}" style="width:100px; height:100px; margin:auto; object-fit:contain;">
            <h4 style="margin:10px 0 4px; font-size:13px">${s.title}</h4>
            <small style="color:var(--admin-accent)">${s.category}</small>
          </div>
        `).join('') : '<p style="color:var(--admin-muted)">Sticker dosyaları GitHub Pages yayınında 7. bölüm açılana kadar hazırlanıyor (yerel yayında tamamen erişilebilir).</p>'}
      </div>
    `;

    const resetBtn = container.querySelector('#admin-reset-gift-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        try {
          localStorage.removeItem('minik-evren-sticker-gift-opened');
          showAdminToast('Hediye kutusu sıfırlandı. Hikaye bölümünde tekrar açılabilir!');
        } catch {}
      });
    }
  }

  // --- Tab 5: Fotoğraflar ---
  function renderPhotosTab(container) {
    const photos = window.CONTENT?.photos || [];
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
        <p style="margin:0; color:var(--admin-muted)">Toplam ${photos.length} anı fotoğrafı kronolojik sıralı.</p>
        <input type="text" id="admin-photo-search" class="admin-input" placeholder="Fotoğraflarda veya notlarda ara..." style="width:240px; padding:8px 12px; font-size:13px; text-align:left;">
      </div>
      <div class="admin-media-grid" id="admin-photos-grid">
        ${generatePhotoGrid(photos)}
      </div>
    `;

    const search = container.querySelector('#admin-photo-search');
    const grid = container.querySelector('#admin-photos-grid');
    search.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = photos.filter(p => (p.caption && p.caption.toLowerCase().includes(q)) || (p.date && p.date.includes(q)));
      grid.innerHTML = generatePhotoGrid(filtered);
      bindPhotoClicks(grid);
    });

    bindPhotoClicks(grid);
  }

  function generatePhotoGrid(list) {
    return list.map((p, idx) => `
      <div class="admin-video-card">
        <div class="admin-video-thumb" style="aspect-ratio:4/3; cursor:pointer;" data-open-photo="${idx}">
          <img src="${p.thumb || p.src}" alt="${p.caption || ''}" loading="lazy">
        </div>
        <div class="admin-video-meta">
          <small>${p.date || 'Tarihsiz'}</small>
          <p style="font-size:12px; color:var(--admin-text); margin-top:4px;">${p.caption || ''}</p>
        </div>
      </div>
    `).join('');
  }

  function bindPhotoClicks(grid) {
    grid.querySelectorAll('[data-open-photo]').forEach(el => {
      el.addEventListener('click', () => {
        const i = Number(el.dataset.openPhoto);
        if (typeof openPhoto === 'function') {
          dashboardModal.close();
          openPhoto(i);
        }
      });
    });
  }

  // --- Tab 6: Güvenlik & Şifre Değiştir ---
  function renderSecurityTab(container) {
    container.innerHTML = `
      <div style="max-width:440px; margin:0 auto; padding:20px 0;">
        <h3 style="color:var(--admin-gold); margin-top:0">🔐 Yönetici Şifresi Değiştir</h3>
        <p style="color:var(--admin-muted); font-size:14px; margin-bottom:20px;">
          Yalnızca senin bildiğin yeni bir PIN veya parola belirle. Bu şifre tarayıcında güvenle saklanır.
        </p>
        <form id="admin-pin-change-form">
          <div style="margin-bottom:14px;">
            <label style="display:block; font-size:13px; margin-bottom:6px; color:var(--admin-muted)">Mevcut Şifre</label>
            <input type="password" id="old-pin" class="admin-input" style="text-align:left;" required>
          </div>
          <div style="margin-bottom:18px;">
            <label style="display:block; font-size:13px; margin-bottom:6px; color:var(--admin-muted)">Yeni Şifre</label>
            <input type="password" id="new-pin" class="admin-input" style="text-align:left;" required>
          </div>
          <div id="pin-change-msg" class="admin-login-error" style="margin-bottom:14px"></div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <button type="submit" class="admin-btn active" style="padding:10px 22px">Şifreyi Güncelle</button>
            <button type="button" class="admin-btn danger" id="admin-tab-logout-btn">Oturumu Kapat</button>
          </div>
        </form>
      </div>
    `;

    const form = container.querySelector('#admin-pin-change-form');
    const oldPin = container.querySelector('#old-pin');
    const newPin = container.querySelector('#new-pin');
    const msg = container.querySelector('#pin-change-msg');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (oldPin.value.trim() !== getStoredPin()) {
        msg.textContent = 'Mevcut şifre hatalı.';
        return;
      }
      if (newPin.value.trim().length < 3) {
        msg.textContent = 'Yeni şifre en az 3 karakter olmalıdır.';
        return;
      }
      setStoredPin(newPin.value.trim());
      msg.style.color = '#79d799';
      msg.textContent = 'Şifre başarıyla güncellendi! ✓';
      oldPin.value = '';
      newPin.value = '';
    });

    container.querySelector('#admin-tab-logout-btn').addEventListener('click', () => {
      logoutAdmin();
    });
  }

  // --- Tab: Duyurular Yönetimi ---
  function renderNewsTab(container) {
    const list = window.ANNOUNCEMENTS || [];
    container.innerHTML = `
      <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap: 24px;">
        <div>
          <h3 style="color:var(--admin-gold); margin-top:0">📢 Yayınlanan Duyurular (${list.length})</h3>
          <p style="color:var(--admin-muted); font-size:13px; margin-bottom:15px;">Sitenin "Evrenden Havadisler" panosunda şu anda görünen yenilikler.</p>
          <div style="display:flex; flex-direction:column; gap:12px; max-height:480px; overflow-y:auto; padding-right:6px;">
            ${list.map(n => `
              <div style="background:var(--admin-card); border:1px solid var(--admin-border); border-radius:12px; padding:14px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span style="font-size:11px; font-weight:bold; color:var(--admin-accent)">${esc(n.tagLabel || 'Duyuru')}</span>
                  <small style="color:var(--admin-muted)">${esc(n.date)}</small>
                </div>
                <strong style="color:white; font-size:15px; display:block; margin-bottom:6px;">${esc(n.title)}</strong>
                <p style="color:var(--admin-muted); font-size:12px; margin:0; line-height:1.4;">${esc(n.content)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div style="background:var(--admin-card); border:1px solid var(--admin-border); border-radius:16px; padding:20px;">
            <h3 style="color:white; margin-top:0; font-size:17px">✨ Yeni Duyuru Yayınla</h3>
            <p style="color:var(--admin-muted); font-size:13px; margin-bottom:15px;">Buradan eklediğin duyuru hemen sitedeki havadisler panosuna eklenir.</p>
            <form id="admin-add-news-form">
              <div style="margin-bottom:10px;">
                <label style="display:block; font-size:12px; color:var(--admin-muted); margin-bottom:4px;">Başlık</label>
                <input type="text" id="new-news-title" class="admin-input" placeholder="Örn: 2. Bölüm Yayında!" required style="text-align:left; font-size:13px; padding:8px 12px;">
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
                <div>
                  <label style="display:block; font-size:12px; color:var(--admin-muted); margin-bottom:4px;">Kategori / Etiket</label>
                  <select id="new-news-tag" class="admin-input" style="text-align:left; font-size:13px; padding:8px 12px;">
                    <option value="update">✨ Yenilik</option>
                    <option value="video">🎬 Canlı Video</option>
                    <option value="story">📖 Çizgi Roman</option>
                    <option value="gift">🎁 Sürpriz Hediye</option>
                    <option value="custom">🌸 Özel Not</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:var(--admin-muted); margin-bottom:4px;">Tarih</label>
                  <input type="text" id="new-news-date" class="admin-input" value="${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}" style="text-align:left; font-size:13px; padding:8px 12px;">
                </div>
              </div>
              <div style="margin-bottom:10px;">
                <label style="display:block; font-size:12px; color:var(--admin-muted); margin-bottom:4px;">Duyuru Metni</label>
                <textarea id="new-news-content" class="admin-input" rows="4" placeholder="Neler olduğunu ve sürprizi anlat..." required style="text-align:left; font-size:13px; padding:8px 12px; resize:vertical;"></textarea>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                <div>
                  <label style="display:block; font-size:12px; color:var(--admin-muted); margin-bottom:4px;">Bağlantı Sayfası</label>
                  <select id="new-news-link" class="admin-input" style="text-align:left; font-size:13px; padding:8px 12px;">
                    <option value="">Yok</option>
                    <option value="#home">Ana Sayfa</option>
                    <option value="#story">Çizgi Roman</option>
                    <option value="#album">Anı Albümü</option>
                    <option value="#magic">Büyülü Videolar</option>
                    <option value="#stickers">Sticker Köşesi</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:var(--admin-muted); margin-bottom:4px;">Buton Yazısı</label>
                  <input type="text" id="new-news-linktext" class="admin-input" placeholder="Örn: Keşfet ↗" style="text-align:left; font-size:13px; padding:8px 12px;">
                </div>
              </div>
              <button type="submit" class="admin-btn active" style="width:100%; padding:10px; font-weight:600;">Panoya Ekle & Yayınla 📢</button>
            </form>
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector('#admin-add-news-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const tagSelect = container.querySelector('#new-news-tag');
        const tagText = tagSelect.options[tagSelect.selectedIndex].text;
        if (typeof window.addCustomAnnouncement === 'function') {
          window.addCustomAnnouncement({
            title: container.querySelector('#new-news-title').value.trim(),
            date: container.querySelector('#new-news-date').value.trim(),
            tag: tagSelect.value,
            tagLabel: tagText,
            content: container.querySelector('#new-news-content').value.trim(),
            link: container.querySelector('#new-news-link').value,
            linkText: container.querySelector('#new-news-linktext').value.trim() || 'Keşfet ↗',
            featured: true
          });
          showAdminToast('Yeni duyuru Evrenden Havadisler panosuna eklendi! 📢');
          renderNewsTab(container);
        }
      });
    }
  }

  // Auto-mount if already logged in
  if (window.ADMIN_AUTHENTICATED) {
    mountAdminUI();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateFooterBtn);
  } else {
    setTimeout(updateFooterBtn, 50);
  }
})();
