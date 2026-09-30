(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const locale=()=>document.documentElement.lang==='en'?'en':document.documentElement.lang==='zh-Hant-HK'?'zh-hk':'zh-cn';
  const t=k=>window.SITE_COPY[locale()]['studio.'+k];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let phase=0,platformStep=0,geoStep=0,selectedCase='office';
  let brief={audience:'family',theme:'make'},pending=false;
  function renderFold(){
    $('.hero-art').dataset.phase=String(phase);
    $$('.fold-stages button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.phase)===phase)));
    $('#fold-deliverable').textContent=t('path.out.'+phase);
  }
  $$('.fold-stages button').forEach(b=>b.addEventListener('click',()=>{phase=Number(b.dataset.phase);renderFold();}));
  function showCase(key){
    if(!['office','platform','geo'].includes(key))return;
    selectedCase=key;
    $$('.case-panel').forEach(p=>{p.hidden=p.id!=='case-'+key;});
    $$('[data-case-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.caseSelect===key)));
  }
  $('#work').classList.add('cases-enhanced');
  $$('[data-case-select]').forEach(b=>b.addEventListener('click',()=>{
    showCase(b.dataset.caseSelect);
    // Replace the hash without forcing the page to jump away from the controls.
    try{const u=new URL(location.href);u.hash='case-'+selectedCase;history.replaceState(null,'',u);}catch{}
  }));
  function selectFromHash(scroll=false){
    const hash=location.hash.slice(1),key=hash.startsWith('case-')?hash.slice(5):hash==='office-demo'?'office':null;
    if(!['office','platform','geo'].includes(key))return;
    showCase(key);
    if(hash.startsWith('case-'))$('#case-'+key+' details').open=true;
    if(scroll)requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView({block:'start',behavior:'instant'}));
  }
  showCase(selectedCase);selectFromHash(true);
  window.addEventListener('hashchange',()=>selectFromHash(true));
  function renderPlatform(){
    $$('[data-platform-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.platformStep)===platformStep)));
    $('#platform-output').innerHTML=`<div class="platform-paper"><small>${escape(t('platform.label.'+platformStep))}</small><h4>${escape(t('platform.title.'+platformStep))}</h4><ul>${['a','b','c'].map((x,i)=>`<li><span>0${i+1}</span><span>${escape(t('platform.row.'+platformStep+x))}</span></li>`).join('')}</ul></div>`;
  }
  $$('[data-platform-step]').forEach(b=>b.addEventListener('click',()=>{platformStep=Number(b.dataset.platformStep);renderPlatform();}));
  function renderGeo(){
    $('#geo-state').textContent=t(['geo.issue','geo.review','geo.retest'][geoStep]);
    $('#geo-note').textContent=t('geo.note.'+geoStep);
    $('#geo-action').textContent=t('geo.action.'+geoStep);
  }
  $('#geo-action').addEventListener('click',()=>{geoStep=(geoStep+1)%3;renderGeo();});
  function planRows(){return [
    {label:t('lab.event'),title:t('lab.event.'+brief.theme),description:t('lab.audience.'+brief.audience)},
    {label:t('lab.material'),title:t('lab.material.'+brief.theme)},
    {label:t('lab.follow'),title:t('lab.follow.'+brief.audience)}
  ];}
  function renderBrief(){
    $('.concept-poster').dataset.theme=brief.theme;
    $('#poster-title').textContent=t('lab.poster.'+brief.theme);
    $('#poster-audience').textContent=t('lab.'+brief.audience);
    $('#poster-theme').textContent=t('lab.'+brief.theme);
    $('#lab-plan').innerHTML=planRows().map((r,i)=>`<li><span>0${i+1}</span><div><h4>${escape(r.label)}</h4><strong>${escape(r.title)}</strong>${r.description?`<p>${escape(r.description)}</p>`:''}</div></li>`).join('');
    $('#lab-status').textContent=t(pending?'lab.pending':'lab.ready');
  }
  $('#lab-form').addEventListener('change',()=>{
    pending=$('#lab-audience').value!==brief.audience||$('#lab-theme').value!==brief.theme;
    $('#lab-status').textContent=t(pending?'lab.pending':'lab.ready');
  });
  $('#lab-form').addEventListener('submit',e=>{
    e.preventDefault();brief={audience:$('#lab-audience').value,theme:$('#lab-theme').value};pending=false;
    renderBrief();$('#lab-status').textContent=t('lab.applied');
    const result=$('.lab-result');result.classList.remove('updated');requestAnimationFrame(()=>result.classList.add('updated'));
  });
  $('#lab-download').addEventListener('click',()=>{
    const body=['Junemoon · '+t('lab.concept'),'',t('lab.poster.'+brief.theme).replace(/\n/g,' '),t('lab.audience')+': '+t('lab.'+brief.audience),t('lab.theme')+': '+t('lab.'+brief.theme),'',...planRows().flatMap(r=>[r.label,r.title,...(r.description?[r.description]:[]),'']),t('lab.note'),t('lab.download.note'),'','riversense11@gmail.com'].join('\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+body],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`Junemoon-event-concept-${locale()}.txt`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  function render(){renderFold();renderPlatform();renderGeo();renderBrief();}
  document.addEventListener('site:language',render);render();
})();
