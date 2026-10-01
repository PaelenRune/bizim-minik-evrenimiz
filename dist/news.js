// Bizim Minik Evrenimiz - Duyurular & Yenilikler Bölümü
(function() {
  const STORAGE_KEY = 'minik_evren_custom_news';

  const DEFAULT_ANNOUNCEMENTS = [
    {
      id: 'news-video-room',
      title: 'Büyülü Video Odası Canlandı!',
      date: '1 Ekim 2026',
      tag: 'video',
      tagLabel: '🎬 Canlı Videolar',
      featured: true,
      content: 'Aramızdaki en kıymetli anlar artık sadece donuk fotoğraflarda kalmıyor. Birlikte güldüğümüz, konuştuğumuz ve sarıldığımız 23 özel canlı video kaydı, Büyülü Anılar köşesinde ses ve kahkahalarımızla canlanmaya başladı.',
      link: '#magic',
      linkText: 'Büyülü Anılara Git ↗'
    },
    {
      id: 'news-admin-panel',
      title: 'Özel Yönetici Masası Entegre Edildi',
      date: '1 Ekim 2026',
      tag: 'update',
      tagLabel: '✨ Yeni Özellik',
      featured: false,
      content: 'Evrenin arka planını yönetmek, henüz tarihi gelmemiş gizli bölümleri ve videoları önceden test edebilmek için şifreli Yönetici Paneli eklendi.',
      link: '#admin',
      linkText: 'Yönetici Girişi ↗'
    },
    {
      id: 'news-story-calendar',
      title: 'On Beş Bölümlük Hikâyemiz Hazırlandı',
      date: '30 Eylül 2026',
      tag: 'story',
      tagLabel: '📖 Çizgi Roman',
      featured: false,
      content: 'Sen ve beni başrole koyan on beş bölümlük çizgi roman yolculuğumuz kurgulandı. Her yeni bölüm kendi gününde sabırsızlıkla açılmayı bekliyor.',
      link: '#story',
      linkText: 'Bölümlere Göz At ↗'
    },
    {
      id: 'news-photo-diary',
      title: 'İlk Günden Bugüne: 73 Fotoğraflık Günlük',
      date: '28 Eylül 2026',
      tag: 'update',
      tagLabel: '📸 Anı Günlüğü',
      featured: false,
      content: '8 Ekim 2023’teki ilk karemizden başlayarak biriktirdiğimiz 73 anı fotoğrafı, her biri için özenle seçilmiş notlarla günlüğümüze yerleştirildi.',
      link: '#album',
      linkText: 'Anı Günlüğüne Dal ♡'
    },
    {
      id: 'news-sticker-gift',
      title: '7. Bölümün Ardına Saklanan Sürpriz: Sticker Paketi',
      date: 'Yakında',
      tag: 'gift',
      tagLabel: '🎁 Sürpriz Hediye',
      featured: false,
      content: 'Çizgi romanın 7. bölümünde açılacak sihirli hediye kutusunda, WhatsApp sohbetlerimizi renklendirecek 20 adet özel chibi sticker paketi bekliyor.',
      link: '#story',
      linkText: 'Hikâyemize Git ↗'
    },
    {
      id: 'news-grand-finale',
      title: '3 Kasım 2026: Büyük Final Günü',
      date: '3 Kasım 2026',
      tag: 'story',
      tagLabel: '🌸 Büyük Final',
      featured: false,
      content: 'Bütün yolların, bölümlerin ve sürprizlerin birleştiği o özel tarih. Hikâyemizin en güzel sayfası sona saklandı.',
      link: '#home',
      linkText: 'Evrenimize Dön ♡'
    }
  ];

  function getCustomNews() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveCustomNews(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }

  function getAllNews() {
    const custom = getCustomNews();
    return [...custom, ...DEFAULT_ANNOUNCEMENTS];
  }

  window.ANNOUNCEMENTS = getAllNews();
  window.addCustomAnnouncement = function(item) {
    const current = getCustomNews();
    const newEntry = {
      id: 'custom-' + Date.now(),
      title: item.title,
      date: item.date || new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      tag: item.tag || 'update',
      tagLabel: item.tagLabel || '✨ Yenilik',
      featured: Boolean(item.featured),
      content: item.content,
      link: item.link || '',
      linkText: item.linkText || 'Detaylar ↗'
    };
    current.unshift(newEntry);
    saveCustomNews(current);
    window.ANNOUNCEMENTS = getAllNews();
    if (location.hash === '#news') {
      const main = document.querySelector('main');
      if (main) main.innerHTML = window.news();
    }
    return newEntry;
  };

  let activeFilter = 'all';

  window.news = function() {
    const list = getAllNews();
    const filtered = activeFilter === 'all' ? list : list.filter(n => n.tag === activeFilter);

    return `
      <section class="news-section">
        <div class="news-heading">
          <span class="eyebrow">Evrenden Fısıltılar</span>
          <h1>Evrenden <em>havadisler.</em></h1>
          <p>Minik evrenimizde neler değişti, hangi sürprizler eklendi ve bizi neler bekliyor?<br>Bütün yenilikler ve duyurular bu panoda toplanıyor.</p>
        </div>

        <div class="news-filters" role="tablist" aria-label="Duyuru filtreleri">
          <button class="news-filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">Tümü (${list.length})</button>
          <button class="news-filter-btn ${activeFilter === 'update' ? 'active' : ''}" data-filter="update">✨ Yenilikler</button>
          <button class="news-filter-btn ${activeFilter === 'video' ? 'active' : ''}" data-filter="video">🎬 Videolar</button>
          <button class="news-filter-btn ${activeFilter === 'story' ? 'active' : ''}" data-filter="story">📖 Çizgi Roman</button>
          <button class="news-filter-btn ${activeFilter === 'gift' ? 'active' : ''}" data-filter="gift">🎁 Sürprizler</button>
        </div>

        <div class="news-feed" aria-live="polite">
          ${filtered.length ? filtered.map(item => `
            <article class="news-card ${item.featured ? 'featured' : ''}">
              <div class="news-meta">
                <span class="news-tag ${item.tag}">${esc(item.tagLabel || 'Duyuru')}</span>
                <span class="news-date">📅 ${esc(item.date)}</span>
              </div>
              <h2 class="news-title">${esc(item.title)}</h2>
              <div class="news-content">
                <p>${esc(item.content)}</p>
              </div>
              ${item.link ? `
                <div class="news-footer">
                  <a class="news-link" href="${esc(item.link)}">${esc(item.linkText || 'Keşfet ↗')}</a>
                  <span style="font-size:12px; color:#b09db0">bizim minik evrenimiz ♡</span>
                </div>
              ` : ''}
            </article>
          `).join('') : `
            <div class="empty-album" style="padding:40px 20px;">
              <h2>Bu kategoride henüz bir duyuru yok</h2>
              <p>Yakında yepyeni sürprizler eklenecek! ♡</p>
            </div>
          `}
        </div>

        <div class="divider" aria-hidden="true" style="margin-top:60px">✧ ♡ ✧</div>
        <div style="text-align:center; margin-top:20px;">
          <a class="btn secondary" href="#home">Ana Sayfaya Dön ♡</a>
        </div>
      </section>
    `;
  };

  // Filter clicks
  document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.news-filter-btn');
    if (filterBtn) {
      activeFilter = filterBtn.dataset.filter;
      const main = document.querySelector('main');
      if (main && location.hash === '#news') {
        main.innerHTML = window.news();
      }
    }
  });

})();
