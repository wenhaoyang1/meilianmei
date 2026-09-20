/* =========================================================
   美联美 MEILIANMEI · 交互脚本
   assets/js/main.js
   依赖：assets/js/data.js（window.MLM）、assets/js/translations.js（window.MLM_I18N）
   ========================================================= */
(function () {
  'use strict';

  const DATA = window.MLM;
  if (!DATA) { console.error('[MLM] 未找到产品数据，请确认 assets/js/data.js 已加载。'); return; }

  const DICT = window.MLM_I18N || { zh: {}, en: {} };

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
     语言状态：zh / en（由进入网站时的选择页决定，可随时切换）
     ======================================================= */
  const LANG_KEY = 'mlm-lang';
  const YEAR = new Date().getFullYear();
  let lang = 'zh';
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'zh' || saved === 'en') lang = saved;
  } catch (e) { /* 隐私模式等场景忽略 */ }

  const t = (key, vars) => {
    let s = (DICT[lang] && DICT[lang][key] != null) ? DICT[lang][key] : (DICT.zh[key] || key);
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  };
  const isEn    = () => lang === 'en';
  const pName   = p => (isEn() && p.nameEn) ? p.nameEn : p.name;
  const pDesc   = p => (isEn() && p.descEn) ? p.descEn : p.desc;
  const cName   = c => (isEn() && c && c.nameEn) ? c.nameEn : (c ? c.name : '');
  const cDesc   = c => (isEn() && c && c.descEn) ? c.descEn : (c ? c.desc : '');

  /* 规格值（形状 / 尺寸 / 颜色）的英文对照 */
  const SPEC_EN = {
    '圆形': 'Round', '正方形': 'Square', '三角形': 'Triangle',
    '八边形': 'Octagon', '内凹圆': 'Concave round', '座式': 'Pedestal',
    '圆形套装': 'Round set', '方形套装': 'Square set', '10 cm 套装': '10 cm set',
    '底座配件': 'Base accessory', '方形': 'Square', '三角': 'Triangle',
    '八边': 'Octagon', '内凹': 'Concave', '10 cm': '10 cm', '8 cm': '8 cm',
    '金色': 'Gold', '银色': 'Silver'
  };
  const spec = v => (isEn() && SPEC_EN[v]) ? SPEC_EN[v] : v;

  /* 语言选择页 */
  const gate = $('#gate');
  /* 首次来访需等加载动画结束后再展示语言选择页 */
  let pendingGate = false;
  /* 当前分类筛选（语言切换后重绘网格时保持） */
  let currentFilter = 'all';

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
      /* 首次来访：先让用户选语言；老访客：直接播放首屏动画 */
      if (pendingGate) setTimeout(showGate, 620);
      else startHero();
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
    const meta = [spec(p.size), spec(p.color), t('finish.' + p.finish)];

    return `
      <article class="card" data-category="${p.category}" data-index="${i}" tabindex="0"
               role="button" aria-label="${pName(p)}">
        <div class="card__media">
          <img class="card__img" src="${cardImg(p.slug, 1)}" alt="${pName(p)}"
               width="1100" height="825" loading="lazy" decoding="async">
          <span class="card__shine" aria-hidden="true"></span>
          ${p.tag ? `<span class="card__tag">${isEn() && p.tagEn ? p.tagEn : p.tag}</span>` : ''}
          <span class="card__count">${pad2(p.count)} ${t('prod.views')}</span>
          <div class="card__view">
            <span>${t('prod.viewDetail')}</span>
            <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></i>
          </div>
        </div>
        <div class="card__body">
          <span class="card__cat">${cName(cat)}</span>
          <h3 class="card__name">${pName(p)}</h3>
          <ul class="card__meta">${meta.map(m => `<li>${m}</li>`).join('')}</ul>
          <p class="card__desc">${pDesc(p)}</p>
        </div>
      </article>`;
  }

  // 首次渲染用 try/catch 兜底：gridEmpty / filter 等引用在脚本后段才初始化
  if (grid) {
    try { grid.innerHTML = PRODUCTS.map(cardMarkup).join(''); }
    catch (err) { console.error('[MLM] 产品网格首次渲染失败', err); }
  }

  /* 语言切换后重新渲染产品网格（文案随语言变化） */
  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(cardMarkup).join('');
    cards = $$('.card', grid);
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

    /* 重绘后同步当前筛选状态（过滤器引用用 DOM 现查，避免初始化顺序问题） */
    try {
      applyFilter(currentFilter);
    } catch (err) {
      $$('.filter').forEach(b => {
        b.classList.toggle('is-active', b.getAttribute('data-filter') === currentFilter);
      });
      cards.forEach(c => {
        c.classList.toggle('is-filtered',
          currentFilter !== 'all' && c.getAttribute('data-category') !== currentFilter);
      });
    }
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
  let cards = $$('.card');
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
     4. 首屏入场 + 语言选择
     ======================================================= */
  const hero = $('#hero');
  function startHero() {
    if (!hero) return;
    hero.classList.add('is-ready');
    $$('[data-hero]', hero).forEach(el => el.classList.add('is-in'));
  }

  /* 应用语言：替换所有 data-i18n 文案、页脚年份、产品卡与灯箱 */
  function applyLang(next, opts) {
    const options = opts || {};
    lang = next;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* 忽略 */ }

    document.documentElement.lang = isEn() ? 'en' : 'zh-CN';
    document.documentElement.setAttribute('data-lang', lang);

    /* 静态文案 */
    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      let html = t(key, { year: YEAR });
      /* 页脚版权等含 {year} 的模板 */
      el.innerHTML = html;
    });
    $$('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    /* 统计数字单位（数字由计数器动画负责，这里只改单位文字） */
    const statLabels = ['phi.stat1', 'phi.stat2', 'phi.stat3', 'phi.stat4'];
    $$('.stats li span').forEach((el, i) => { if (statLabels[i]) el.innerHTML = t(statLabels[i]); });

    /* 滚动信息带：切换语言对应的一整套文案 */
    $$('.marquee').forEach(el => el.classList.toggle('is-en', isEn()));

    /* 产品卡全部重绘（名称 / 描述 / 规格随语言变化） */
    renderGrid();

    /* 灯箱若正打开，同步刷新 */
    if (options.refreshLightbox !== false && lb && lb.classList.contains('is-open') && lbProduct) {
      paintLightbox();
    }
  }

  /* 语言切换按钮 + 选择页 */
  const langBtn = $('#langBtn');
  function toggleLang() {
    applyLang(isEn() ? 'zh' : 'en');
    if (langBtn) langBtn.setAttribute('aria-label', isEn() ? '切换为中文' : 'Switch to Chinese');
  }
  if (langBtn) langBtn.addEventListener('click', toggleLang);

  let gateDone = false;
  /* 展示语言选择页（由加载动画结束后调用） */
  function showGate() {
    if (!gate || gateDone) return;
    gate.classList.add('is-active');
    const first = gate.querySelector('.gate__choice');
    if (first) first.focus();
  }
  /* 选完语言：收起选择页并播放首屏动画 */
  function closeGate() {
    if (gateDone) return;
    gateDone = true;
    if (gate) gate.classList.add('is-hidden');
    startHero();
    /* 选择页淡出后移除，避免残留遮挡 */
    setTimeout(() => { if (gate && gate.parentNode) gate.parentNode.removeChild(gate); }, 900);
  }

  (function initGate() {
    if (!gate) { applyLang(lang, { refreshLightbox: false }); return; }

    let saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { saved = null; }

    if (saved === 'zh' || saved === 'en') {
      /* 老访客：记住过选择，直接进站，不再打扰 */
      applyLang(saved, { refreshLightbox: false });
      closeGate();
    } else {
      /* 首次来访：以中文渲染站点（避免闪烁），等加载结束后弹出选择页 */
      applyLang(lang, { refreshLightbox: false });
      gate.addEventListener('click', (e) => {
        const btn = e.target.closest('.gate__choice');
        if (!btn) return;
        applyLang(btn.getAttribute('data-lang'), { refreshLightbox: false });
        closeGate();
      });
      pendingGate = true;
    }
  })();

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
  /* 注意：applyFilter 会在首屏渲染阶段（applyLang → renderGrid → applyFilter）
     就被调用，因此元素引用必须先于渲染逻辑准备好。 */
  const filters  = $$('.filter');
  const emptyMsg = $('#gridEmpty');

  function applyFilter(id) {
    currentFilter = id;
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
      const target = $('#products');
      if (target) window.scrollTo({ top: target.offsetTop - 84, behavior: reduceMotion ? 'auto' : 'smooth' });
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
    zh: { mirror: '镜光 MIRROR', brush: '拉丝 HAIRLINE', sanding: '砂光 SATIN', base: '配件 ACCESSORY' },
    en: { mirror: 'Mirror polished', brush: 'Hairline brushed', sanding: 'Satin sanding', base: 'Accessory' }
  };
  const finishLabel = f => (FINISH_LABEL[lang] || FINISH_LABEL.zh)[f] || '—';

  function preload(slug, i) {
    const im = new Image();
    im.src = viewImg(slug, i);
  }

  function paintLightbox() {
    if (!lbProduct) return;
    const p   = lbProduct;
    const cat = CATEGORY_BY_ID[p.category];

    lbImg.src = viewImg(p.slug, lbIndex);
    lbImg.alt = isEn() ? `${pName(p)} — studio photo ${lbIndex}`
                       : `${pName(p)} 实拍图 ${lbIndex}`;
    if (lbCapCat)  lbCapCat.textContent = cName(cat);
    if (lbCapName) lbCapName.textContent = t('lb.caption', { name: pName(p), i: pad2(lbIndex) });
    if (lbCounter) lbCounter.textContent = t('lb.counter', { i: pad2(lbIndex), n: pad2(p.count) });

    /* 规格随语言刷新 */
    if (lbSpecs) {
      const rows = [
        [t('lb.specFinish'), finishLabel(p.finish)],
        [t('lb.specShape'),  spec(p.shape)],
        [t('lb.specColor'),  spec(p.color)]
      ];
      if (p.size && p.size !== p.shape) rows.splice(2, 0, [t('lb.specSize'), spec(p.size)]);
      rows.push(
        [t('lb.specMat'),   t('lb.material')],
        [t('lb.specShots'), t('lb.shots', { n: p.count })],
        [t('lb.specCat'),   cName(cat) || '—']
      );
      lbSpecs.innerHTML = rows
        .map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
    }

    $$('button', lbThumbs).forEach((b) => {
      const i = Number(b.getAttribute('data-i'));
      b.classList.toggle('is-active', i === lbIndex);
      b.setAttribute('aria-label', isEn() ? `View photo ${i}` : `查看第 ${i} 张`);
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
    if (lbCategory) lbCategory.textContent = cat ? `${cat.index} · ${cName(cat)}` : '';
    if (lbName)     lbName.textContent = pName(p);
    if (lbEn)       lbEn.textContent = p.en;
    if (lbDesc)     lbDesc.textContent = pDesc(p);

    if (lbThumbs) {
      let html = '';
      for (let i = 1; i <= p.count; i++) {
        html += `<button type="button" data-i="${i}" aria-label="${isEn() ? 'View photo ' + i : '查看第 ' + i + ' 张'}">
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
