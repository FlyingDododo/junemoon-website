(() => {
 'use strict';
 const dicts=window.SITE_COPY;
 const locales={'zh-cn':'zh-Hans-CN','zh-hk':'zh-Hant-HK',en:'en'};
 const origin='https://flyingdododo.github.io/junemoon-website/';
 const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
 let lang='zh-cn',toastTimer,currentImageCaption='';
 const t=k=>dicts[lang][k]??k;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tr=k=>escape(t(k));
 function setLang(next,remember=true){
   if(!dicts[next])return;
   lang=next;document.documentElement.lang=locales[lang];document.title=t('hero.title');
   $$('[data-i18n]').forEach(e=>e.textContent=t(e.dataset.i18n));
   $$('[data-alt]').forEach(e=>e.alt=t(e.dataset.alt));
   $$('[data-aria]').forEach(e=>e.setAttribute('aria-label',t(e.dataset.aria)));
   $$('[data-lang]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.lang===lang)));
   $('#hero-heading').innerHTML=tr('hero.line1')+'<br><span>'+tr('hero.line2')+'</span>';
   const description=t('hero.sub')+' '+t('hero.offer');
   $('meta[name="description"]').content=description;
   $('meta[property="og:title"]').content=t('hero.title');
   $('meta[property="og:description"]').content=description;
   if(currentImageCaption){$('#image-caption').textContent=t(currentImageCaption);$('#full-image').alt=t(currentImageCaption);}
   if(remember){try{localStorage.setItem('jy_lang',lang);const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);}catch{}}
 }
 function notify(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4000);}
 function closeMenu(){const open=$('.menu-button').getAttribute('aria-expanded')==='true';$('.menu-button').setAttribute('aria-expanded','false');$('#mobile-nav').hidden=true;return open;}
 $$('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
 $('.menu-button').addEventListener('click',()=>{const open=$('.menu-button').getAttribute('aria-expanded')==='true';$('.menu-button').setAttribute('aria-expanded',String(!open));$('#mobile-nav').hidden=open;});
 $$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&closeMenu())$('.menu-button').focus();});
 document.addEventListener('click',e=>{if(!e.target.closest('.nav')&&!e.target.closest('#mobile-nav'))closeMenu();});
 matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
 async function copy(s){try{await navigator.clipboard.writeText(s);notify(t('copy.success'));}catch{$('#copy-text').value=s;$('#copy-dialog').showModal();$('#copy-text').focus();$('#copy-text').select();}}
 $('#copy-contact').addEventListener('click',()=>copy(t('brand')+' · Junemoon\nriversense11@gmail.com\n+86 187 2153 2448\n'+origin));
 $$('.share-case').forEach(b=>b.addEventListener('click',()=>{const u=new URL(origin);u.searchParams.set('lang',lang);u.hash=b.dataset.share;copy(u.href);}));
 $('#close-copy').addEventListener('click',()=>$('#copy-dialog').close());
 $$('[data-image]').forEach(b=>b.addEventListener('click',()=>{currentImageCaption=b.dataset.caption;$('#full-image').src=b.dataset.image;$('#image-original').href=b.dataset.image;$('#full-image').alt=t(currentImageCaption);$('#image-caption').textContent=t(currentImageCaption);$('#image-dialog').showModal();}));
 $('#close-image').addEventListener('click',()=>$('#image-dialog').close());
 $$('dialog').forEach(d=>d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();}));
 function deepLink(){let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{return;}const el=document.getElementById(hash);if(el)requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'instant'}));}
 window.addEventListener('hashchange',deepLink);
 function downloadBrief(){
   const blocks=[['platform.category','e.edu.desc','e.edu.status'],['e.scan.category','e.scan.desc','e.scan.status'],['geo.category','e.geo.desc','e.geo.status']];
   const content=`<!doctype html><html lang="${locales[lang]}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${tr('brief.title')}</title><style>body{font:14px/1.75 -apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;color:#14212f;max-width:800px;margin:35px auto;padding:0 28px}h1{font-size:28px;line-height:1.3;color:#075ccc}h2{font-size:19px;margin:22px 0 12px}h3{font-size:15px;margin:14px 0 5px}p{margin:5px 0}small{color:#536172}a{color:#075ccc}header{border-bottom:1px solid #ccd8e7;padding-bottom:15px}footer{border-top:1px solid #ccd8e7;margin-top:24px;padding-top:15px}.delivery{display:grid;grid-template-columns:1fr 1fr;gap:5px 22px}@media print{body{margin:0;font-size:10px;line-height:1.5}h1{font-size:22px}h2{font-size:16px;margin-top:14px}h3{font-size:12px;margin-top:9px}footer{margin-top:15px}a{color:inherit}}</style><header><h1>${tr('brief.title')}</h1><p>${tr('hero.sub')} ${tr('ap.title')}</p><p>${tr('inc.lead')}</p></header><h2>${tr('work.title')}</h2>${blocks.map(b=>`<section><h3>${tr(b[0])}</h3><p>${tr(b[1])}</p><small>${tr(b[2])}</small></section>`).join('')}<h2>${tr('e.delivery.title')}</h2><div class="delivery">${[1,2,3,4].map(i=>`<section><h3>${tr('e.delivery.'+i+'.t')}</h3><p>${tr('e.delivery.'+i+'.d')}</p></section>`).join('')}</div><footer><strong>${tr('ft.legalName')}</strong><p>riversense11@gmail.com · +86 187 2153 2448</p><p><a href="${origin}?lang=${lang}">${origin}</a></p><small>${tr('e.brief.note')}</small></footer></html>`;
   const url=URL.createObjectURL(new Blob([content],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Junemoon-company-brief-'+lang+'.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);notify(t('brief.ready'));
 }
 $('#download-brief').addEventListener('click',downloadBrief);
 try{const q=new URLSearchParams(location.search).get('lang');let stored;try{stored=localStorage.getItem('jy_lang');}catch{}lang=dicts[q]?q:(dicts[stored]?stored:'zh-cn');}catch{}
 setLang(lang,false);deepLink();
})();
