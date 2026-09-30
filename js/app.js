/* ═══════════════════════════════════════════════════════════════
   APP.JS  ·  all behaviour
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE    = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp   = (v, a, b) => Math.min(Math.max(v, a), b);
  const rand    = (a, b) => a + Math.random() * (b - a);
  const STORE   = 'zozty.letter.v1';
  const pad2    = (n) => String(n).padStart(2, '0');

  /* transient message at the bottom of the screen */
  let toastEl = null, toastT = null;
  function toast(msg, ms = 4200) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  }

  /* ── elements ─────────────────────────────────────────────── */
  const body        = document.body;
  const gate        = $('#gate');
  const enterBtn    = $('#enterBtn');
  const app         = $('#app');
  const deck        = $('#deck');
  const deckInner   = $('#deckInner');
  const navEl       = $('#nav');
  const prevBtn     = $('#prevBtn');
  const nextBtn     = $('#nextBtn');
  const dotsWrap    = $('#dots');
  const counter     = $('#counter');
  const counterNow  = $('#counterNow');
  const counterAll  = $('#counterAll');
  const progressBar = $('#progressBar');
  const swipeHint   = $('#swipeHint');
  const memesSec    = $('#memesSection');
  const memeGrid    = $('#memeGrid');
  const finaleSec   = $('#finale');
  const stage       = $('#finaleStage');
  const yesBtn      = $('#yesBtn');
  const noBtn       = $('#noBtn');
  const noLabel     = $('#noLabel');
  const finaleHint  = $('#finaleHint');
  const foot        = $('#foot');
  const musicBtn    = $('#musicBtn');

  const bgm         = $('#bgm');
  const picker      = $('#imgPicker');
  const heartsWrap  = $('#hearts');
  const cursorGlow  = $('#cursorGlow');

  /* ── text from content.js ─────────────────────────────────── */
  const O        = SITE.opening;
  const LETTERS  = SITE.letters;
  const MEMES    = SITE.memes;
  const FIN      = SITE.finale;
  const TOTAL    = LETTERS.length;

  $('.gate__eyebrow').textContent    = O.eyebrow;
  $('.gate__to').textContent        = O.titleTo;
  $('.gate__name').textContent      = O.name;
  $('.gate__sub').textContent       = O.subtitle;
  $('.btn-enter__label').textContent = O.button;
  $('.gate__note').textContent      = O.footnote;
  $('.topbar__brand-name').textContent = O.name;
  document.title = `${O.titleTo} ${O.name}`;

  bgm.src = SITE.music.src;
  bgm.volume = clamp(SITE.music.volume ?? 0.45, 0, 1);
  counterAll.textContent = pad2(TOTAL);

  /* ═══════════ local storage ═══════════ */
  const readStore  = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } };
  const writeStore = (o)  => {
    try { localStorage.setItem(STORE, JSON.stringify(o)); return true; }
    catch { return false; }   /* quota exceeded — caller decides what to do */
  };
  const saved = readStore();

  /* ═══════════ state (declared up front — helpers reference it) ═══════════ */
  let idx = 0;
  let inExtras = false;
  let entered = false;
  let playing = false;
  let noCount = 0;
  let pickTarget = 0;

  /* ═══════════════════════════════════════════════════════════
     BUILD · LETTERS
     ═══════════════════════════════════════════════════════════ */
  const cards = LETTERS.map((L, i) => {
    const art = document.createElement('article');
    art.className = 'letter';
    art.setAttribute('aria-label', L.label);
    art.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    art.innerHTML = `
      <span class="letter__fold" aria-hidden="true"></span>
      <header class="letter__head">
        <span class="letter__num">${L.label}</span>
        <span class="letter__seal" aria-hidden="true">Z</span>
        ${L.date ? `<span class="letter__date">${L.date}</span>` : ''}
      </header>
      <div class="letter__body">
        <div class="paper" contenteditable="true" spellcheck="false"
             data-editable="letter${i}" data-placeholder="[ YOUR MESSAGE HERE ]"></div>
      </div>`;
    deckInner.appendChild(art);
    return art;
  });

  /* ═══════════════════════════════════════════════════════════
     BUILD · MEMES + FINALE TEXT
     ═══════════════════════════════════════════════════════════ */
  /* set text, and hide the element entirely when the line is left blank */
  const setText = (sel, str) => {
    const el = $(sel);
    if (!el) return;
    el.textContent = str || '';
    el.hidden = !str;
  };

  setText('.sec-head__title', SITE.memesSection.title);
  setText('.sec-sub',        SITE.memesSection.subtitle);
  setText('#finalLabel',     FIN.finalLabel);
  setText('#finaleClose',    FIN.closing);
  $('#finaleQ').textContent         = FIN.question;
  $('.btn-yes__label').textContent  = FIN.yes;
  noLabel.textContent              = FIN.no;
  finaleHint.textContent           = FIN.hint;

  const memeEls = MEMES.map((M, i) => {
    const fig = document.createElement('figure');
    fig.className = 'meme';
    fig.innerHTML = `
      <div class="meme__frame" role="button" tabindex="0" data-meme="${i}"
           aria-label="${M.label} — click to add your image">
        <span class="meme__tag">${M.label}</span>
        <span class="meme__ph" aria-hidden="true">
          <span class="meme__ph-dash"></span>
          <span class="meme__ph-plus">+</span>
          <span class="meme__ph-label">${M.label}</span>
          <span class="meme__ph-hint">add your image</span>
        </span>
        <span class="meme__swap">
          <button type="button" data-act="swap" title="Change image" aria-label="Change image" hidden>&#8635;</button>
          <button type="button" data-act="clear" title="Remove image" aria-label="Remove image" hidden>&#10005;</button>
        </span>
      </div>
      <figcaption class="meme__cap" contenteditable="true" spellcheck="false"
                  data-editable="caption${i}" data-placeholder="[ YOUR CAPTION HERE ]"></figcaption>`;
    memeGrid.appendChild(fig);
    return fig;
  });

  /* ═══════════════════════════════════════════════════════════
     BUILD · DOTS
     ═══════════════════════════════════════════════════════════ */
  const dots = LETTERS.map((L, i) => {
    const b = document.createElement('button');
    b.className = 'dot' + (i === 0 ? ' is-active' : '');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', L.label);
    b.setAttribute('aria-selected', String(i === 0));
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
    return b;
  });

  /* ═══════════════════════════════════════════════════════════
     AMBIENT PARTICLES
     ═══════════════════════════════════════════════════════════ */
  const canvas = $('#ambient');
  const ctx = canvas.getContext('2d');
  let parts = [], W = 0, H = 0, dpr = 1;

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(clamp((W * H) / 26000, 22, 72));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: rand(0.5, 2.1),
      a: rand(0.1, 0.44),
      vy: rand(-0.19, -0.045),
      vx: rand(-0.1, 0.1),
      p: Math.random() * Math.PI * 2,
      ps: rand(0.004, 0.016),
      h: Math.random() < 0.3 ? 345 : 332
    }));
    if (REDUCED) ctx.clearRect(0, 0, W, H);
    measure();
  }

  function drawParts() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.p += p.ps;
      p.x += p.vx + Math.sin(p.p) * 0.24;
      p.y += p.vy;
      if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
      if (p.x < -12) p.x = W + 12;
      if (p.x > W + 12) p.x = -12;
      const R = p.r * 5.2;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
      g.addColorStop(0, `hsla(${p.h}, 78%, 76%, ${p.a})`);
      g.addColorStop(0.42, `hsla(${p.h}, 72%, 60%, ${p.a * 0.34})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(drawParts);
  }
  sizeCanvas();
  if (!REDUCED) drawParts();
  addEventListener('resize', sizeCanvas, { passive: true });

  /* floating hearts — very few, very slow */
  function seedHearts(n) {
    heartsWrap.innerHTML = '';
    if (REDUCED) return;
    const glyphs = ['&#10084;', '&#10087;'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'fheart';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = glyphs[i % glyphs.length];
      s.style.cssText =
        `left:${rand(2, 96).toFixed(2)}%; font-size:${rand(9, 20).toFixed(1)}px; ` +
        `--dx:${rand(-90, 90).toFixed(0)}px; --rot:${rand(-40, 40).toFixed(0)}deg; ` +
        `animation-duration:${rand(24, 46).toFixed(0)}s; animation-delay:${-rand(0, 40).toFixed(0)}s;`;
      heartsWrap.appendChild(s);
    }
  }
  seedHearts(FINE ? 7 : 5);

  /* ═══════════════════════════════════════════════════════════
     CURSOR GLOW + PARALLAX
     ═══════════════════════════════════════════════════════════ */
  if (FINE && !REDUCED) {
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, raf = null;
    body.classList.add('has-cursor');
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });
    function follow() {
      cx += (tx - cx) * 0.085; cy += (ty - cy) * 0.085;
      cursorGlow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) ? requestAnimationFrame(follow) : null;
    }

    const orbs = $$('.bg-orb');
    let px = 0, py = 0, ox = 0, oy = 0, praf = null;
    addEventListener('pointermove', (e) => {
      px = (e.clientX / innerWidth - 0.5) * 2;
      py = (e.clientY / innerHeight - 0.5) * 2;
      if (!praf) praf = requestAnimationFrame(pl);
    }, { passive: true });
    function pl() {
      ox += (px - ox) * 0.04; oy += (py - oy) * 0.04;
      orbs.forEach((o, i) => {
        const d = 12 + i * 9;
        o.style.marginLeft = `${(ox * -d).toFixed(2)}px`;
        o.style.marginTop  = `${(oy * -d).toFixed(2)}px`;
      });
      praf = (Math.abs(px - ox) > 0.002 || Math.abs(py - oy) > 0.002) ? requestAnimationFrame(pl) : null;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     LETTER NAVIGATION
     ═══════════════════════════════════════════════════════════ */
  function measure() {
    const c = cards[idx];
    if (!c) return;
    const h = c.offsetHeight;
    if (h && Math.abs(h - deckInner.clientHeight) > 1) deckInner.style.height = h + 'px';
  }

  function playOpen(card) {
    card.classList.add('is-open');
    clearTimeout(card._t);
    card._t = setTimeout(() => card.classList.remove('is-open'), 1500);
  }

  function go(n, dir) {
    n = clamp(n, 0, TOTAL - 1);
    if (n === idx && cards[idx].classList.contains('is-in')) return;

    const d = dir ?? (n > idx ? 1 : -1);
    const prev = cards[idx];
    const next = cards[n];

    prev.classList.remove('is-in');
    prev.classList.add(d > 0 ? 'is-out-prev' : 'is-out-next');
    prev.setAttribute('aria-hidden', 'true');

    next.classList.remove('is-out-prev', 'is-out-next');
    next.setAttribute('aria-hidden', 'false');

    idx = n;
    measure();
    playOpen(next);
    /* both rAF and a timer: guarantees the reveal even if frames are throttled */
    requestAnimationFrame(() => { next.classList.add('is-in'); measure(); });
    setTimeout(() => { next.classList.add('is-in'); measure(); }, 40);

    paint();
  }

  function paint() {
    counterNow.textContent = pad2(idx + 1);
    counterAll.textContent = pad2(TOTAL);
    counter.classList.remove('is-word');
    progressBar.style.width = `${((idx + 1) / TOTAL) * 100}%`;
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
      d.setAttribute('aria-selected', String(i === idx));
    });
    prevBtn.disabled = idx === 0;
    nextBtn.innerHTML = idx === TOTAL - 1
      ? '<span class="navbtn__text">More</span><span class="navbtn__arrow" aria-hidden="true">&#8250;</span>'
      : '<span class="navbtn__text">Next</span><span class="navbtn__arrow" aria-hidden="true">&#8250;</span>';
    counter.classList.add('bump');
    setTimeout(() => counter.classList.remove('bump'), 700);
  }

  function leaveExtras() {
    inExtras = false;
    memesSec.hidden = true;
    finaleSec.hidden = true;
    finaleSec.classList.remove('is-yes');
    deck.hidden = false;
    navEl.hidden = false;
    swipeHint.hidden = false;
    foot.hidden = true;
    counter.classList.remove('is-word');
    noBtn.classList.add('frozen');
    noBtn.style.left = ''; noBtn.style.top = ''; noBtn.style.transform = '';
    setTimeout(() => noBtn.classList.remove('frozen'), 600);
    noLabel.textContent = FIN.no;
    noCount = 0;
    measure();
    paint();
  }

  function showMemes() {
    inExtras = true;
    deck.hidden = true;
    navEl.hidden = true;
    swipeHint.hidden = true;
    memesSec.hidden = false;
    foot.hidden = true;
    counter.classList.add('is-word');
    counterNow.textContent = `${MEMES.length} moments`;
    progressBar.style.width = '100%';
    dots.forEach(d => d.classList.remove('is-active'));
    memesSec.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
  }

  function showFinale() {
    inExtras = true;
    memesSec.hidden = true;
    deck.hidden = true;
    navEl.hidden = true;
    swipeHint.hidden = true;
    finaleSec.hidden = false;
    foot.hidden = false;
    counter.classList.add('is-word');
    counterNow.textContent = 'the end';
    progressBar.style.width = '100%';
    dots.forEach(d => d.classList.remove('is-active'));
    finaleSec.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    placeNo(false);
    requestAnimationFrame(() => placeNo(false));
    setTimeout(() => placeNo(false), 60);
  }

  prevBtn.addEventListener('click', () => go(idx - 1, -1));
  nextBtn.addEventListener('click', () => (idx === TOTAL - 1 ? showMemes() : go(idx + 1, 1)));
  $('#memesBack').addEventListener('click', () => { leaveExtras(); if (idx !== TOTAL - 1) go(TOTAL - 1, -1); });
  $('#memesNext').addEventListener('click', showFinale);

  /* keyboard */
  addEventListener('keydown', (e) => {
    if (!entered) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); inExtras ? null : (idx === TOTAL - 1 ? showMemes() : go(idx + 1, 1)); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); inExtras ? leaveExtras() : go(idx - 1, -1); }
  });

  /* swipe */
  let sx = 0, sy = 0, tracking = false;
  deck.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
  }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) { idx === TOTAL - 1 ? showMemes() : go(idx + 1, 1); }
      else go(idx - 1, -1);
    }
  }, { passive: true });

  /* ═══════════════════════════════════════════════════════════
     MUSIC
     ═══════════════════════════════════════════════════════════ */
  const setGlyph = () => {
    musicBtn.classList.toggle('is-playing', playing);
    musicBtn.classList.toggle('is-paused', !playing);
    musicBtn.setAttribute('aria-pressed', String(playing));
  };
  function playMusic() {
    const p = bgm.play();
    if (p && p.catch) {
      p.then(() => { playing = true; setGlyph(); })
       .catch(() => { playing = false; setGlyph(); });
    }
  }
  function pauseMusic() { bgm.pause(); playing = false; setGlyph(); }
  musicBtn.addEventListener('click', () => (playing ? pauseMusic() : playMusic()));
  bgm.addEventListener('play',  () => { playing = true; setGlyph(); });
  bgm.addEventListener('pause', () => { playing = false; setGlyph(); });
  bgm.addEventListener('error', () => {
    musicBtn.classList.add('is-missing');
    musicBtn.title = 'Add your audio file at ' + SITE.music.src;
  });
  setGlyph();

  /* ═══════════════════════════════════════════════════════════
     GATE
     ═══════════════════════════════════════════════════════════ */
  function enter() {
    if (entered) return;
    entered = true;
    body.classList.add('is-entering');      /* gate starts fading out (1.25s) */
    playMusic();

    /* the app is revealed underneath while that happens */
    setTimeout(() => {
      body.classList.remove('is-locked');
      body.classList.add('is-entered');
      app.removeAttribute('aria-hidden');
      $('#dock').removeAttribute('aria-hidden');
      gate.setAttribute('aria-hidden', 'true');
      cards[0].classList.add('is-in');
      playOpen(cards[0]);
      measure();
    }, 700);

    /* only drop the class once the gate is display:none, or it fades back in */
    setTimeout(() => {
      gate.hidden = true;
      body.classList.remove('is-entering');
    }, 1300);
  }
  enterBtn.addEventListener('click', enter);
  gate.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) bgm.pause();
    else if (playing) bgm.play().catch(() => {});
  });

  /* ═══════════════════════════════════════════════════════════
     THE RUNAWAY NO BUTTON
     ═══════════════════════════════════════════════════════════ */
  const EDGE = 10;   // px kept from every screen edge

  /* what the NO button must never sit on, and how badly it would hurt */
  const AVOID = [
    { sel: '#finaleQ',         w: 12 },   /* "Do you love me?" — sacred      */
    { sel: '.finale__eyebrow', w: 6 },
    { sel: '#yesBtn',          w: 4 },
    { sel: '#finaleHint',      w: 3 }
  ];

  function keepOut(gap) {
    return AVOID
      .map(a => ({ ...a, el: $(a.sel) }))
      .filter(a => a.el && a.el.offsetParent !== null)
      .map(a => {
        const r = a.el.getBoundingClientRect();
        return {
          w: a.w,
          left: r.left, right: r.right, top: r.top, bottom: r.bottom
        };
      });
  }

  /* weighted cost of parking on top of something (0 = completely clear) */
  function cost(x, y, w, h, zones) {
    let total = 0;
    for (const z of zones) {
      const ox = Math.max(0, Math.min(x + w, z.right) - Math.max(x, z.left));
      const oy = Math.max(0, Math.min(y + h, z.bottom) - Math.max(y, z.top));
      if (ox > 0 && oy > 0) total += ((ox * oy) / (w * h)) * z.w;
    }
    return total;
  }

  function placeNo(randomise = true) {
    /* Measure the button's REAL containing block. Absolute offsets resolve against
       the PADDING box, so origin and extents must both account for it — and the
       clipping must happen against the viewport, not the section. */
    const cp = noBtn.offsetParent || stage;
    const sr = cp.getBoundingClientRect();
    const cs = getComputedStyle(cp);
    const ox = sr.left + (parseFloat(cs.borderLeftWidth) || 0);
    const oy = sr.top  + (parseFloat(cs.borderTopWidth)  || 0);
    const cw = cp.clientWidth, ch = cp.clientHeight;
    const bw = noBtn.offsetWidth  || 172;
    const bh = noBtn.offsetHeight || 47;
    if (!cw || !bw) return;

    const tight = innerWidth < 400 || innerHeight < 620;
    const gap = tight ? 7 : 16;                       /* breathing room when scarce */
    const edge = tight ? 6 : EDGE;

    const vL = Math.max(sr.left, 0), vR = Math.min(sr.left + cw, innerWidth);
    const vT = Math.max(sr.top, 0),  vB = Math.min(sr.top + ch, innerHeight);
    const minX = Math.max(0, vL - ox) + edge, maxX = Math.min(cw, vR - ox) - bw - edge;
    const minY = Math.max(0, vT - oy) + edge, maxY = Math.min(ch, vB - oy) - bh - edge;
    if (maxX < minX || maxY < minY) return;            /* no room at all */

    /* exclusion zones in local coordinates, grown by half the button + gap */
    const zones = keepOut(gap).map(z => ({
      w: z.w,
      left:   z.left   - ox - (bw / 2 + gap),
      right:  z.right  - ox + (bw / 2 + gap),
      top:    z.top    - oy - (bh / 2 + gap),
      bottom: z.bottom - oy + (bh / 2 + gap)
    }));

    const midX = (minX + maxX) / 2;
    let x, y;

    if (!randomise) {
      x = midX;
      y = maxY;
      zones.forEach(z => {
        if (x < z.right && x + bw > z.left && y < z.bottom && y + bh > z.top) {
          y = clamp(y - (bh / 2 + gap), minY, maxY);
        }
      });
    } else {
      let best = { x: midX, y: maxY }, bestCost = Infinity;
      for (let i = 0; i < 140; i++) {
        const tx = rand(minX, maxX);
        const ty = rand(minY, maxY);
        const c = cost(tx, ty, bw, bh, zones);
        if (c <= 0) { best = { x: tx, y: ty }; break; }
        if (c < bestCost) { bestCost = c; best = { x: tx, y: ty }; }
      }
      x = best.x; y = best.y;
      noBtn.classList.add('is-fleeing');
      setTimeout(() => noBtn.classList.remove('is-fleeing'), 420);
    }

    noBtn.style.left = Math.round(x) + 'px';
    noBtn.style.top  = Math.round(y) + 'px';
  }

  function fleeNo() {
    placeNo(true);
    const lines = FIN.noLines;
    if (lines && lines.length) {
      noLabel.textContent = lines[noCount % lines.length];
      noCount++;
    }
  }
  if (FINE) noBtn.addEventListener('pointerenter', fleeNo);
  noBtn.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;   /* mice already flee on hover */
    e.preventDefault();
    fleeNo();
  });
  noBtn.addEventListener('focus', () => { if (FINE) fleeNo(); });
  addEventListener('resize', () => { if (!finaleSec.hidden) placeNo(false); }, { passive: true });

  /* ═══════════════════════════════════════════════════════════
     YES
     ═══════════════════════════════════════════════════════════ */
  yesBtn.addEventListener('click', () => {
    finaleSec.classList.add('is-yes');
    burst();
    playMusic();
    if (REDUCED) return;
    setTimeout(() => finaleSec.scrollIntoView({ behavior: 'smooth', block: 'center' }), 950);
  });

  function burst() {
    if (REDUCED) return;
    const r = yesBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < (FINE ? 34 : 18); i++) {
      const s = document.createElement('span');
      s.className = 'fheart';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = Math.random() < 0.28 ? '&#10087;' : '&#10084;';
      const size = rand(9, 26);
      const ang = rand(0, Math.PI * 2);
      const dist = rand(90, 380);
      s.style.cssText =
        `left:${cx}px; top:${cy}px; font-size:${size}px; animation:none; ` +
        `transform:translate(-50%,-50%);`;
      heartsWrap.appendChild(s);
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist - 40;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.55}px), calc(-50% + ${dy * 0.55}px)) scale(1.1)`, opacity: .95, offset: .35 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 120}px)) scale(.55)`, opacity: 0 }
      ], { duration: rand(1700, 2900), easing: 'cubic-bezier(.2,.6,.3,1)' })
        .finished.then(() => s.remove()).catch(() => s.remove());
    }
  }

  /* ═══════════════════════════════════════════════════════════
     EDITABLE TEXT
     ═══════════════════════════════════════════════════════════ */
  const DEFAULTS = {
    ...Object.fromEntries(LETTERS.map((L, i) => [`letter${i}`, L.message])),
    ...Object.fromEntries(MEMES.map((M, i) => [`caption${i}`, M.caption])),
    finalMessage: FIN.message
  };
  const isPlaceholder = (v) => !v || /^\[\s*YOUR\b.*HERE\s*\]$/i.test(v.trim());

  /* Placeholder text is drawn by CSS `::before` (see .paper/.meme__cap in the
     stylesheet), so the element itself must stay empty — otherwise the label
     renders twice. Real text is rendered as-is. */
  const renderEditable = (el, key, val) => {
    const empty = isPlaceholder(val);
    el.textContent = empty ? '' : val;
    el.classList.toggle('is-empty', empty);
    if (el._mirror) el._mirror.textContent = val;
  };

  $$('[data-editable]').forEach(el => {
    const key = el.dataset.editable;
    const val = saved[key] !== undefined ? saved[key] : (DEFAULTS[key] ?? '');
    renderEditable(el, key, val);
    el.addEventListener('input', () => {
      const s = readStore();
      s[key] = el.textContent;
      writeStore(s);
      renderEditable(el, key, el.textContent);
      clearTimeout(el._m);
      el._m = setTimeout(measure, 120);
    });
    el.addEventListener('focus', () => { if (el.classList.contains('is-empty')) el.textContent = ''; });
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape') el.blur(); });
    el.addEventListener('paste', (e) => {
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, t.replace(/\s*\n\s*/g, ' '));
    });
  });

  /* Click-to-edit is always on now that the settings panel is gone. */
  body.classList.add('is-editing');

  /* Reset without a panel button: hold R for 1.5s to clear everything saved. */
  let resetHold = null, resetT = null;
  const startReset = () => {
    if (resetT) return;
    toast("Keep holding R to erase all saved writing…", 3000);
    resetT = setTimeout(() => {
      const s = readStore();
      Object.keys(DEFAULTS).forEach(k => delete s[k]);
      MEMES.forEach((_, i) => delete s[`img${i}`]);
      writeStore(s);
      location.reload();
    }, 1500);
  };
  const cancelReset = () => { clearTimeout(resetT); resetT = null; };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && !e.metaKey && !e.ctrlKey && !e.altKey) { resetHold = true; startReset(); }
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'r' && resetHold) { resetHold = null; cancelReset(); }
  });
  window.addEventListener('blur', cancelReset);

  /* ═══════════════════════════════════════════════════════════
     MEME IMAGES
     ═══════════════════════════════════════════════════════════ */
  const MAX_BYTES = 4.5 * 1024 * 1024;

  /* Images are persisted as data URLs. Three large photos can exceed the
     ~5 MB localStorage budget, so persistence is best-effort: the picture is
     always shown immediately, and we only tell the user when it won't survive
     a reload. */
  function persistImage(i, dataUrl) {
    const s = readStore();
    s[`img${i}`] = dataUrl;
    if (writeStore(s)) return true;

    delete s[`img${i}`];                 /* roll back so we never store a lie */
    writeStore(s);
    return false;
  }

  function setMeme(i, dataUrl) {
    const fig = memeEls[i];
    const frame = $('[data-meme]', fig);
    let img = $('img', frame);
    if (!img) {
      img = document.createElement('img');
      img.alt = MEMES[i].label;
      frame.insertBefore(img, $('.meme__ph', frame));
    }
    img.src = dataUrl;
    frame.classList.add('has-img');
    $$('[data-act]', fig).forEach(b => (b.hidden = false));
    if (!persistImage(i, dataUrl)) toast("This photo is too large to save — it will vanish on reload. Try one under ~1.5 MB.");
  }

  function clearMeme(i) {
    const fig = memeEls[i];
    $('[data-meme]', fig).classList.remove('has-img');
    $$('[data-act]', fig).forEach(b => (b.hidden = true));
    const s = readStore();
    delete s[`img${i}`];
    writeStore(s);
  }

  function readFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) return;
    if (file.size > MAX_BYTES) { alert('That image is over 4.5 MB — please use a smaller one.'); return; }
    const fr = new FileReader();
    fr.onload = () => setMeme(pickTarget, fr.result);
    fr.readAsDataURL(file);
  }

  memeGrid.addEventListener('click', (e) => {
    const meme = e.target.closest('.meme');
    if (!meme) return;
    const i = +meme.querySelector('[data-meme]').dataset.meme;
    if (e.target.closest('[data-act="clear"]')) { clearMeme(i); return; }
    if (e.target.closest('[data-editable]')) return;          // let people type captions
    if (!body.classList.contains('is-editing')) return;
    pickTarget = i;
    picker.click();
  });
  memeGrid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const frame = e.target.closest('[data-meme]');
    if (!frame) return;
    e.preventDefault();
    pickTarget = +frame.dataset.meme;
    picker.click();
  });
  picker.addEventListener('change', () => { readFile(picker.files[0]); picker.value = ''; });

  /* drag & drop */
  const clearDrop = () => $$('.meme').forEach(f => f.classList.remove('is-dropover'));
  memeGrid.addEventListener('dragover', (e) => {
    const meme = e.target.closest('.meme');
    if (!meme) return;
    e.preventDefault();
    $$('.meme').forEach(f => f.classList.toggle('is-dropover', f === meme));
  });
  memeGrid.addEventListener('dragleave', (e) => {
    if (!memeGrid.contains(e.relatedTarget)) clearDrop();
  });
  memeGrid.addEventListener('drop', (e) => {
    const meme = e.target.closest('.meme');
    clearDrop();
    if (!meme) return;
    e.preventDefault();
    pickTarget = +meme.querySelector('[data-meme]').dataset.meme;
    readFile(e.dataTransfer.files[0]);
  });

  MEMES.forEach((M, i) => {
    if (saved[`img${i}`]) setMeme(i, saved[`img${i}`]);
    else if (M.src) setMeme(i, M.src);
  });

  /* ═══════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════ */
  body.classList.add('is-open');          /* reveals the opening screen */
  counterNow.textContent = '01';
  progressBar.style.width = `${100 / TOTAL}%`;
  if ('ontouchstart' in window) body.classList.add('has-touch');
  paint();

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => { if (!inExtras) measure(); });
    cards.forEach(c => ro.observe(c));
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  addEventListener('load', measure);
  setTimeout(measure, 400);
})();
