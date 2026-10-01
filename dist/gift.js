// Bizim Minik Evrenimiz - Hediye Kutusu & Kilit Açma Mekanizmaları
(function() {
  const ALBUM_STORAGE_KEY = 'minik-evren-album-gift-opened';
  const STICKER_STORAGE_KEY = 'minik-evren-sticker-gift-opened';
  const MAGIC_STORAGE_KEY = 'minik-evren-magic-gift-opened';

  let albumGiftShown = false;
  let stickerGiftShown = false;
  let magicGiftShown = false;

  // 1. Availability Functions
  window.albumGiftAvailable = function() {
    if (window.ADMIN_UNLOCKED) return true;
    const s = window.SIMULATED_START_DATE || (window.CONTENT && window.CONTENT.startDate);
    return Boolean(s && unlocked(0) && ((window.CONTENT && window.CONTENT.chapters[0]?.pages?.length) || window.ADMIN_UNLOCKED));
  };

  window.stickerGiftAvailable = function() {
    if (window.ADMIN_UNLOCKED) return true;
    const s = window.SIMULATED_START_DATE || (window.CONTENT && window.CONTENT.startDate);
    return Boolean(s && unlocked(6) && ((window.CONTENT && window.CONTENT.chapters[6]?.pages?.length) || window.ADMIN_UNLOCKED));
  };

  window.magicGiftAvailable = function() {
    if (window.ADMIN_UNLOCKED) return true;
    const s = window.SIMULATED_START_DATE || (window.CONTENT && window.CONTENT.startDate);
    return Boolean(s && unlocked(8) && ((window.CONTENT && window.CONTENT.chapters[8]?.pages?.length) || window.ADMIN_UNLOCKED));
  };

  function isOpened(key) {
    try {
      return localStorage.getItem(key) === 'yes';
    } catch {
      return false;
    }
  }

  function markOpened(key) {
    try {
      localStorage.setItem(key, 'yes');
    } catch {}
  }

  // 2. Gift Box Dialog Creators
  function albumGiftBox() {
    return `
      <div class="gift-surprise">
        <span class="eyebrow">Hikâyemizin ilk sayfasına bir sürpriz sakladım</span>
        <h2>Sana bir hediyem var ♡</h2>
        <p>İlk günümüzden bugüne biriktirdiğimiz en güzel anılar bu kutunun içinde.</p>
        <button class="gift-open" data-gift-target="album" aria-label="Hediye paketini aç">
          <span class="gift-box" aria-hidden="true">
            <span class="gift-lid"></span>
            <span class="gift-base"></span>
            <span class="gift-bow">♡</span>
            <span class="gift-spark">✧</span>
          </span>
          <span class="gift-prompt">Açmak için dokun</span>
        </button>
        <div class="gift-reveal" hidden>
          <span class="eyebrow">Sadece bize özel bir günlük</span>
          <h2>Bizim Anı Günlüğümüz Açıldı!</h2>
          <p>
            8 Ekim 2023’teki ilk yolculuğumuzdan bugüne kadar biriktirdiğimiz 73 fotoğraf ve yüzlerce güzel his…<br>
            Her sayfada biraz sen, biraz ben, bir dolu biz.<br>
            <strong>Sana özel anı günlüğümüz, sevgilim ♡</strong>
          </p>
          <a class="btn" href="#album" data-gift-link>Anı günlüğümüze dal ♡</a>
        </div>
      </div>
    `;
  }

  function stickerGiftBox() {
    return `
      <div class="gift-surprise">
        <span class="eyebrow">Hikâyemizin 7. sayfasına bir sürpriz sakladım</span>
        <h2>Sana bir hediyem var ♡</h2>
        <p>Bu küçük kutunun içinde biraz sen, biraz ben var.</p>
        <button class="gift-open" data-gift-target="sticker" aria-label="Hediye paketini aç">
          <span class="gift-box" aria-hidden="true">
            <span class="gift-lid"></span>
            <span class="gift-base"></span>
            <span class="gift-bow">♡</span>
            <span class="gift-spark">✧</span>
          </span>
          <span class="gift-prompt">Açmak için dokun</span>
        </button>
        <div class="gift-reveal" hidden>
          <span class="eyebrow">Sadece bize özel</span>
          <h2>Sohbetlerimize de biraz biz serpelim.</h2>
          <p>
            Gülüşümüz, minik triplerimiz, özlemimiz…<br>
            Hepsini 20 küçük stickerın içine sakladım.<br>
            Yanında olamadığım anlarda da yüzünü güldürsün diye.<br>
            <strong>Sana özel WhatsApp sticker paketimiz, sevgilim ♡</strong>
          </p>
          <a class="btn" href="#stickers" data-gift-link>Hediyemizi keşfet ♡</a>
          <a class="gift-download" href="stickers/bizim-minik-evrenimiz.wastickers" download>Paketi indir ↓</a>
        </div>
      </div>
    `;
  }

  function magicGiftBox() {
    return `
      <div class="gift-surprise">
        <span class="eyebrow">Hikâyemizin 9. sayfasına canlı bir hatıra sakladım</span>
        <h2>Sana bir hediyem var ♡</h2>
        <p>Bu kutunun içinde hareket eden kahkahalarımız ve seslerimiz var.</p>
        <button class="gift-open" data-gift-target="magic" aria-label="Hediye paketini aç">
          <span class="gift-box" aria-hidden="true">
            <span class="gift-lid"></span>
            <span class="gift-base"></span>
            <span class="gift-bow">♡</span>
            <span class="gift-spark">✧</span>
          </span>
          <span class="gift-prompt">Açmak için dokun</span>
        </button>
        <div class="gift-reveal" hidden>
          <span class="eyebrow">Canlı ve sesli anlarımız</span>
          <h2>Büyülü Video Odası Açıldı!</h2>
          <p>
            Aramızdaki en kıymetli anlar artık sadece donuk fotoğraflarda kalmıyor…<br>
            Birlikte konuştuğumuz, güldüğümüz ve sarıldığımız 23 özel canlı video kaydımız artık burada canlanıyor.<br>
            <strong>Büyülü video odamız, sevgilim ♡</strong>
          </p>
          <a class="btn" href="#magic" data-gift-link>Videoları izle ▶ ♡</a>
        </div>
      </div>
    `;
  }

  // 3. Story Page Section Banners
  window.storyAlbumGift = function() {
    if (!albumGiftAvailable()) return '';
    return isOpened(ALBUM_STORAGE_KEY)
      ? `<section class="gift-return"><span>📖</span><div><h2>Anı günlüğümüz burada, hep seninle ♡</h2><p>73 özel fotoğraf ve kalbimizde kalan tüm anılar.</p></div><a class="btn" href="#album">Anı günlüğümüz ♡</a></section>`
      : `<section class="gift-return"><span>🎁</span><div><h2>1. Bölüm Sürprizi: Anı Günlüğü ♡</h2><p>Hikâyemizin ilk sayfasına bir sürpriz sakladım.</p></div><button class="btn" data-album-gift-show>Kutuyu aç ♡</button></section>`;
  };

  window.storyGift = function() {
    if (!stickerGiftAvailable()) return '';
    return isOpened(STICKER_STORAGE_KEY)
      ? `<section class="gift-return"><span>🎁</span><div><h2>Hediyemiz burada, hep seninle ♡</h2><p>20 minik stickerla sohbetlerimiz de biraz daha biz.</p></div><a class="btn" href="#stickers">Sticker köşemiz ♡</a></section>`
      : `<section class="gift-return"><span>🎁</span><div><h2>7. Bölüm Sürprizi: Sticker Paketi ♡</h2><p>Hikâyemizin bu sayfasına küçük bir sürpriz sakladım.</p></div><button class="btn" data-gift-show>Kutuyu aç ♡</button></section>`;
  };

  window.storyMagicGift = function() {
    if (!magicGiftAvailable()) return '';
    return isOpened(MAGIC_STORAGE_KEY)
      ? `<section class="gift-return"><span>🎬</span><div><h2>Büyülü video odamız burada ♡</h2><p>23 sesli ve canlı anımız hep seninle.</p></div><a class="btn" href="#magic">Büyülü anılar ▶</a></section>`
      : `<section class="gift-return"><span>🎁</span><div><h2>9. Bölüm Sürprizi: Büyülü Videolar ♡</h2><p>Hikâyemizin bu sayfasına canlı video kayıtları sakladım.</p></div><button class="btn" data-magic-gift-show>Kutuyu aç ♡</button></section>`;
  };

  // 4. Sync Nav Items
  window.syncAllGifts = function() {
    const albumNav = document.querySelector('[data-page="album"]');
    if (albumNav) albumNav.hidden = !albumGiftAvailable();

    const stickerNav = document.querySelector('[data-page="stickers"]');
    if (stickerNav) stickerNav.hidden = !stickerGiftAvailable();

    const magicNav = document.querySelector('[data-page="magic"]');
    if (magicNav) magicNav.hidden = !magicGiftAvailable();

    if (location.hash === '#story' && !modal.open) {
      if (albumGiftAvailable() && !isOpened(ALBUM_STORAGE_KEY) && !albumGiftShown) {
        albumGiftShown = true;
        show(albumGiftBox());
      } else if (stickerGiftAvailable() && !isOpened(STICKER_STORAGE_KEY) && !stickerGiftShown) {
        stickerGiftShown = true;
        show(stickerGiftBox());
      } else if (magicGiftAvailable() && !isOpened(MAGIC_STORAGE_KEY) && !magicGiftShown) {
        magicGiftShown = true;
        show(magicGiftBox());
      }
    }
  };

  window.syncStickerGift = window.syncAllGifts;
  window.syncMagicMemories = window.syncAllGifts;

  // 5. Click Handlers
  document.addEventListener('click', (e) => {
    // Show buttons
    if (e.target.closest('[data-album-gift-show]') && albumGiftAvailable()) {
      show(albumGiftBox());
      return;
    }
    if (e.target.closest('[data-gift-show]') && stickerGiftAvailable()) {
      show(stickerGiftBox());
      return;
    }
    if (e.target.closest('[data-magic-gift-show]') && magicGiftAvailable()) {
      show(magicGiftBox());
      return;
    }

    // Gift open animation
    const openBtn = e.target.closest('.gift-open');
    if (openBtn && !openBtn.disabled) {
      openBtn.disabled = true;
      openBtn.classList.add('opening');
      const target = openBtn.dataset.giftTarget;
      setTimeout(() => {
        const reveal = modal.querySelector('.gift-reveal');
        if (!reveal) return;
        reveal.hidden = false;
        openBtn.hidden = true;
        if (target === 'album') markOpened(ALBUM_STORAGE_KEY);
        else if (target === 'magic') markOpened(MAGIC_STORAGE_KEY);
        else markOpened(STICKER_STORAGE_KEY);
        hearts();
        render();
      }, 850);
    }

    if (e.target.closest('[data-gift-link]')) {
      modal.close();
    }
  });

})();
