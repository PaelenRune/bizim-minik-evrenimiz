from pathlib import Path
from PIL import Image, ImageOps
import json, zipfile

root=Path(__file__).resolve().parent
out=root/'dist/stickers'
out.mkdir(parents=True,exist_ok=True)
briefs=json.loads((root/'sticker-briefs.json').read_text(encoding='utf-8'))
items=[]
for ident,title,category,pose in briefs:
    original=root/'sticker-originals'/f'{ident}.png'
    png=out/f'{ident}.png'
    webp=out/f'{ident}.webp'
    if png.exists() and webp.exists() and png.stat().st_mtime>=original.stat().st_mtime and webp.stat().st_mtime>=original.stat().st_mtime and 0<webp.stat().st_size<=100*1024:
        with Image.open(png) as cached:
            assert cached.size==(512,512) and cached.getchannel('A').getextrema()[0]==0
        items.append({'id':ident,'title':title,'category':category,'png':f'stickers/{ident}.png','webp':f'stickers/{ident}.webp'})
        continue
    with Image.open(original) as im:
        im=im.convert('RGBA')
        assert im.getchannel('A').getextrema()[0]==0, f'{ident}: missing transparency'
        im.thumbnail((480,480),Image.Resampling.LANCZOS)
        square=Image.new('RGBA',(512,512),(0,0,0,0))
        square.alpha_composite(im,((512-im.width)//2,(512-im.height)//2))
        square.save(out/f'{ident}.png',optimize=True)
        for quality in [90,85,80,70,60]:
            square.save(out/f'{ident}.webp','WEBP',quality=quality,method=6)
            if (out/f'{ident}.webp').stat().st_size<=100*1024:break
        assert (out/f'{ident}.webp').stat().st_size<=100*1024
        items.append({'id':ident,'title':title,'category':category,'png':f'stickers/{ident}.png','webp':f'stickers/{ident}.webp'})
tray=Image.open(out/'01.png').convert('RGBA').resize((96,96),Image.Resampling.LANCZOS)
tray.save(out/'tray.png',optimize=True)
assert len(items)==20
(root/'dist/sticker-data.js').write_text('window.STICKERS='+json.dumps(items,ensure_ascii=False)+';\n',encoding='utf-8')
with zipfile.ZipFile(out/'bizim-minik-evrenimiz.wastickers','w',zipfile.ZIP_DEFLATED) as pack:
    pack.writestr('title.txt','Bizim Minik Evrenimiz')
    pack.writestr('author.txt','Sen + Ben')
    pack.write(out/'tray.png','tray.png')
    for item in items:pack.write(out/f"{item['id']}.webp",f"{item['id']}.webp")
readme='20 özel chibi sticker.\n\nPaketi telefonunuzda .wastickers destekleyen bir sticker uygulamasında açıp WhatsApp’a ekleyin. WhatsApp web sayfasından bu paketi doğrudan içe aktaramaz. Uygulamanız paketi açamazsa PNG klasöründeki görselleri WhatsApp sticker oluşturucusuna veya sticker uygulamasına tek tek aktarın.\n\nResmî rehber: https://faq.whatsapp.com/1056840314992666\n'
with zipfile.ZipFile(out/'bizim-minik-evrenimiz.zip','w',zipfile.ZIP_DEFLATED) as pack:
    pack.writestr('Beni-oku.txt',readme)
    for item in items:
        for ext in ['png','webp']:pack.write(out/f"{item['id']}.{ext}",f"{ext.upper()}/{item['id']}.{ext}")
    pack.write(out/'bizim-minik-evrenimiz.wastickers','bizim-minik-evrenimiz.wastickers')
canvas=Image.new('RGB',(1000,1320),'#fff7fb')
for i,item in enumerate(items):
    im=Image.open(out/f"{item['id']}.png").convert('RGBA');im.thumbnail((200,300),Image.Resampling.LANCZOS)
    canvas.paste(im,((i%5)*200,(i//5)*330),im)
canvas.save(out/'pack-preview.jpg',quality=90)
print('20 PNG/WebP stickers, .wastickers pack and ZIP created and size/alpha checked')
