/* 中英文切换专项测试：模拟首次访问 → 选英文 → 校验全站英文 → 切回中文 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = path.resolve('.');
const PORT = Number(process.env.PORT || 5173);
const BASE = `http://127.0.0.1:${PORT}/`;

try {
  const res = await fetch(BASE + 'index.html');
  if (!res.ok) throw new Error('HTTP ' + res.status);
} catch (e) {
  console.error(`无法访问 ${BASE} —— 请先运行： node server.mjs`);
  process.exit(2);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const errors = [];

/** 启动一个页面实例；storedLang 为 localStorage 里预置的语言（null 表示首次访问） */
async function boot(storedLang, opts = {}) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdomError: ' + ((e.detail && e.detail.message) || e.message)));
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

  const dom = new JSDOM(html, {
    url: BASE, runScripts: 'dangerously', resources: 'usable',
    pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      w.IntersectionObserver = class {
        constructor(cb) { this.cb = cb; }
        observe(t) { this.cb([{ target: t, isIntersecting: true }], this); }
        unobserve() {} disconnect() {}
      };
      w.scrollTo = () => {};
      if (storedLang) w.localStorage.setItem('mlm-lang', storedLang);
    }
  });

  await new Promise(r => dom.window.addEventListener('load', r, { once: true }));
  await new Promise(r => dom.window.setTimeout(r, opts.wait != null ? opts.wait : 2600));
  return dom;
}

const wait = (dom, ms) => new Promise(r => dom.window.setTimeout(r, ms));
const assert = (cond, msg) => { if (!cond) errors.push('FAIL: ' + msg); else console.log('  ok  ' + msg); };

/* ---------------- 1. 首次访问：应弹出语言选择页 ---------------- */
console.log('\n— 首次访问（无历史选择）—');
let dom = await boot(null);
let doc = dom.window.document;

const gate = doc.querySelector('#gate');
assert(gate && !gate.classList.contains('is-hidden'), '语言选择页已展示');
assert(doc.querySelectorAll('.gate__choice').length === 2, '提供两个选项');
const labels = Array.from(doc.querySelectorAll('.gate__choice .gate__cn')).map(e => e.textContent.trim());
assert(labels[0] === '中文' && labels[1] === 'English', `选项文案为「中文 / English」（实际 ${labels.join(' / ')}）`);
assert(!doc.querySelector('#hero').classList.contains('is-ready'), '选语言前不播放首屏动画');

/* ---------------- 2. 选中文 ---------------- */
console.log('\n— 选择中文 —');
doc.querySelector('.gate__choice[data-lang="zh"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
await wait(dom, 300);

assert(doc.querySelector('#gate').classList.contains('is-hidden'), '选择后语言页收起');
assert(doc.querySelector('#hero').classList.contains('is-ready'), '首屏动画开始播放');
assert(doc.querySelector('.nav__links a').textContent.trim() === '理念', '导航为中文');
assert(doc.querySelector('.hero__title').textContent.includes('金属'), '首屏标题为中文');
const zhCards = doc.querySelectorAll('.card').length;
assert(zhCards === 21, `产品卡渲染 ${zhCards} 张`);
const firstZhName = doc.querySelector('.card__name').textContent.trim();
assert(firstZhName === '竖边金色镜光套装', `产品名为中文（${firstZhName}）`);
assert(doc.documentElement.lang === 'zh-CN', 'html lang = zh-CN');
assert(dom.window.localStorage.getItem('mlm-lang') === 'zh', '语言选择已写入 localStorage');
dom.window.close();

/* ---------------- 3. 首次访问选英文 ---------------- */
console.log('\n— 首次访问选 English —');
dom = await boot(null, { wait: 2600 });
doc = dom.window.document;
doc.querySelector('.gate__choice[data-lang="en"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
await wait(dom, 400);

assert(doc.documentElement.lang === 'en', 'html lang = en');
assert(doc.documentElement.getAttribute('data-lang') === 'en', 'data-lang = en');

const nav = Array.from(doc.querySelectorAll('.nav__links a')).map(a => a.textContent.trim());
assert(nav.join(',') === 'Philosophy,Products,Series,About,Contact', '导航全部为英文：' + nav.join(' / '));

const title = doc.querySelector('.hero__title').textContent.trim().replace(/\s+/g, ' ');
assert(/IN THE NAME/i.test(title) && /METAL/i.test(title), '首屏标题为英文：' + title);

const heroCta = doc.querySelector('.hero__actions .btn--gold span').textContent.trim();
assert(heroCta === 'Browse All Products', '首屏按钮为英文：' + heroCta);

// 关键：不能残留中文（品牌名「美联美」与英文 slogan 中的品牌标识为刻意保留）
const ALLOWED_CN = /^(美联美|MEILIANMEI)$/;
const ALLOWED_CN_CONTAINS = /SINCE\s*美联美/;   // 首屏英文标语里保留品牌中文标识
const cnLeft = [];
const walker = doc.createTreeWalker(doc.body, dom.window.NodeFilter.SHOW_TEXT);
let node;
while ((node = walker.nextNode())) {
  const parent = node.parentElement;
  if (parent && (parent.closest('.gate') || parent.closest('.lang-btn'))) continue;  // 语言页/切换按钮本身中英并列
  if (parent && parent.closest('.brand, .gate__brand, .footer__brand')) continue;    // 品牌字标刻意保留中文

  const txt = node.textContent.trim();
  if (!txt || ALLOWED_CN.test(txt) || ALLOWED_CN_CONTAINS.test(txt)) continue;
  /* 被 CSS 隐藏的元素（如信息带的另一语言副本）不算残留 */
  if (parent && dom.window.getComputedStyle(parent).display === 'none') continue;
  if (/[\u4e00-\u9fa5]/.test(txt)) cnLeft.push(txt.slice(0, 40));
}
assert(cnLeft.length === 0, `英文模式下无中文残留${cnLeft.length ? ' → ' + cnLeft.slice(0, 6).join(' | ') : ''}`);

// 滚动信息带应切换为英文
const marqueeBox = doc.querySelector('.marquee');
assert(marqueeBox.classList.contains('is-en'), '信息带容器切换到英文态');
const marqueeVisible = Array.from(doc.querySelectorAll('.marquee__track [data-lang-item="zh"]'))
  .filter(el => dom.window.getComputedStyle(el).display !== 'none').length;
const marqueeEn = Array.from(doc.querySelectorAll('.marquee__track [data-lang-item="en"]'))
  .filter(el => dom.window.getComputedStyle(el).display !== 'none').length;
assert(marqueeVisible === 0 && marqueeEn === 12, `信息带仅显示英文（中文 ${marqueeVisible} 条 / 英文 ${marqueeEn} 条）`);

const firstCard = doc.querySelector('.card__name').textContent.trim();
assert(firstCard === 'Vertical Edge · Mirror Gold Set', '产品名为英文：' + firstCard);
const firstDesc = doc.querySelector('.card__desc').textContent.trim();
assert(/^[A-Za-z]/.test(firstDesc), '产品描述为英文：' + firstDesc.slice(0, 50) + '…');

const filters = Array.from(doc.querySelectorAll('.filter')).map(b => b.textContent.replace(/\d+/g, '').trim());
assert(filters.join(' / ').includes('All') && filters.join(' / ').includes('Vertical Edge'), '筛选按钮为英文：' + filters.join(' / '));

const statLabels = Array.from(doc.querySelectorAll('.stats li span')).map(s => s.textContent.trim());
assert(statLabels.every(s => !/[\u4e00-\u9fa5]/.test(s)), '数据统计单位为英文：' + statLabels.join(' / '));

const contactKeys = Array.from(doc.querySelectorAll('.contact__info em')).map(s => s.textContent.trim());
assert(contactKeys.join(',') === 'Email,Phone,Address', '联系方式标签为英文：' + contactKeys.join(' / '));

/* 联系信息内容（中英双语都要正确） */
const addrEn = doc.querySelector('[data-i18n="contact.addr"]').textContent.trim();
assert(/Yongkang/i.test(addrEn) && /Zhejiang/i.test(addrEn) && !/[\u4e00-\u9fa5]/.test(addrEn),
  '英文版工厂地址已翻译：' + addrEn);
const telHref = doc.querySelector('.contact__info a[href^="tel:"]').getAttribute('href');
assert(telHref === 'tel:+8615925937208', '电话链接正确：' + telHref);

/* ---------------- 4. 英文模式下打开灯箱 ---------------- */
console.log('\n— 英文模式的灯箱 —');
doc.querySelectorAll('.card')[0].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
await wait(dom, 200);
const specs = Array.from(doc.querySelectorAll('#lbSpecs dt')).map(e => e.textContent.trim());
assert(specs.join(',') === 'Finish,Shape,Size,Colour,Material,Studio shots,Series', '灯箱规格标签为英文：' + specs.join(' / '));
const specVals = Array.from(doc.querySelectorAll('#lbSpecs dd')).map(e => e.textContent.trim());
assert(specVals.every(v => !/[\u4e00-\u9fa5]/.test(v)), '灯箱规格值为英文：' + specVals.join(' / '));
assert(/studio shots/i.test(doc.querySelector('#lbCounter').textContent), '灯箱计数器为英文：' + doc.querySelector('#lbCounter').textContent);

/* ---------------- 5. 页面内切换回中文 ---------------- */
console.log('\n— 点击右上角切回中文 —');
doc.querySelector('#langBtn').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
await wait(dom, 300);
assert(doc.documentElement.lang === 'zh-CN', 'html lang 切回 zh-CN');
assert(doc.querySelector('.nav__links a').textContent.trim() === '理念', '导航切回中文');
assert(doc.querySelector('.card__name').textContent.trim() === '竖边金色镜光套装', '产品名切回中文');
const specsZh = Array.from(doc.querySelectorAll('#lbSpecs dt')).map(e => e.textContent.trim());
assert(specsZh[0] === '表面工艺', '灯箱规格切回中文：' + specsZh.join(' / '));
assert(doc.querySelectorAll('.card').length === 21, '切换语言后产品卡仍为 21 张');
const addrZh = doc.querySelector('[data-i18n="contact.addr"]').textContent.trim();
assert(addrZh === '浙江省金华市永康市芝英镇郭山村郭山畈6号', '中文版工厂地址正确：' + addrZh);
dom.window.close();

/* ---------------- 6. 老访客（已选英文）直接进站 ---------------- */
console.log('\n— 老访客（已选英文）直接进站 —');
dom = await boot('en');
doc = dom.window.document;
assert(doc.querySelector('#hero').classList.contains('is-ready'), '不弹语言页，直接播放首屏动画');
assert(doc.querySelector('.card__name').textContent.trim() === 'Vertical Edge · Mirror Gold Set', '直接以英文渲染');
const g2 = doc.querySelector('#gate');
assert(!g2 || g2.classList.contains('is-hidden'), '语言选择页未干扰');
dom.window.close();

console.log('\n=========================================');
if (errors.length) {
  console.log('发现 ' + errors.length + ' 个问题：');
  errors.forEach(e => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('中英文切换全部检查通过 ✓');
