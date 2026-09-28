import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const photoDir=path.resolve(root,'../Footğraflar');
const comicDir=path.join(root,'cizgi-roman');
const statePath=path.join(root,'schedule.json');
const state=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):{startDate:null,finalDate:'2026-11-03T00:00:00+03:00'};
const images=dir=>fs.existsSync(dir)?fs.readdirSync(dir).filter(x=>/\.(png|jpe?g|webp|gif)$/i.test(x)).sort((a,b)=>a.localeCompare(b,'tr',{numeric:true})):[];
function copy(file,dir,name){const dest=path.join(root,'dist/assets',dir);fs.mkdirSync(dest,{recursive:true});fs.copyFileSync(file,path.join(dest,name));return `assets/${dir}/${name}`}
const optimized=spawnSync('python',[path.join(root,'optimize-photos.py')],{encoding:'utf8'});
if(optimized.status!==0)throw new Error(optimized.stderr||'Fotoğraflar hazırlanamadı.');
const photos=JSON.parse(fs.readFileSync(path.join(root,'photos-manifest.json'),'utf8'));
const files=Array.from({length:15},(_,i)=>images(path.join(comicDir,String(i+1).padStart(2,'0'))));
if(files[0].length&&!state.startDate){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const start=`${today}T00:00:00+03:00`;if(new Date(start)>=new Date(state.finalDate))throw new Error('Başlangıç finalden önce olmalı; schedule.json içindeki finalDate tarihini güncelleyin.');state.startDate=start;}
const chapters=files.map((list,i)=>({pages:list.map((file,j)=>copy(path.join(comicDir,String(i+1).padStart(2,'0'),file),'comic',`${i+1}-${j+1}${path.extname(file).toLowerCase()}`))}));
fs.writeFileSync(statePath,JSON.stringify(state,null,2));
fs.writeFileSync(path.join(root,'dist/content.js'),`window.CONTENT=${JSON.stringify({...state,photos,chapters})};\n`);
console.log(`${photos.length} fotoğraf, ${chapters.filter(c=>c.pages.length).length} bölüm. Başlangıç: ${state.startDate||'Henüz başlamadı'}`);
