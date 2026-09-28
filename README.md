# Bizim Minik Evrenimiz

Fotoğraflar `D:/Serpapıma/Footğraflar` klasöründen alınır. Desteklenen biçimler JPG, PNG, WebP ve GIF.

Çizgi roman görsellerini `cizgi-roman/01`, `cizgi-roman/02`, … `cizgi-roman/15` klasörlerine koyun. Sayfaları `01.jpg`, `02.jpg` gibi numaralandırın.

`node prepare-content.mjs` fotoğrafları ve bölümleri siteye kopyalar. İlk bölüm bulunduğunda İstanbul tarihiyle takvimi bir kez başlatır ve `schedule.json` dosyasında saklar. Sonraki çalıştırmalar başlangıcı değiştirmez. 15 bölüm başlangıç ve 3 Kasım 2026 arasında eşit aralıklara yayılır. Dosyaları değiştirdikten sonra site yeniden yayınlanmalıdır; çevrimiçi site bilgisayarınızın klasörünü canlı izlemez.

Bu sürümde tarih kilidi arayüz düzeyindedir. Gelecek bölüm görselleri eklendiğinde teknik olarak doğrudan dosya adresinden erişilebilir. Sürpriz sayfaların gerçekten gizli tutulması için çizgi roman eklendiğinde sunucu tarafından tarih kontrolü kurulmalıdır.

İsimler ve kişisel anı notları henüz verilmediğinden kullanılmadı. Genel romantik not site taslağına aittir, gerçek bir anı anlatmaz. Albüm kaynak klasördeki gerçek fotoğrafları kullanır. Kartların notları genel romantik sözlerdir. Tarihler dosya adından veya fotoğrafın EXIF verisinden alınır; mesajlaşma dosyalarının tarihi çekim tarihi olmayabilir. Orijinaller değiştirilmez; albüm için küçük ve büyük WebP kopyaları hazırlanır. Python ve Pillow gerekir.

Yerel önizleme: `python -m http.server 4173 --bind 127.0.0.1 --directory dist`.
