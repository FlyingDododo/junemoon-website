/* Cover artwork: the folded blue ribbon, drawn in code.
   A paper strip runs over three gates — 01 map the process, 02 AI workflow, 03 keep it running.
   A sheet travels along it; the gate it passes through lights up its label.
   Without JS the original photograph stays in place. */
(() => {
  const fig = document.querySelector('.cover-art');
  if (!fig || !document.createElementNS) return;
  const NS = 'http://www.w3.org/2000/svg';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Geometry, in ribbon units: u runs along the strip, x across it, z up. */
  const W = 138, H = 150, R = 22, L = 152;
  const gates = [170, 410, 650];
  const profile = [[-260, 0]];
  const arc = (cu, cz, a0, a1, n = 10) => { for (let i = 1; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; profile.push([cu + R * Math.cos(a), cz + R * Math.sin(a)]); } };
  for (const s of gates) {
    profile.push([s - R, 0]);
    arc(s - R, R, -Math.PI / 2, 0);
    profile.push([s, H], [s + L, H], [s + L, R]);
    arc(s + L + R, R, Math.PI, Math.PI * 1.5);
  }
  profile.push([1300, 0]);
  // Split long straight runs so painter's order stays correct around objects resting on them.
  const P = [profile[0]];
  for (let i = 1; i < profile.length; i++) {
    const [u0, z0] = profile[i - 1], [u1, z1] = profile[i], n = z0 === 0 && z1 === 0 ? Math.max(1, Math.ceil((u1 - u0) / 40)) : 1;
    for (let k = 1; k <= n; k++) P.push([u0 + (u1 - u0) * k / n, z0 + (z1 - z0) * k / n]);
  }
  const len = [0];
  for (let i = 1; i < P.length; i++) len.push(len[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));

  /* Axonometric projection matching the photograph: strip rises to the right, width falls gently. */
  const proj = (x, u, z) => [u * .93 - x * .45, -u * .3 - x * .28 - z];   // width recedes up-left: gates face the viewer
  const view = [-1, .484, .425];                         // direction toward the viewer (x, y = -u, z): almost along the tunnels
  const light = (() => { const l = [-.42, .4, .8], m = Math.hypot(...l); return l.map(v => v / m); })();
  const facing = (du, dz) => view[1] * dz + view[2] * du;  // > 0: the strip's upper side faces us
  const shade = (du, dz, inner) => {
    const m = Math.hypot(du, dz) || 1; let n = [0, dz / m, du / m];
    if (facing(du, dz) < 0) n = n.map(v => -v);
    const b = Math.max(0, n[0] * light[0] + n[1] * light[1] + n[2] * light[2]) * (inner ? .72 : 1);
    const t = Math.pow(b, .8), lo = [14, 46, 150], hi = [58, 112, 246];
    return `rgb(${lo.map((c, i) => Math.round(c + (hi[i] - c) * t)).join(',')})`;
  };
  const pts = a => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  /* Frame: the gates plus a lead-in, with room above for the labels. */
  const frame = [proj(0, 10, 0), proj(W, 10, 0), proj(0, 880, 0), proj(W, 880, 0), proj(W, gates[2] + L * .5, H + 125), proj(0, 10, -40)];
  const xs = frame.map(p => p[0]), ys = frame.map(p => p[1]);
  const vb = [Math.min(...xs) - 10, Math.min(...ys), Math.max(...xs) - Math.min(...xs) + 20, Math.max(...ys) - Math.min(...ys) + 46];
  const svg = el('svg', { viewBox: vb.map(v => v.toFixed(1)).join(' '), class: 'ribbon', role: 'img' });
  const defs = el('defs', {}, svg);
  const blur = el('filter', { id: 'ribbon-soft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
  el('feGaussianBlur', { stdDeviation: 5 }, blur);

  /* Shadows on the table, cast away from the light. */
  const shadow = el('g', { class: 'r-shadow', filter: 'url(#ribbon-soft)' }, svg);
  const cast = (x, u, z) => proj(x - z * 1.05, u + z * .28, 0);
  for (let i = 1; i < P.length; i++) {
    const [u0, z0] = P[i - 1], [u1, z1] = P[i];
    if (z0 < .5 && z1 < .5) continue;
    el('polygon', { points: pts([cast(0, u0, z0), cast(W, u0, z0), cast(W, u1, z1), cast(0, u1, z1)]) }, shadow);
  }

  /* The strip, far to near. Each gate's faces share a group so it can light up. */
  const strip = el('g', { class: 'r-strip' }, svg);
  const gateOf = u => gates.findIndex(s => u > s - R - 1 && u < s + L + R + 1);
  const groups = [strip, ...gates.map((_, i) => el('g', { class: 'r-gate', 'data-gate': i + 1 }))];
  const segs = [];
  for (let i = 1; i < P.length; i++) segs.push({ i, uc: (P[i - 1][0] + P[i][0]) / 2 });
  segs.sort((a, b) => b.uc - a.uc);
  const order = new Map();                              // segment index → its element, in paint order
  let openGroup = null;
  for (const { i, uc } of segs) {
    const [u0, z0] = P[i - 1], [u1, z1] = P[i], g = gateOf(uc);
    const parent = g < 0 ? strip : groups[g + 1];
    if (g >= 0 && openGroup !== parent) { strip.appendChild(parent); openGroup = parent; }
    if (g < 0) openGroup = null;
    const inner = g >= 0 && facing(u1 - u0, z1 - z0) < 0 && z1 < z0, col = shade(u1 - u0, z1 - z0, inner);
    const poly = el('polygon', { points: pts([proj(0, u0, z0), proj(W, u0, z0), proj(W, u1, z1), proj(0, u1, z1)]), fill: col, stroke: col, 'stroke-width': 1, 'stroke-linejoin': 'round', style: `--d:${(len[i] / len[len.length - 1]).toFixed(3)}` }, parent);
    // The paper's front edge catches the light.
    if (facing(u1 - u0, z1 - z0) > 0 || z1 !== z0) el('line', { x1: proj(0, u0, z0)[0].toFixed(1), y1: proj(0, u0, z0)[1].toFixed(1), x2: proj(0, u1, z1)[0].toFixed(1), y2: proj(0, u1, z1)[1].toFixed(1), class: 'r-edge', style: poly.getAttribute('style') }, parent);
    order.set(i, poly.nextSibling && poly.nextSibling.tagName === 'line' ? poly.nextSibling : poly);
  }

  /* A stack of paper at the start: the material that comes in. */
  const box = (x0, x1, u0, u1, h) => {
    const g = el('g', { class: 'r-stack' });
    el('polygon', { points: pts([proj(x0, u0, 0), proj(x0, u1, 0), proj(x0, u1, h), proj(x0, u0, h)]), fill: '#e4e9f1' }, g);
    el('polygon', { points: pts([proj(x0, u0, 0), proj(x1, u0, 0), proj(x1, u0, h), proj(x0, u0, h)]), fill: '#d5dde9' }, g);
    el('polygon', { points: pts([proj(x0, u0, h), proj(x1, u0, h), proj(x1, u1, h), proj(x0, u1, h)]), fill: '#fbfcfe' }, g);
    for (let z = 3; z < h; z += 3) el('polyline', { points: pts([proj(x1, u0, z), proj(x0, u0, z), proj(x0, u1, z)]), fill: 'none', stroke: '#c6d0de', 'stroke-width': .5 }, g);
    return g;
  };
  const stackU = [70, 128];
  const stack = box(40, 112, stackU[0], stackU[1], 28);
  const firstNear = [...order.entries()].find(([i]) => (P[i - 1][0] + P[i][0]) / 2 < stackU[0]);
  strip.insertBefore(stack, firstNear ? firstNear[1] : null);

  /* The travelling sheet. */
  const sheet = el('polygon', { class: 'r-sheet', fill: '#fff', stroke: '#c9d4e4', 'stroke-width': .6 });
  const total = len[len.length - 1], startS = len[P.findIndex(p => p[0] >= stackU[1])], endS = len[P.findIndex(p => p[0] >= 880)];
  const at = s => { let i = 1; while (i < len.length - 1 && len[i] < s) i++; const f = (s - len[i - 1]) / (len[i] - len[i - 1] || 1); return { i, u: P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, z: P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f }; };
  function placeSheet(s) {
    const n = 6, edge = [], back = [];
    let last = 0, seen = 0;
    for (let k = 0; k <= n; k++) {
      const p = at(s + 30 * k / n); const lift = .8;
      edge.push(proj(52, p.u, p.z + lift)); back.push(proj(100, p.u, p.z + lift));
      last = Math.max(last, p.i);
      const [u0, z0] = P[p.i - 1], [u1, z1] = P[p.i];
      if (facing(u1 - u0, z1 - z0) > 0) seen++;
    }
    sheet.setAttribute('points', pts([...edge, ...back.reverse()]));
    sheet.style.visibility = seen > 3 ? 'visible' : 'hidden';
    // Paint just after the nearest strip face it rests on, so faces in front still cover it.
    let nearest = null, best = Infinity;
    for (let k = 0; k <= n; k++) { const p = at(s + 30 * k / n), uc = (P[p.i - 1][0] + P[p.i][0]) / 2; if (uc < best) { best = uc; nearest = order.get(p.i); } }
    if (nearest && sheet.previousSibling !== nearest) nearest.parentNode.insertBefore(sheet, nearest.nextSibling);
    return gateOf(at(s + 15).u);
  }

  /* Labels are static HTML in the figure; place them over each gate. */
  const tags = [...fig.querySelectorAll('.gate-tag')];
  tags.forEach((tag, i) => {
    const [x, y] = proj(W * .5, gates[i] + L * .5, H);
    tag.style.left = ((x - vb[0]) / vb[2] * 100).toFixed(2) + '%';
    tag.style.top = ((y - vb[1]) / vb[3] * 100).toFixed(2) + '%';
  });
  let hover = -1;
  const light_ = g => {
    groups.slice(1).forEach((grp, i) => grp.classList.toggle('on', i === g));
    tags.forEach((tag, i) => tag.classList.toggle('on', i === g));
  };
  tags.forEach((tag, i) => {
    tag.addEventListener('mouseenter', () => { hover = i; light_(i); });
    tag.addEventListener('focus', () => { hover = i; light_(i); });
    tag.addEventListener('mouseleave', () => { hover = -1; });
    tag.addEventListener('blur', () => { hover = -1; });
  });

  const label = fig.querySelector('img');
  if (label) svg.setAttribute('aria-label', label.getAttribute('alt'));
  svg.setAttribute('data-aria', 'home.art');
  const pic = fig.querySelector('picture');
  fig.insertBefore(svg, pic);
  if (pic) pic.remove();
  fig.classList.add('is-live');

  if (calm) return;
  fig.classList.add('is-intro');
  strip.appendChild(sheet); placeSheet(startS); sheet.style.opacity = 0;

  /* Loop: the sheet leaves the stack, passes the three gates, fades, and comes round again. */
  const SPEED = 92, PAUSE = 1400, INTRO = 1900;     // units per second; ms
  let t0 = null, running = true, visible = true, raf = 0;
  const travel = (endS - startS) / SPEED * 1000;
  function frameStep(now) {
    raf = 0;
    if (!running) return;
    if (t0 === null) t0 = now;
    const t = (now - t0 - INTRO) % (travel + PAUSE);
    if (now - t0 < INTRO) { raf = requestAnimationFrame(frameStep); return; }
    if (t < travel) {
      const s = startS + (endS - startS) * (t / travel);
      const g = placeSheet(s);
      sheet.style.opacity = Math.min(1, t / 300, (travel - t) / 400);
      if (hover < 0) light_(g);
    } else { sheet.style.opacity = 0; if (hover < 0) light_(-1); }
    raf = requestAnimationFrame(frameStep);
  }
  const resume = () => { running = visible && !document.hidden; if (running && !raf) raf = requestAnimationFrame(frameStep); };
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; resume(); }).observe(fig);
  document.addEventListener('visibilitychange', resume);
  resume();
  setTimeout(() => fig.classList.remove('is-intro'), INTRO + 400);
})();
