from pathlib import Path
from PIL import Image, ImageOps
import json, re, hashlib

root = Path(__file__).resolve().parent
source = root.parent / 'Footğraflar'
target = root / 'dist' / 'assets' / 'photos'
target.mkdir(parents=True, exist_ok=True)
photos = []
notes = ['En sevdiğim manzara, biz.', 'Bu an burada kalsın.', 'Yan yana olmak güzel.', 'Birlikte biriktirdiklerimiz.', 'Bu kareye bir kalp bıraktım.']
for file in sorted(source.iterdir(), key=lambda p: p.name.lower()):
    if file.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
        continue
    with Image.open(file) as original:
        exif = original.getexif()
        date = None
        match = re.search(r'IMG[_-](\d{4})(\d{2})(\d{2})', file.name)
        if match:
            date = '-'.join(match.groups())
        elif str(exif.get(306, '')).count(':') >= 2:
            date = str(exif[306])[:10].replace(':', '-')
        im = ImageOps.exif_transpose(original).convert('RGB')
        ident = hashlib.sha256(file.name.encode('utf-8')).hexdigest()[:14]
        full = im.copy()
        full.thumbnail((1800,1800), Image.Resampling.LANCZOS)
        full.save(target / f'{ident}.webp', 'WEBP', quality=86, method=4)
        thumb = im.copy()
        thumb.thumbnail((620,620), Image.Resampling.LANCZOS)
        thumb.save(target / f'{ident}-thumb.webp', 'WEBP', quality=80, method=4)
        photos.append({'src':f'assets/photos/{ident}.webp','thumb':f'assets/photos/{ident}-thumb.webp','width':im.width,'height':im.height,'date':date,'caption':notes[len(photos)%len(notes)]})
photos.sort(key=lambda p: p['date'] or '9999')
(root / 'photos-manifest.json').write_text(json.dumps(photos, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(photos)} album photos optimized')
