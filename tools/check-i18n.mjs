/* 校验 index.html 里所有 data-i18n / data-i18n-aria 键都在 translations.js 中有定义，
   并且中英文键集合完全一致（避免出现只翻了一半） */
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

/* 收集 HTML 用到的键 */
const used = new Set();
for (const m of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) used.add(m[1]);

/* 从 translations.js 里取出键集合（按对象区块解析） */
const src = fs.readFileSync('assets/js/translations.js', 'utf8');
const zhStart = src.indexOf('const ZH = {');
const enStart = src.indexOf('const EN = {');
const zhBlock = src.slice(zhStart, enStart);
const enBlock = src.slice(enStart);
const pick = (block) => {
  const s = new Set();
  for (const m of block.matchAll(/^\s*'([^']+)':/gm)) s.add(m[1]);
  return s;
};
const zhKeys = pick(zhBlock);
const enKeys = pick(enBlock);

const problems = [];

const missingZh = [...used].filter(k => !zhKeys.has(k));
const missingEn = [...used].filter(k => !enKeys.has(k));
if (missingZh.length) problems.push('中文缺失键: ' + missingZh.join(', '));
if (missingEn.length) problems.push('英文缺失键: ' + missingEn.join(', '));

const onlyZh = [...zhKeys].filter(k => !enKeys.has(k));
const onlyEn = [...enKeys].filter(k => !zhKeys.has(k));
if (onlyZh.length) problems.push('仅中文有: ' + onlyZh.join(', '));
if (onlyEn.length) problems.push('仅英文有: ' + onlyEn.join(', '));

/* 产品数据字段完整性 */
const data = fs.readFileSync('assets/js/data.js', 'utf8');
const slugs = [...data.matchAll(/slug: '([^']+)'/g)].map(m => m[1]);
const nameEnCount = (data.match(/nameEn:/g) || []).length;
const descEnCount = (data.match(/descEn:/g) || []).length;
const tagCount = (data.match(/tag: '[^']+'/g) || []).length;
const tagEnCount = (data.match(/tagEn:/g) || []).length;

console.log(`HTML 使用的翻译键      : ${used.size}`);
console.log(`词典中文键             : ${zhKeys.size}`);
console.log(`词典英文键             : ${enKeys.size}`);
console.log(`产品数                 : ${slugs.length}`);
console.log(`nameEn / descEn        : ${nameEnCount} / ${descEnCount}`);
console.log(`产品角标 tag / tagEn   : ${tagCount} / ${tagEnCount}`);

if (nameEnCount < slugs.length) problems.push(`有 ${slugs.length - nameEnCount} 个产品缺 nameEn`);
if (descEnCount < slugs.length) problems.push(`有 ${slugs.length - descEnCount} 个产品缺 descEn`);
if (tagEnCount !== tagCount) problems.push(`tagEn 数量(${tagEnCount}) 与 tag 数量(${tagCount}) 不一致`);

/* 分类英文 */
const catEnCount = (data.match(/nameEn: '/g) || []).length;   // 分类 4 + 品牌 1
if (catEnCount < 5) problems.push('分类/品牌名称英文缺失');

console.log('');
if (problems.length) {
  console.log('发现 ' + problems.length + ' 个问题：');
  problems.forEach(p => console.log('  ✗ ' + p));
  process.exit(1);
}
console.log('翻译完整性检查通过 ✓');
