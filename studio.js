/* Studio: showreel, hover previews, in-view loops and the film player. Also drives the studio band on the home page. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const codes = { 'zh-Hans-CN': 'zh-cn', 'zh-Hant-HK': 'zh-hk', en: 'en' };
  const lang = () => codes[document.documentElement.lang] || 'zh-cn';
  const t = k => (window.SITE_COPY[lang()] || {})[k] ?? k;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const thrifty = !!(navigator.connection && navigator.connection.saveData);
  const moving = !calm && !thrifty;
  const A = 'https://media.myjunemoon.com/studio/';

  // Order of shots in reel-720.mp4 / reel-480.mp4 (1.6 s each), built by studio_media.py.
  const REEL = ['a01', 'hotel', 'tennis', 'robot', 'v07', 'v13', 'v09', 'v14', 'v16', 'nezha', 'nezha', 'nezha', 'nezha', 'xmas', 'hotel'];
  const SHOT = 1.6;
  const tests = { v07: 'V07 · 00:15', v09: 'V09 · 00:15', v11: 'V11 · 00:15', v12: 'V12 · 00:15', v13: 'V13 · 00:15', v14: 'V14 · 00:15', v16: 'V16 · 00:15', a01: 'A01 · 00:08' };
  const title = id => id === 'catfish' ? t('st.show.title') : tests[id] ? t('st.v.' + id + '.t') : t('st.f.' + id + '.t');
  const meta = id => id === 'catfish' ? t('st.show.ep') : tests[id] ? tests[id] + ' · ' + t('st.v.' + id + '.x') : t('st.f.' + id + '.k');

  /* Loops that play only while on screen (test strip, home band) */
  const sized = v => (innerWidth < 700 && v.dataset.loopSm) || v.dataset.loop;
  function start(v) { if (!v.src) v.src = sized(v); v.play().then(() => v.classList.add('on')).catch(() => {}); }
  function stop(v) { v.pause(); }
  const inview = $$('video[data-inview]');
  if (moving && inview.length && 'IntersectionObserver' in window) {
    const ob = new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? start : stop)(e.target)), { threshold: .45 });
    inview.forEach(v => ob.observe(v));
  }

  /* Hover previews on film tiles (pointer devices only) */
  if (moving && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.film a').forEach(a => {
      const v = $('video', a);
      a.addEventListener('pointerenter', () => start(v));
      a.addEventListener('pointerleave', () => { stop(v); v.classList.remove('on'); });
    });
  }

  /* Showreel */
  const reel = $('#reel');
  if (reel) {
    const tc = $('#reel-tc'), now = $('#reel-now'), bar = $('#reel-progress'), toggle = $('#reel-toggle');
    const pad = n => String(n).padStart(2, '0');
    let shown = -1;
    const label = () => { const i = Math.min(REEL.length - 1, Math.floor(reel.currentTime / SHOT)); shown = i; $('#reel-now-t').textContent = title(REEL[i]); $('#reel-now-n').textContent = pad(i + 1) + ' / ' + REEL.length; };
    const tick = () => {
      const s = reel.currentTime;
      tc.textContent = `00:00:${pad(Math.floor(s))}:${pad(Math.floor((s % 1) * 24))}`;
      if (reel.duration) bar.style.transform = `scaleX(${s / reel.duration})`;
      if (Math.floor(s / SHOT) !== shown) label();
      if (!reel.paused) requestAnimationFrame(tick);
    };
    const sync = () => { const p = reel.paused; toggle.classList.toggle('paused', p); toggle.setAttribute('data-aria', p ? 'st.reel.play' : 'st.reel.pause'); toggle.setAttribute('aria-label', t(p ? 'st.reel.play' : 'st.reel.pause')); };
    reel.addEventListener('play', () => { sync(); requestAnimationFrame(tick); });
    reel.addEventListener('pause', sync);
    toggle.addEventListener('click', () => (reel.paused ? reel.play() : reel.pause()));
    now.addEventListener('click', () => open(REEL[Math.max(0, shown)]));
    document.addEventListener('langchange', label);
    label(); sync();
    if (moving) {
      reel.play().catch(sync);
      // Don't decode video nobody can see.
      if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { if (!e.isIntersecting) reel.pause(); else if (!reel.dataset.held) reel.play().catch(() => {}); }, { threshold: .1 }).observe(reel);
      toggle.addEventListener('click', () => { reel.dataset.held = reel.paused ? '1' : ''; });
    }
  }

  /* Catfish poster follows the language (the English edition has its own cover and opening) */
  const showImg = $('.show-play img');
  const showLang = () => { if (!showImg) return; showImg.dataset.srcZh ||= showImg.getAttribute('src'); showImg.src = lang() === 'en' ? showImg.dataset.srcEn : showImg.dataset.srcZh; };
  showLang(); document.addEventListener('langchange', showLang);

  /* Player */
  const dlg = $('#player');
  if (!dlg) return;
  const video = $('#player-video'), chapters = $('#player-chapters');
  let current = null, chapter = 0;
  const src = (id, c) => A + (id === 'nezha' ? 'nezha-' + (c + 1) : id === 'catfish' && lang() === 'en' ? 'catfish-en' : id) + '.mp4';
  function paint() {
    $('#player-title').textContent = title(current) + (current === 'nezha' ? ' · ' + t('st.nz.' + (chapter + 1)) : '');
    $('#player-meta').textContent = meta(current);
    chapters.hidden = current !== 'nezha';
    if (current === 'nezha') {
      chapters.innerHTML = `<span>${t('st.chapters')}</span>` + [1, 2, 3, 4, 5, 6, 7].map(n => `<button type="button" data-ch="${n - 1}" aria-pressed="${n - 1 === chapter}">${String(n).padStart(2, '0')} ${t('st.nz.' + n)}</button>`).join('');
    }
  }
  function load(c) { chapter = c; video.src = src(current, c); paint(); video.play().catch(() => {}); }
  function open(id, c = 0) {
    current = id;
    if (reel && !reel.paused) { reel.pause(); reel.dataset.resume = '1'; }
    dlg.showModal(); load(c);
  }
  chapters.addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b) load(+b.dataset.ch); });
  video.addEventListener('ended', () => { if (current === 'nezha' && chapter < 6) load(chapter + 1); });
  $('#player-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => {
    video.pause(); video.removeAttribute('src'); video.load(); current = null;
    if (reel && reel.dataset.resume) { reel.dataset.resume = ''; reel.play().catch(() => {}); }
  });
  document.addEventListener('langchange', () => { if (current) paint(); });
  $$('[data-play]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(a.dataset.play); }));
})();
