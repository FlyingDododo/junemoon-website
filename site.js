(() => {
 'use strict';
 const dicts=window.SITE_COPY;
 const locales={'zh-cn':'zh-Hans-CN','zh-hk':'zh-Hant-HK',en:'en'};
 const origin='https://flyingdododo.github.io/junemoon-website/';
 let lang='zh-cn', stage=0, attachment=false, toastTimer, currentImageCaption='';
 const $=s=>document.querySelector(s);
 const $$=s=>Array.from(document.querySelectorAll(s));
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
   $('.book-title').style.whiteSpace='pre-line';
   const description=t('hero.sub')+' '+t('hero.offer');
   $('meta[name="description"]').content=description;
   $('meta[property="og:title"]').content=t('hero.title');
   $('meta[property="og:description"]').content=description;
   if(currentImageCaption){$('#image-caption').textContent=t(currentImageCaption);$('#full-image').alt=t(currentImageCaption);}
   renderStage();
   if(remember){try{localStorage.setItem('jy_lang',lang);const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);}catch{}}
 }
 function notify(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4000);}
 function setStage(next,{focus=false}={}){
   stage=next;if(stage>=2)attachment=true;
   $$('[data-stage]').forEach(b=>{const on=Number(b.dataset.stage)===stage;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});
   $('#stage-panel').setAttribute('aria-labelledby','stage-tab-'+stage);
   renderStage();if(focus)$('#stage-panel').focus({preventScroll:true});
 }
 function fields(){return `<div class="doc-fields"><div class="doc-field"><small>${tr('doc.field.type')}</small><strong>${tr('doc.type')}</strong></div><div class="doc-field"><small>${tr('doc.field.owner')}</small><strong>${tr('doc.owner')}</strong></div><div class="doc-field"><small>${tr('doc.field.amount')}</small><strong>¥ 200.00</strong></div><div class="doc-field"><small>${tr('doc.field.item')}</small><strong>${tr('doc.item')}</strong></div></div><div class="attachment"><span class="attachment-icon" aria-hidden="true">▤</span><span>${tr('doc.attachment')}</span><span class="missing">${tr(attachment?'doc.attached':'doc.missing')}</span></div>`;}
 function action(key,id,primary=true){return `<button class="${primary?'button primary':'text-link'}" data-action="${id}">${tr(key)}${primary?'<span aria-hidden="true">→</span>':''}</button>`;}
 function renderStage(){
   const role=stage<2?'doc.role.submitter':stage===2?'doc.role.reviewer':'doc.role.handler';
   let body=fields(), note='doc.note.'+stage, actions='';
   if(stage===0)actions=action('doc.check','check');
   if(stage===1){note=attachment?'doc.note.ready':'doc.note.1';actions=attachment?action('doc.submit','submit'):action('doc.add','attach');}
   if(stage===2){body+=`<div class="review-summary"><div><strong>${tr('doc.review.title')}</strong>${tr('doc.review.desc')}</div><div><strong>${tr('doc.access.title')}</strong>${tr('doc.access.desc')}</div></div>`;actions=action('doc.return','return',false)+action('doc.approve','approve');}
   if(stage===3){body=`<ol class="timeline">${[1,2,3].map(i=>`<li><strong>${tr('doc.timeline.'+i)}</strong><small>${tr('doc.timeline.'+i+'.d')}</small></li>`).join('')}</ol>`;actions=action('demo.reset','reset',false);}
   $('#stage-content').innerHTML=`<div class="doc-head"><div><div class="doc-id">${tr('doc.id')}</div><h4>${tr('doc.title')}</h4></div><span class="status-chip">${tr('doc.state.'+stage)}</span></div><div class="doc-paper">${body}</div><p class="doc-note ${stage===1&&!attachment?'warning':''}">${tr(note)}</p><div class="doc-bottom"><div class="doc-owner">${tr('doc.role')}<strong>${tr(role)}</strong></div><div class="doc-actions">${actions}</div></div>`;
 }
 $('#stage-content').addEventListener('click',e=>{
   const btn=e.target.closest('[data-action]');if(!btn)return;
   if(btn.dataset.action==='attach'){attachment=true;renderStage();$('#stage-content [data-action="submit"]').focus({preventScroll:true});return;}
   if(btn.dataset.action==='return'){attachment=false;setStage(1,{focus:true});notify(t('doc.returned'));return;}
   if(btn.dataset.action==='check'){setStage(1,{focus:true});return;}
   if(btn.dataset.action==='submit'){if(attachment)setStage(2,{focus:true});return;}
   if(btn.dataset.action==='approve'){setStage(3,{focus:true});return;}
   if(btn.dataset.action==='reset')resetDemo();
 });
 function resetDemo(){attachment=false;setStage(0);$('#stage-tab-0').focus({preventScroll:true});}
 $('#reset-demo').addEventListener('click',resetDemo);
 $$('[data-stage]').forEach(b=>b.addEventListener('click',()=>setStage(Number(b.dataset.stage))));
 $('.demo-steps').addEventListener('keydown',e=>{const keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'];if(!keys.includes(e.key))return;e.preventDefault();let next=stage;if(e.key==='Home')next=0;else if(e.key==='End')next=3;else next=(stage+(['ArrowRight','ArrowDown'].includes(e.key)?1:3))%4;setStage(next);$('#stage-tab-'+next).focus();});
 $$('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
 function closeMenu(){const open=$('.menu-button').getAttribute('aria-expanded')==='true';$('.menu-button').setAttribute('aria-expanded','false');$('#mobile-nav').hidden=true;return open;}
 $('.menu-button').addEventListener('click',()=>{const open=$('.menu-button').getAttribute('aria-expanded')==='true';$('.menu-button').setAttribute('aria-expanded',String(!open));$('#mobile-nav').hidden=open;});
 $$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&closeMenu())$('.menu-button').focus();});
 document.addEventListener('click',e=>{if(!e.target.closest('.nav')&&!e.target.closest('#mobile-nav'))closeMenu();});
 matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
 async function copy(s){try{await navigator.clipboard.writeText(s);notify(t('copy.success'));}catch{$('#copy-text').value=s;$('#copy-dialog').showModal();$('#copy-text').focus();$('#copy-text').select();}}
 $('#copy-contact').addEventListener('click',()=>copy(t('brand')+' · Junemoon\nriversense11@gmail.com\n+86 187 2153 2448\n'+origin));
 $$('.share-case').forEach(b=>b.addEventListener('click',()=>{const u=new URL(origin);u.searchParams.set('lang',lang);u.hash=b.dataset.share;copy(u.href);}));
 $('#close-copy').addEventListener('click',()=>$('#copy-dialog').close());
 $$('[data-image]').forEach(b=>b.addEventListener('click',()=>{currentImageCaption=b.dataset.caption;$('#full-image').src=b.dataset.image;$('#full-image').alt=t(currentImageCaption);$('#image-caption').textContent=t(currentImageCaption);$('#image-dialog').showModal();}));
 $('#close-image').addEventListener('click',()=>$('#image-dialog').close());
 $$('dialog').forEach(d=>d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();}));
 function deepLink(){const hash=decodeURIComponent(location.hash.slice(1));if(!hash.startsWith('case-'))return;const el=document.getElementById(hash);if(!el)return;const details=el.querySelector('details');if(details)details.open=true;requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'instant'}));}
 window.addEventListener('hashchange',deepLink);
 function downloadBrief(){
   const blocks=[['office.category','office.desc','office.evidence'],['platform.category','platform.desc','platform.state'],['geo.category','geo.desc','geo.boundary']];
   const content=`<!doctype html><html lang="${locales[lang]}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${tr('brief.title')}</title><style>body{font:15px/1.8 -apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;color:#14212f;max-width:800px;margin:40px auto;padding:0 28px}h1{font-size:30px;line-height:1.3;color:#075ccc}h2{font-size:20px;margin-top:25px}h3{font-size:16px;margin:18px 0 7px}p{margin:6px 0}small{color:#5d6876}a{color:#075ccc}header,footer{border-bottom:1px solid #ccd8e7;padding-bottom:18px}footer{border:0;border-top:1px solid #ccd8e7;margin-top:28px;padding-top:18px}@media print{body{margin:0;font-size:12px;line-height:1.65}h1{font-size:26px}h2{font-size:17px;margin-top:17px}h3{margin-top:13px}footer{margin-top:20px}a{color:inherit}}</style><header><h1>${tr('brief.title')}</h1><p>${tr('hero.sub')} ${tr('ap.title')}</p><p>${tr('inc.lead')}</p></header><h2>${tr('work.title')}</h2>${blocks.map(b=>`<section><h3>${tr(b[0])}</h3><p>${tr(b[1])}</p><small>${tr(b[2])}</small></section>`).join('')}<h2>${tr('accounting.title')}</h2><p>${tr('accounting.desc')}</p><small>${tr('accounting.note')}</small><h2>${tr('bd.title')}</h2><p>${tr('boundary.sources.desc')} ${tr('bd.2d')}</p><footer><strong>${tr('ft.legalName')}</strong><p>riversense11@gmail.com · +86 187 2153 2448</p><p><a href="${origin}?lang=${lang}">${origin}</a></p><small>${tr('brief.note')}</small></footer></html>`;
   const url=URL.createObjectURL(new Blob([content],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Junemoon-company-brief-'+lang+'.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);notify(t('brief.ready'));
 }
 $('#download-brief').addEventListener('click',downloadBrief);
 try{const q=new URLSearchParams(location.search).get('lang');lang=dicts[q]?q:(dicts[localStorage.getItem('jy_lang')]?localStorage.getItem('jy_lang'):'zh-cn');}catch{}
 setLang(lang,false);deepLink();
 if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const io=new IntersectionObserver(entries=>{for(const x of entries)if(x.isIntersecting){x.target.classList.add('visible');io.unobserve(x.target);}},{threshold:.08});$$('.section-intro,.manifesto,.accounting-heading,.cooperation-steps,.principles-title').forEach(e=>{e.classList.add('reveal-ready');io.observe(e);});}
})();
