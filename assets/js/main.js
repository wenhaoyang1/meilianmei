/* =========================================================
   美联美 MEILIANMEI · 交互脚本
   assets/js/main.js
   依赖：assets/js/data.js （提供 window.MLM）
   ========================================================= */
(function () {
  'use strict';

  const DATA = window.MLM;
  if (!DATA) { console.error('[MLM] 未找到产品数据，请确认 assets/js/data.js 已加载。'); return; }

  const { CATEGORY_BY_ID, PRODUCT_BY_SLUG, PRODUCTS } = DATA;
  const cardImg = DATA.cardImg;
  const viewImg = DATA.viewImg;

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch      = window.matchMedia('(hover: none)').matches;
  const isDesktop    = window.matchMedia('(min-width: 1000px)').matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2  = n => String(n).padStart(2, '0');

  /* =======================================================
     0. 加载遮罩
     ======================================================= */
  const loader    = $('#loader');
  const loaderBar = loader ? $('.loader__bar i', loader) : null;
  const loaderPct = $('#loaderPct');

  let pct = 0;
  const tick = setInterval(() => {
    pct = Math.min(pct + Math.random() * 14 + 5, 92);
    if (loaderBar) loaderBar.style.width = pct + '%';
    if (loaderPct) loaderPct.textContent = Math.round(pct);
  }, 130);

  function finishLoading() {
    clearInterval(tick);
    if (loaderBar) loaderBar.style.width = '100%';
    if (loaderPct) loaderPct.textContent = '100';
    setTimeout(() => {
      if (loader) loader.classList.add('is-done');
      document.body.classList.remove('is-locked');
      document.documentElement.classList.add('is-loaded');
      startHero();
    }, 520);
    setTimeout(() => { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 1600);
  }
  document.body.classList.add('is-locked');

  /* =======================================================
     1. 产品网格渲染
     ======================================================= */
  const grid = $('#productGrid');

  function cardMarkup(p, i) {
    const cat  = CATEGORY_BY_ID[p.category];
    const meta = [p.size, p.color, p.finish === 'mirror' ? '镜光' : p.finish === 'brush' ? '拉丝' : p.finish === 'sanding' ? '砂光' : '底座'];

    return `
      <article class="card" data-category="${p.category}" data-index="${i}" tabindex="0"
               role="button" aria-label="查看 ${p.name}">
        <div class="card__media">
          <img class="card__img" src="${cardImg(p.slug, 1)}" alt="${p.name}"
               width="1100" height="825" loading="lazy" decoding="async">
          <span class="card__shine" aria-hidden="true"></span>
          ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}
          <span class="card__count">${pad2(p.count)} VIEWS</span>
          <div class="card__view">
            <span>VIEW DETAIL</span>
            <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></i>
          </div>
        </div>
        <div class="card__body">
          <span class="card__cat">${cat ? cat.name : ''}</span>
          <h3 class="card__name">${p.name}</h3>
          <ul class="card__meta">${meta.map(m => `<li>${m}</li>`).join('')}</ul>
          <p class="card__desc">${p.desc}</p>
        </div>
      </article>`;
  }

  if (grid) {
    grid.innerHTML = PRODUCTS.map(cardMarkup).join('');
  }

  /* =======================================================
     2. 滚动揭示 (IntersectionObserver)
     ======================================================= */
  const revealTargets = $$('.reveal, [data-reveal]');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealTargets.forEach((el) => {
      // 同组元素错峰出现
      const sibs = Array.prototype.slice.call(el.parentNode.children).filter(n => n.classList.contains('reveal'));
      const k = sibs.indexOf(el);
      if (k > 0 && k < 8) el.style.transitionDelay = (k * 90) + 'ms';
      io.observe(el);
    });
  } else {
    revealTargets.forEach(el => el.classList.add('is-in'));
  }

  /* =======================================================
     3. 产品卡入场 + 数字滚动
     ======================================================= */
  const cards = $$('.card');
  if (cards.length) {
    cards.forEach((c, i) => { c.style.transitionDelay = (i % 6) * 80 + 'ms'; });
    if ('IntersectionObserver' in window && !reduceMotion) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          cio.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      cards.forEach(c => cio.observe(c));
    } else {
      cards.forEach(c => c.classList.add('is-in'));
    }
  }

  // 统计数字滚动
  const counters = $$('[data-count]');
  function runCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const dur = 1500;
    let t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      const k = clamp((ts - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    const nio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        runCounter(en.target);
        nio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => nio.observe(c));
  } else {
    counters.forEach(c => {
      c.textContent = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || '');
    });
  }

  /* =======================================================
     4. 首屏入场
     ======================================================= */
  const hero = $('#hero');
  function startHero() {
    if (!hero) return;
    hero.classList.add('is-ready');
    $$('[data-hero]', hero).forEach(el => el.classList.add('is-in'));
  }
  // 兜底：若资源加载慢，最多等 3.5 秒也揭开首屏
  window.addEventListener('load', () => setTimeout(finishLoading, 700));
  setTimeout(() => { if (!document.documentElement.classList.contains('is-loaded')) finishLoading(); }, 4000);

  /* =======================================================
     5. 顶部导航 / 进度条 / 视差（统一 rAF 循环）
     ======================================================= */
  const nav       = $('#nav');
  const progress  = $('#progress') ? $('#progress span') : null;
  const parallax  = $$('[data-parallax]');
  const navLinks  = $$('.nav__links a');
  const sections  = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  let lastY = window.scrollY;
  let rafPending = false;

  function onFrame() {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    // 进度条
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    // 导航：滚动后加毛玻璃；向下滚动隐藏
    if (nav) {
      nav.classList.toggle('is-stuck', y > 40);
      if (y > 460 && y > lastY + 4) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 460) nav.classList.remove('is-hidden');
    }

    // 当前区块高亮
    if (sections.length) {
      const probe = y + window.innerHeight * 0.32;
      let active = null;
      sections.forEach((s) => { if (s.offsetTop <= probe) active = s; });
      navLinks.forEach(a => {
        a.classList.toggle('is-current', !!active && a.hash === '#' + active.id);
      });
    }

    // 视差
    if (!reduceMotion && !isTouch) {
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = `translate3d(0, ${(-center * speed).toFixed(2)}px, 0)`;
      });
    }

    lastY = y;
    rafPending = false;
  }

  function requestFrame() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(onFrame);
  }

  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', () => { requestFrame(); measure(); }, { passive: true });
  requestFrame();

  /* =======================================================
     6. 桌面端：磁吸按钮 + 倾斜卡片 + 自定义光标
     ======================================================= */
  if (!isTouch && !reduceMotion) {
    // 磁吸
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${(x * 8).toFixed(2)}px, ${(y * 6).toFixed(2)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // 3D 倾斜
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.style.transform =
          `perspective(1100px) rotateY(${(x * 5).toFixed(2)}deg) rotateX(${(-y * 5).toFixed(2)}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // 自定义光标
    const cur = $('#cursor');
    if (cur) {
      const label = $('.cursor__label', cur);
      let cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;

      window.addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
        cur.classList.add('is-on');
      }, { passive: true });
      document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));

      (function loop() {
        cx += (tx - cx) * 0.16;
        cy += (ty - cy) * 0.16;
        cur.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
        requestAnimationFrame(loop);
      })();

      document.addEventListener('mouseover', (e) => {
        const hot = e.target.closest('[data-cursor], .card, .btn, .filter, .lightbox__thumbs button, .series-item__media');
        if (!hot) { cur.classList.remove('is-hover'); label.textContent = ''; return; }
        const txt = hot.getAttribute('data-cursor') || (hot.classList.contains('card') ? 'View' : '');
        label.textContent = txt;
        cur.classList.toggle('is-hover', !!txt);
      });
    }
  }

  /* =======================================================
     7. 移动端菜单
     ======================================================= */
  const burger = $('#burger');
  const drawer = $('#drawer');

  function setDrawer(open) {
    if (!drawer || !burger) return;
    drawer.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
  }
  if (burger) burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
  if (drawer) $$('.drawer__links a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));

  /* =======================================================
     8. 分类筛选
     ======================================================= */
  const filters  = $$('.filter');
  const emptyMsg = $('#gridEmpty');

  function applyFilter(id) {
    filters.forEach(b => {
      const on = b.getAttribute('data-filter') === id;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    let visible = 0;
    cards.forEach((c) => {
      const show = id === 'all' || c.getAttribute('data-category') === id;
      c.classList.toggle('is-filtered', !show);
      if (show) {
        visible++;
        c.classList.remove('is-in');
        // 重排动画
        const k = visible - 1;
        c.style.transitionDelay = Math.min(k, 8) * 55 + 'ms';
        requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add('is-in')));
      }
    });
    if (emptyMsg) emptyMsg.hidden = visible > 0;
  }
  filters.forEach(b => b.addEventListener('click', () => applyFilter(b.getAttribute('data-filter'))));

  $$('[data-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-jump');
      applyFilter(id);
      const t = $('#products');
      if (t) window.scrollTo({ top: t.offsetTop - 84, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* =======================================================
     9. 产品灯箱
     ======================================================= */
  const lb        = $('#lightbox');
  const lbImg     = $('#lbImg');
  const lbCapCat  = $('#lbCapCat');
  const lbCapName = $('#lbCapName');
  const lbCategory= $('#lbCategory');
  const lbName    = $('#lbName');
  const lbEn      = $('#lbEn');
  const lbDesc    = $('#lbDesc');
  const lbSpecs   = $('#lbSpecs');
  const lbThumbs  = $('#lbThumbs');
  const lbCounter = $('#lbCounter');

  let lbProduct = null;
  let lbIndex   = 1;
  let lastFocus = null;

  const FINISH_LABEL = {
    mirror: '镜光 MIRROR', brush: '拉丝 HAIRLINE',
    sanding: '砂光 SATIN', base: '配件 ACCESSORY'
  };

  function preload(slug, i) {
    const im = new Image();
    im.src = viewImg(slug, i);
  }

  function paintLightbox() {
    if (!lbProduct) return;
    const p   = lbProduct;
    const cat = CATEGORY_BY_ID[p.category];

    lbImg.src = viewImg(p.slug, lbIndex);
    lbImg.alt = `${p.name} 实拍图 ${lbIndex}`;
    if (lbCapCat)   lbCapCat.textContent = cat ? cat.name : '';
    if (lbCapName)  lbCapName.textContent = `${p.name} · 图 ${pad2(lbIndex)}`;
    if (lbCounter)  lbCounter.textContent = `${pad2(lbIndex)} / ${pad2(p.count)} · 共 ${p.count} 张实拍`;

    $$('button', lbThumbs).forEach((b) => {
      b.classList.toggle('is-active', Number(b.getAttribute('data-i')) === lbIndex);
    });

    preload(p.slug, lbIndex % p.count + 1);
    preload(p.slug, lbIndex === 1 ? p.count : lbIndex - 1);
  }

  function openLightbox(slug) {
    const p = PRODUCT_BY_SLUG[slug];
    if (!p || !lb) return;
    lbProduct = p;
    lbIndex   = 1;
    lastFocus = document.activeElement;

    const cat = CATEGORY_BY_ID[p.category];
    if (lbCategory) lbCategory.textContent = cat ? `${cat.index} · ${cat.name}` : '';
    if (lbName)     lbName.textContent = p.name;
    if (lbEn)       lbEn.textContent = p.en;
    if (lbDesc)     lbDesc.textContent = p.desc;
    if (lbSpecs) {
      const rows = [
        ['表面工艺', FINISH_LABEL[p.finish] || '—'],
        ['形状 / 规格', p.shape],
        ['颜色', p.color],
        ['材质', '食品级 304 不锈钢'],
        ['实拍张数', p.count + ' 张'],
        ['系列', cat ? cat.name : '—']
      ];
      lbSpecs.innerHTML = rows
        .map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
    }
    if (lbThumbs) {
      let html = '';
      for (let i = 1; i <= p.count; i++) {
        html += `<button type="button" data-i="${i}" aria-label="查看第 ${i} 张">
                   <img src="${cardImg(p.slug, i)}" alt="" width="1100" height="825" loading="lazy" decoding="async">
                 </button>`;
      }
      lbThumbs.innerHTML = html;
      $$('button', lbThumbs).forEach((b) => {
        b.addEventListener('click', () => { lbIndex = Number(b.getAttribute('data-i')); paintLightbox(); });
      });
    }

    paintLightbox();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    const closeBtn = $('#lbClose');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    lbProduct = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(dir) {
    if (!lbProduct) return;
    const n = lbProduct.count;
    lbIndex = ((lbIndex - 1 + dir + n) % n) + 1;
    paintLightbox();
  }

  // 卡片点击 / 键盘
  if (grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (card) openLightbox(PRODUCTS[Number(card.getAttribute('data-index'))].slug);
    });
    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.card');
      if (!card) return;
      e.preventDefault();
      openLightbox(PRODUCTS[Number(card.getAttribute('data-index'))].slug);
    });
  }

  const lbCloseBtn = $('#lbClose');
  const lbPrevBtn  = $('#lbPrev');
  const lbNextBtn  = $('#lbNext');
  if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeLightbox);
  if (lbPrevBtn)  lbPrevBtn.addEventListener('click', () => step(-1));
  if (lbNextBtn)  lbNextBtn.addEventListener('click', () => step(1));
  if (lb) {
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  }
  const lbInquiry = $('#lbInquiry');
  if (lbInquiry) lbInquiry.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lb && lb.classList.contains('is-open')) closeLightbox();
      else if (drawer && drawer.classList.contains('is-open')) setDrawer(false);
    }
    if (lb && lb.classList.contains('is-open')) {
      if (e.key === 'ArrowLeft')  step(-1);
      if (e.key === 'ArrowRight') step(1);
    }
  });

  // 灯箱内滑动手势
  if (lb) {
    let sx = 0, sy = 0;
    lb.addEventListener('touchstart', (e) => {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* =======================================================
     10. 锚点平滑滚动（补偿固定导航高度）
     ======================================================= */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 82);
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* =======================================================
     11. 年度
     ======================================================= */
  function measure() { requestFrame(); }
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
