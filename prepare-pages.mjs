import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const source = 'dist';
const target = '.pages-site';
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(source, 'content.js'), 'utf8'), sandbox);
const content = sandbox.window.CONTENT;
if (!content) throw new Error('Site içeriği okunamadı.');

const start = Date.parse(content.startDate);
const end = Date.parse(content.finalDate);
const chapterDate = index => start + (end - start) * index / 14;
const giftReady = Number.isFinite(start)
  && Date.now() >= chapterDate(6)
  && content.chapters[6]?.pages?.length > 0;

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, {
  recursive: true,
  filter: file => giftReady || path.relative(source, file).split(path.sep)[0] !== 'stickers',
});
if (!giftReady) {
  fs.writeFileSync(path.join(target, 'sticker-data.js'), 'window.STICKERS=[];\n');
}
console.log(giftReady ? '7. bölüm hediyesi yayına eklendi.' : '7. bölüm hediyesi yayından gizlendi.');
