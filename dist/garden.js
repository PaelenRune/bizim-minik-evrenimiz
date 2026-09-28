(()=>{
 const toggle=document.getElementById('motion-toggle');
 const couple=document.querySelector('.chibi-friends img');
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 let paused=preference.matches;
 try{const saved=localStorage.getItem('garden-motion');if(saved!==null)paused=saved==='paused'||preference.matches}catch{}
 function apply(){document.body.classList.toggle('garden-paused',paused);toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Hareketleri başlat':'Hareketleri durdur';couple.src=paused?'assets/chibi-couple.png':'assets/chibi-couple.gif'}
 toggle.addEventListener('click',()=>{paused=!paused;apply();try{localStorage.setItem('garden-motion',paused?'paused':'running')}catch{}});
 preference.addEventListener('change',event=>{paused=event.matches;apply()});
 document.getElementById('chibi-love').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();hearts(r.left+r.width/2,r.top+r.height/2);const t=document.getElementById('toast');t.textContent='Minik bizden, kocaman bir kalp! ♡';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)});
 apply();
})();
