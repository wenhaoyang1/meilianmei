/* 运行时校验：用 jsdom 加载 index.html，执行脚本并模拟交互，捕获异常与结构问题
   用法：
     1) 先启动 node server.mjs（默认 5173 端口）
     2) node tools/test-dom.mjs .
   如需改用其它端口：$env:PORT=5173 或直接设置下面的 PORT 常量 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = path.resolve(process.argv[2] || '.');
const PORT = Number(process.env.PORT || 5173);
const BASE = `http://127.0.0.1:${PORT}/`;

// 预检：页面必须能通过 http 访问，否则后续断言会因脚本未加载而失真
try {
  const res = await fetch(BASE + 'index.html');
  if (!res.ok) throw new Error('HTTP ' + res.status);
} catch (e) {
  console.error(`无法访问 ${BASE} —— 请先运行： node server.mjs`);
  console.error('原因：' + e.message);
  process.exit(2);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.detail || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(html, {
  url: BASE,
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    // jsdom 未实现 matchMedia / IntersectionObserver：提供最小实现
    if (!window.matchMedia) {
      window.matchMedia = (q) => ({
        matches: false, media: q, onchange: null,
        addListener() {}, removeListener() {},
        addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; }
      });
    }
    // jsdom 未实现 scrollTo：静默处理，避免污染错误收集
    window.scrollTo = function () {};
    // 预置语言选择，跳过「进入网站先选语言」的选择页，专注主站逻辑
    window.localStorage.setItem('mlm-lang', 'zh');
    const observers = [];
    window.IntersectionObserver = class {
      constructor(cb, opts) { this.cb = cb; this.opts = opts; this.targets = []; observers.push(this); }
      observe(t) { this.targets.push(t); }
      unobserve(t) { this.targets = this.targets.filter(x => x !== t); }
      disconnect() { this.targets = []; }
      triggerAll() {
        this.targets.slice().forEach((t) => this.cb([{ target: t, isIntersecting: true }], this));
      }
    };
    window.__observers = observers;
    window.__fired = {};
    // 记录被请求的图片地址
    window.__imgRequests = [];
    const origImage = window.Image;
    window.Image = function () {
      const im = new origImage();
      Object.defineProperty(im, 'src', {
        set(v) { window.__imgRequests.push(v); },
        get() { return ''; }
      });
      return im;
    };
  }
});

const { window } = dom;
const doc = window.document;
const $$ = (s) => Array.from(doc.querySelectorAll(s));

function wait(ms) { return new Promise(r => window.setTimeout(r, ms)); }
function assert(cond, msg) { if (!cond) errors.push('FAIL: ' + msg); else console.log('  ok  ' + msg); }

await new Promise((resolve) => {
  if (doc.readyState === 'complete') resolve();
  else window.addEventListener('load', resolve, { once: true });
  window.setTimeout(resolve, 4000);
});
// 等待加载遮罩的收尾动画（load 后 700ms 触发 + 520ms 淡出 + 1600ms 移除）
await wait(2600);

console.log('\n— 结构 —');
if (errors.length) {
  console.log('  [早期错误]');
  errors.forEach(e => console.log('    · ' + e));
}
const cards = $$('.card');
const productCount = Number((fs.readFileSync(path.join(root, 'assets/js/data.js'), 'utf8').match(/slug:/g) || []).length);
assert(cards.length === productCount, `产品卡渲染数量 = ${cards.length}（数据 ${productCount}）`);
assert($$('.card__img').length === cards.length, '每张卡片都有图片');
assert(cards.every(c => c.querySelector('.card__name')), '每张卡片都有名称');
assert($$('.filter').length === 5, '筛选按钮 5 个');
assert(!doc.querySelector('#loader'), '加载遮罩已移除');
assert(doc.querySelector('#hero').classList.contains('is-ready'), '首屏已触发入场动画');
assert($$('#langBtn').length === 1, '导航语言切换按钮存在');
assert(doc.querySelector('#footerCopy'), '页脚版权区存在');

console.log('\n— 图片路径 —');
const missing = [];
const seen = new Set();
$$('img').forEach((im) => {
  const src = im.getAttribute('src');
  if (!src || seen.has(src)) return;
  seen.add(src);
  if (!fs.existsSync(path.join(root, decodeURIComponent(src)))) missing.push(src);
});
assert(missing.length === 0, `HTML 中 img 路径全部存在（检查 ${seen.size} 个）${missing.length ? ' 缺失: ' + missing.join(', ') : ''}`);

console.log('\n— 交互：筛选 —');
const laserBtn = $$('.filter').find(b => b.dataset.filter === 'shaguang-laser');
laserBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await wait(80);
const visible = cards.filter(c => !c.classList.contains('is-filtered'));
assert(visible.length === 6, `砂光激光筛选后可见 ${visible.length} 款（应为 6）`);
assert(visible.every(c => c.dataset.category === 'shaguang-laser'), '筛选结果分类正确');

const allBtn = $$('.filter').find(b => b.dataset.filter === 'all');
allBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await wait(80);
assert(cards.filter(c => !c.classList.contains('is-filtered')).length === productCount, '恢复「全部」显示所有产品');

console.log('\n— 交互：灯箱 —');
cards[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await wait(80);
const lb = doc.querySelector('#lightbox');
assert(lb.classList.contains('is-open'), '点击产品卡打开灯箱');
assert(doc.body.classList.contains('is-locked'), '打开灯箱时锁定页面滚动');
assert(doc.querySelector('#lbName').textContent.length > 0, '灯箱显示产品名称');
assert(doc.querySelector('#lbSpecs').children.length === 7, `灯箱规格项 ${doc.querySelector('#lbSpecs').children.length} 条（应为 7）`);
assert($$('#lbThumbs button').length === 6, `灯箱缩略图 ${$$('#lbThumbs button').length} 张（竖边金色镜光共 6 张）`);
assert(doc.querySelector('#lbImg').getAttribute('src').includes('/view/'), '灯箱主图为 1:1 大图');

const before = doc.querySelector('#lbCounter').textContent;
doc.querySelector('#lbNext').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await wait(60);
assert(doc.querySelector('#lbCounter').textContent !== before, '下一张翻页生效：' + doc.querySelector('#lbCounter').textContent);
assert(doc.querySelector('#lbThumbs button[data-i="2"]').classList.contains('is-active'), '缩略图高亮同步');

doc.querySelector('#lbPrev').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await wait(60);
assert(doc.querySelector('#lbThumbs button[data-i="1"]').classList.contains('is-active'), '上一张回到第 1 张');

doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await wait(60);
assert(!lb.classList.contains('is-open'), '按 Esc 关闭灯箱');
assert(!doc.body.classList.contains('is-locked'), '关闭后恢复页面滚动');

console.log('\n— 交互：移动端菜单 —');
doc.querySelector('#burger').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await wait(60);
assert(doc.querySelector('#drawer').classList.contains('is-open'), '汉堡按钮打开移动菜单');
doc.querySelector('.drawer__links a').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await wait(60);
assert(!doc.querySelector('#drawer').classList.contains('is-open'), '点击菜单项后关闭');

console.log('\n— 滚动揭示 —');
window.__observers.forEach(o => o.triggerAll && o.triggerAll());
await wait(60);
const revealed = $$('.reveal').filter(el => el.classList.contains('is-in')).length;
assert(revealed === $$('.reveal').length, `所有 .reveal 元素已触发（${revealed}/${$$('.reveal').length}）`);
const counted = $$('[data-count]').filter(el => /\d/.test(el.textContent)).length;
assert(counted === $$('[data-count]').length, `数字滚动已执行（${counted}/${$$('[data-count]').length}）`);

console.log('\n=========================================');
if (errors.length) {
  console.log('发现 ' + errors.length + ' 个问题：');
  errors.forEach(e => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('全部运行时检查通过 ✓');
dom.window.close();
