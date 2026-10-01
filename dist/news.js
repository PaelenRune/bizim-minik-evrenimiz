// Bizim Minik Evrenimiz - Duyurular & Yenilikler Bölümü
(function() {
  const STORAGE_KEY = 'minik_evren_custom_news';

  const DEFAULT_ANNOUNCEMENTS = [];

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

        ${list.length ? `
        <div class="news-filters" role="tablist" aria-label="Duyuru filtreleri">
          <button class="news-filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">Tümü (${list.length})</button>
          <button class="news-filter-btn ${activeFilter === 'update' ? 'active' : ''}" data-filter="update">✨ Yenilikler</button>
          <button class="news-filter-btn ${activeFilter === 'video' ? 'active' : ''}" data-filter="video">🎬 Videolar</button>
          <button class="news-filter-btn ${activeFilter === 'story' ? 'active' : ''}" data-filter="story">📖 Çizgi Roman</button>
          <button class="news-filter-btn ${activeFilter === 'gift' ? 'active' : ''}" data-filter="gift">🎁 Sürprizler</button>
        </div>` : ''}

        <div class="news-feed" aria-live="polite">
          ${list.length ? (filtered.length ? filtered.map(item => `
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
          `) : `
            <div class="empty-album" style="padding:60px 20px;">
              <h2>Henüz bir duyuru yok ♡</h2>
              <p>Evrenimizdeki yeni sürprizler ve havadisler burada paylaşılacak.</p>
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
