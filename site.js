(() => {
  'use strict';
  const dicts = window.SITE_COPY;
  const locales = { 'zh-cn': 'zh-Hans-CN', 'zh-hk': 'zh-Hant-HK', en: 'en' };
  const origin = 'https://myjunemoon.com/';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  let lang = 'zh-cn', toastTimer, currentCaption = '';
  const t = k => (dicts[lang] && dicts[lang][k]) ?? k;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plain = s => String(s).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '');

  /* Language */
  function setLang(next, remember = true) {
    if (!dicts[next]) return;
    const changed = next !== lang;
    lang = next;
    document.documentElement.lang = locales[lang];
    document.title = t($('title').dataset.title || 'meta.title');
    $$('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
      if (changed && remember && !calm.matches) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); }
    });
    // Dictionary strings are our own content; only <br> and <em> are used.
    $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-alt]').forEach(el => { el.alt = t(el.dataset.alt); });
    $$('[data-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.aria)));
    $$('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === lang)));
    const desc = document.body.dataset.desc;  // pages with their own description also share under their own title
    $('meta[name="description"]').content = t(desc || 'meta.desc');
    $('meta[property="og:title"]').content = desc ? document.title : t('meta.title');
    $('meta[property="og:description"]').content = t(desc || 'meta.desc');
    if (currentCaption) { $('#image-caption').textContent = t(currentCaption); $('#full-image').alt = t(currentCaption); }
    // Keep the language when moving between pages.
    $$('a[href]').forEach(a => {
      const raw = a.getAttribute('href');
      if (!/^(\.\/|work\.html|approach\.html|studio\.html)/.test(raw)) return;
      const [path, hash] = raw.split('#');
      a.setAttribute('href', path.split('?')[0] + '?lang=' + lang + (hash ? '#' + hash : ''));
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    if (remember) {
      try { localStorage.setItem('jy_lang', lang); } catch {}
      try { const url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(null, '', url); } catch {}
    }
  }
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* Navigation */
  const nav = $('#nav'), menuBtn = $('.menu-button'), mobile = $('#mobile-nav');
  function closeMenu() { const open = menuBtn.getAttribute('aria-expanded') === 'true'; menuBtn.setAttribute('aria-expanded', 'false'); mobile.hidden = true; return open; }
  menuBtn.addEventListener('click', () => { const open = menuBtn.getAttribute('aria-expanded') === 'true'; menuBtn.setAttribute('aria-expanded', String(!open)); mobile.hidden = open; if (!open) $('a', mobile).focus(); });
  $$('a', mobile).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && closeMenu()) menuBtn.focus(); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav') && !e.target.closest('#mobile-nav')) closeMenu(); });
  matchMedia('(min-width:1081px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const io = 'IntersectionObserver' in window;
  // Current page in the nav; on the home page, follow the section in view.
  const page = document.body.className.replace('page-', '');
  $$('.nav-links a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
  if (io && page === 'home') {
    const links = new Map($$('.nav-links a[data-page]').map(a => [a.dataset.page, a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) links.forEach((a, id) => a.classList.toggle('active', id === en.target.id)); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'about', 'capabilities', 'contact'].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* Reveal on first view — elements are visible unless JS marks them pending. */
  function onFirstView(els, fn, opts = { rootMargin: '0px 0px -12% 0px' }) {
    if (!io) { els.forEach(fn); return; }
    const ob = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { ob.unobserve(en.target); fn(en.target); } }), opts);
    els.forEach(el => ob.observe(el));
  }
  if (!calm.matches && io) {
    $$('.reveal-group').forEach(g => $$('.reveal', g).forEach((el, i) => el.style.setProperty('--i', i)));
    const reveals = $$('.reveal').filter(el => el.getBoundingClientRect().top > innerHeight * .9);
    reveals.forEach(el => el.classList.add('pending'));
    onFirstView(reveals, el => el.classList.remove('pending'));
    const annotated = $$('.annotated'); annotated.forEach(el => el.classList.add('pending'));
    onFirstView(annotated, el => el.classList.remove('pending'), { rootMargin: '0px 0px -25% 0px' });
    const lanes = $$('.lanes'); lanes.forEach(el => el.classList.add('pending'));
    onFirstView(lanes, el => el.classList.remove('pending'), { rootMargin: '0px 0px -20% 0px' });
    const insets = $$('.inset-shot, .rep-visual, .cadence'); insets.forEach(el => el.classList.add('pending'));
    onFirstView(insets, el => el.classList.remove('pending'), { rootMargin: '0px 0px -20% 0px' });
    const geo = $$('.geo-chart'); geo.forEach(el => el.classList.add('pending'));
    onFirstView(geo, el => el.classList.remove('pending'), { rootMargin: '0px 0px -20% 0px' });
    if ($('#fig-gateway')) onFirstView([$('#fig-gateway')], fig => {
      $$('.gw-node', fig).forEach((n, i) => { setTimeout(() => n.classList.add('lit'), 160 * i); setTimeout(() => n.classList.remove('lit'), 160 * i + 900); });
    }, { rootMargin: '0px 0px -30% 0px' });
  }

  /* Fig 01: the execution-cost line drops; rows it passes become worth doing. */
  const fig = $('#fig-threshold');
  if (fig) {
    const rows = $$('.th-rows li', fig);
    const OLD = .82, NEW = .38, DUR = 1500;
    let timers = [];
    const inverse = y => 1 - Math.cbrt(1 - y); // time fraction at which the eased line reaches y
    function show(state, animate) {
      timers.forEach(clearTimeout); timers = [];
      $$('[data-th]', fig).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.th === state)));
      fig.classList.toggle('animate', animate);
      fig.classList.toggle('is-before', state === 'before');
      rows.forEach(li => {
        const v = parseFloat(li.style.getPropertyValue('--v'));
        const viable = state === 'after' ? v > NEW : v > OLD;
        if (!animate || state === 'before') { li.classList.toggle('viable', viable); return; }
        const frac = inverse(Math.min(1, Math.max(0, (OLD - v) / (OLD - NEW))));
        timers.push(setTimeout(() => li.classList.toggle('viable', viable), frac * DUR));
      });
    }
    $$('[data-th]', fig).forEach(b => b.addEventListener('click', () => show(b.dataset.th, !calm.matches)));
    if (calm.matches || !io || !(window.CSS && CSS.registerProperty)) {
      show('after', false);
    } else {
      show('before', false);
      onFirstView([fig], () => setTimeout(() => show('after', true), 450), { threshold: .4 });
    }
  }

  /* Copy, share, dialogs */
  function notify(s) { const el = $('#toast'); el.textContent = s; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3200); }
  async function copy(s) {
    try { await navigator.clipboard.writeText(s); notify(t('copy.success')); }
    catch { $('#copy-text').value = s; $('#copy-dialog').showModal(); $('#copy-text').focus(); $('#copy-text').select(); }
  }
  $('#copy-contact').addEventListener('click', () => copy(t('brand') + ' · Junemoon\nriversense11@gmail.com\n+86 187 2153 2448\n' + origin));
  $$('.share').forEach(b => b.addEventListener('click', () => { const u = new URL(page === 'work' ? 'work' : '', origin); u.searchParams.set('lang', lang); u.hash = b.dataset.share; copy(u.href); }));
  $('#close-copy').addEventListener('click', () => $('#copy-dialog').close());
  $$('[data-image]').forEach(b => b.addEventListener('click', () => {
    currentCaption = b.dataset.caption;
    $('#full-image').src = b.dataset.image; $('#image-original').href = b.dataset.image;
    $('#full-image').alt = t(currentCaption); $('#image-caption').textContent = t(currentCaption);
    $('#image-dialog').showModal();
  }));
  $('#image-dialog').addEventListener('close', () => { currentCaption = ''; });
  $('#close-image').addEventListener('click', () => $('#image-dialog').close());
  $$('dialog').forEach(d => d.addEventListener('click', e => {
    const r = d.getBoundingClientRect();
    if (e.target === d && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) d.close();
  }));

  function deepLink() {
    let hash; try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const el = hash && document.getElementById(hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  addEventListener('hashchange', deepLink);

  /* One-page brief, generated in the current language */
  function downloadBrief() {
    const tr = k => esc(plain(t(k)));
    const cases = [['scan', 'scan.category', 'scan.title', 'scan.status', 'scan.did'], ['edu', 'edu.category', 'edu.title', 'edu.status', 'edu.did'], ['gate', 'gate.category', 'gate.title', 'gate.status', 'gate.did'], ['office', 'office.category', 'office.title', 'office.status', 'office.did'], ['geo', 'geo.category', 'geo.title', 'geo.status', 'geo.did']];
    const steps = [1, 2, 3, 4].map(i => `<li><b>${tr('ap.' + i + '.t')}</b> — ${tr('ap.' + i + '.g')}</li>`).join('');
    const html = `<!doctype html><html lang="${locales[lang]}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${tr('brief.title')}</title>
<style>body{font:14px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#0d1b2e;max-width:780px;margin:36px auto;padding:0 28px}h1{font-size:26px;line-height:1.3;margin:0 0 8px}h2{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#2e66c4;margin:26px 0 10px;font-family:ui-monospace,Consolas,monospace}h3{font-size:15px;margin:12px 0 2px}p,li{margin:4px 0;color:#2f3f54}small{color:#5f6e82;font-family:ui-monospace,Consolas,monospace;font-size:11.5px}header{border-bottom:1.5px solid #0d1b2e;padding-bottom:14px}ol{padding-left:18px}footer{border-top:1px solid #d7dee8;margin-top:24px;padding-top:12px}a{color:#2e66c4}@media print{body{margin:0;font-size:10.5px;line-height:1.5}h1{font-size:20px}h2{margin-top:14px}a{color:inherit}}</style>
<header><h1>${tr('brief.title')}</h1><p>${tr('hero.lead')}</p></header>
<h2>${tr('idea.title')}</h2><p>${tr('idea.lead')}</p>
<h2>${tr('ap.title')}</h2><ol>${steps}</ol>
<h2>${tr('brief.cases')}</h2>${cases.map(c => `<section><h3>${tr(c[2])}</h3><small>${tr(c[1])} · ${tr(c[3])}</small><p>${tr(c[4])}</p></section>`).join('')}
<footer><strong>${tr('ft.legalName')}</strong><p>riversense11@gmail.com · +86 187 2153 2448 · <a href="${origin}?lang=${lang}">${origin}</a></p><small>${tr('brief.note')}</small></footer></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'Junemoon-brief-' + lang + '.html';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    notify(t('brief.ready'));
  }
  $('#download-brief').addEventListener('click', downloadBrief);

  /* Initial language: ?lang= > stored > default */
  try {
    const q = new URLSearchParams(location.search).get('lang');
    let stored; try { stored = localStorage.getItem('jy_lang'); } catch {}
    lang = dicts[q] ? q : (dicts[stored] ? stored : 'zh-cn');
  } catch {}
  setLang(lang, false);
  deepLink();
  // Late layout (lazy images, fonts) can move the target; correct once if the visitor hasn't scrolled.
  if (location.hash) {
    let settled; requestAnimationFrame(() => { settled = scrollY; });
    addEventListener('load', () => setTimeout(() => { if (Math.abs(scrollY - settled) < 4) deepLink(); }, 60), { once: true });
  }
})();
