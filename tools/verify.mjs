/* 静态校验：检查 HTML / JS / CSS 中引用的本地资源是否都存在 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const problems = [];
const checked = new Set();

function exists(rel) {
  if (checked.has(rel)) return true;
  checked.add(rel);
  const p = path.join(root, decodeURIComponent(rel));
  if (fs.existsSync(p)) return true;
  problems.push('MISSING: ' + rel);
  return false;
}

function checkHtml(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');

  // src / href 本地引用
  const re = /(?:src|href)\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const v = m[1];
    if (/^(https?:|data:|mailto:|tel:|#)/.test(v)) continue;
    exists(v.split('?')[0]);
  }
  // srcset
  const re2 = /srcset\s*=\s*"([^"]+)"/g;
  while ((m = re2.exec(html))) {
    m[1].split(',').forEach(part => {
      const u = part.trim().split(/\s+/)[0];
      if (u && !/^(https?:|data:)/.test(u)) exists(u);
    });
  }
  // id 重复检查
  const ids = [...html.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map(x => x[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) problems.push('DUPLICATE ID in ' + file + ': ' + [...new Set(dup)].join(', '));
}

function checkCss(file) {
  const css = fs.readFileSync(path.join(root, file), 'utf8');
  const re = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
  let m;
  while ((m = re.exec(css))) {
    const v = m[1].trim();
    if (/^(https?:|data:|#|%23)/.test(v)) continue;
    exists(path.posix.join(path.posix.dirname(file.replace(/\\/g, '/')), v));
  }
  // 大括号平衡
  const open = (css.match(/{/g) || []).length;
  const close = (css.match(/}/g) || []).length;
  if (open !== close) problems.push(`CSS brace mismatch in ${file}: ${open} { vs ${close} }`);
}

/* 校验 JS 动态拼接的全部图片路径（card / view / hero 三套变体） */
function checkGeneratedImages() {
  const src = fs.readFileSync(path.join(root, 'assets/js/data.js'), 'utf8');
  const products = [...src.matchAll(/slug:\s*'([^']+)'[\s\S]*?count:\s*(\d+)/g)]
    .map(x => ({ slug: x[1], count: Number(x[2]) }));

  if (products.length === 0) problems.push('未能从 data.js 解析出产品列表');

  let n = 0;
  for (const p of products) {
    if (p.count < 1 || p.count > 20) problems.push(`count 异常: ${p.slug} = ${p.count}`);
    for (let i = 1; i <= p.count; i++) {
      const num = String(i).padStart(2, '0');
      ['card', 'view', 'hero'].forEach(dir => {
        exists(`assets/img/${dir}/${p.slug}-${num}.jpg`);
        n++;
      });
    }
    // 超出 count 的图片不应存在（否则说明数据与素材不同步）
    const extra = String(p.count + 1).padStart(2, '0');
    const extraPath = path.join(root, `assets/img/card/${p.slug}-${extra}.jpg`);
    if (fs.existsSync(extraPath)) {
      problems.push(`count 偏小: ${p.slug} 还有第 ${p.count + 1} 张素材`);
    }
  }
  console.log(`产品数：${products.length}，图片引用：${n}`);
}

function checkCoverRefs() {
  const data = fs.readFileSync(path.join(root, 'assets/js/data.js'), 'utf8');
  [...data.matchAll(/cover:\s*'([^']+)'/g)].forEach(m => exists(m[1]));
}

function checkJsSyntax(file) {
  const js = fs.readFileSync(path.join(root, file), 'utf8');
  try {
    new (Function.prototype.bind.call(Function, null, js))(); // 仅解析，不执行
  } catch (e) {
    problems.push(`JS SYNTAX ERROR in ${file}: ${e.message}`);
  }
}

const htmlFiles = ['index.html'];
htmlFiles.forEach(checkHtml);
['assets/css/style.css'].forEach(checkCss);
['assets/js/data.js', 'assets/js/main.js'].forEach(checkJsSyntax);
checkGeneratedImages();
checkCoverRefs();

console.log('检查资源引用数：', checked.size);
if (problems.length) {
  console.log('\n发现 ' + problems.length + ' 个问题：');
  problems.slice(0, 60).forEach(p => console.log('  - ' + p));
  process.exit(1);
} else {
  console.log('OK：所有引用均存在，CSS/JS 无语法问题。');
}
