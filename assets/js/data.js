/* =========================================================
   产品数据 · Product Data
   素材来源：产品素材/<产品文件夹>，图片由 tools/build-assets.ps1 生成到
   assets/img/card (4:3 卡片图)、assets/img/view (1:1 灯箱大图)、
   assets/img/hero (4:5 竖版大图)

   所有数据挂载到 window.MLM，保证在任意脚本加载方式下都可用。
   ========================================================= */
(function (global) {
  'use strict';

  const BRAND = {
    name: '美联美',
    nameEn: 'MEILIANMEI',
    slogan: 'MASTER THE ART OF METAL',
    tagline: '专注不锈钢家居器物制造',
    desc:
      '美联美深耕不锈钢家居器物制造，以镜光、拉丝、砂光与激光工艺为核心，' +
      '将金属的冷冽与温润握感融合于一体。每一件器物都经过精工打磨与多道质检，' +
      '为酒店、餐饮与居家场景提供兼具质感与耐用的桌面美学方案。',
    stats: [
      { value: '21', label: '款在售产品' },
      { value: '4', label: '核心工艺' },
      { value: '304', label: '食品级不锈钢' },
      { value: '82', label: '张实拍素材' }
    ]
  };

  /* 工艺（surface finish）说明 */
  const FINISHES = {
    mirror:  { name: '镜光', en: 'MIRROR POLISHED',  desc: '多道研磨抛光，表面如镜面般清晰映照，光线在曲面间流转，光感饱满而通透。' },
    brush:   { name: '拉丝', en: 'HAIRLINE BRUSHED', desc: '细腻的定向发丝纹，触感温润不沾指纹，哑光质感中透出金属本色。' },
    sanding: { name: '砂光', en: 'SATIN SANDING',    desc: '均匀细致的砂面处理，光泽内敛柔和，低调之中见细节。' },
    base:    { name: '底座', en: 'SERIES BASE',      desc: '加厚底座设计，重心稳固，可与对应尺寸套装自由组合搭配。' }
  };

  /* 产品分类（对应 产品素材 一级目录） */
  const CATEGORIES = [
    {
      id: 'shubian', index: '01',
      name: '竖边系列', en: 'VERTICAL EDGE SERIES',
      desc: '直筒竖边立面，线条利落挺拔。镜光与拉丝两种表面处理，圆形套装成套出品。',
      cover: 'assets/img/view/shubian-mirror-gold-01.jpg'
    },
    {
      id: 'shaguang-brush', index: '02',
      name: '砂光拉丝系列', en: 'SATIN & HAIRLINE SERIES',
      desc: '以砂光为底、拉丝为面的复合工艺，圆、方、三角、八边多形状可选。',
      cover: 'assets/img/view/shaguang-brush-square-gold-02.jpg'
    },
    {
      id: 'shaguang-laser', index: '03',
      name: '砂光激光系列', en: 'SATIN & LASER SERIES',
      desc: '砂光表面叠加激光雕刻纹理，在哑光底面上呈现细腻的几何光纹。',
      cover: 'assets/img/view/shaguang-laser-round10-01.jpg'
    },
    {
      id: 'zuoshi', index: '04',
      name: '座式砂光系列', en: 'PEDESTAL SERIES',
      desc: '带座式结构设计，壶身与底座一体成型，沉稳大气，适合作为桌面主角。',
      cover: 'assets/img/view/zuoshi-sanding-02.jpg'
    }
  ];

  /* 产品列表（count 必须与 assets/img 中实际张数一致） */
  const PRODUCTS = [
    /* ---------- 01 竖边系列 ---------- */
    {
      slug: 'shubian-mirror-gold',
      name: '竖边金色镜光套装', en: 'VERTICAL EDGE · MIRROR GOLD',
      category: 'shubian', finish: 'mirror',
      shape: '圆形', size: '圆形套装', color: '金色', tag: '旗舰', count: 6,
      desc: '直筒竖边配以金色镜光表面，光影在筒身与盖面之间形成连续的反射带，成品色泽饱满、层次分明。'
    },
    {
      slug: 'shubian-mirror-silver',
      name: '竖边镜光套装', en: 'VERTICAL EDGE · MIRROR SILVER',
      category: 'shubian', finish: 'mirror',
      shape: '圆形', size: '圆形套装', color: '银色', tag: '经典', count: 6,
      desc: '冷静的银白镜面，几何线条干净利落。竖边立面让整套器物的轮廓更显挺拔，适配多种桌面场景。'
    },
    {
      slug: 'shubian-brush-gold',
      name: '竖边拉丝金色圆形套装', en: 'VERTICAL EDGE · HAIRLINE GOLD',
      category: 'shubian', finish: 'brush',
      shape: '圆形', size: '圆形套装', color: '金色', tag: '新品', count: 6,
      desc: '金色发丝纹与竖边结构结合，金属哑光质感中透出温润暖调，日用不易留下指纹。'
    },
    {
      slug: 'shubian-brush-silver',
      name: '竖边拉丝银色圆形套装', en: 'VERTICAL EDGE · HAIRLINE SILVER',
      category: 'shubian', finish: 'brush',
      shape: '圆形', size: '圆形套装', color: '银色', tag: '', count: 6,
      desc: '银白拉丝细纹均匀通透，搭配竖边直筒造型，呈现克制而高级的工业美学。'
    },
    {
      slug: 'shubian-base',
      name: '竖边套装底座', en: 'VERTICAL EDGE · BASE',
      category: 'shubian', finish: 'base',
      shape: '圆形', size: '底座配件', color: '银色', tag: '配件', count: 4,
      desc: '加厚圆形底座，边缘同样采用竖边工艺。用于承托套装主体，提升整体重心稳定性。'
    },

    /* ---------- 02 砂光拉丝系列 ---------- */
    {
      slug: 'shaguang-brush-round10',
      name: '砂光拉丝圆 10', en: 'SATIN HAIRLINE · ROUND 10',
      category: 'shaguang-brush', finish: 'brush',
      shape: '圆形', size: '10 cm', color: '银色', tag: '', count: 3,
      desc: '10 cm 圆形砂光拉丝底托，大面积细纹分布均匀，可作为杯垫、盘托或隔热垫使用。'
    },
    {
      slug: 'shaguang-brush-round8',
      name: '砂光拉丝圆 8', en: 'SATIN HAIRLINE · ROUND 8',
      category: 'shaguang-brush', finish: 'brush',
      shape: '圆形', size: '8 cm', color: '银色', tag: '', count: 3,
      desc: '8 cm 圆形规格，尺寸更精巧，适合小口径器皿与杯具搭配使用。'
    },
    {
      slug: 'shaguang-brush-square',
      name: '砂光拉丝正方形', en: 'SATIN HAIRLINE · SQUARE',
      category: 'shaguang-brush', finish: 'brush',
      shape: '正方形', size: '方形', color: '银色', tag: '', count: 3,
      desc: '直角方形设计，边角经过倒角打磨，线条硬朗而不割手，适合规整的桌面陈列。'
    },
    {
      slug: 'shaguang-brush-triangle',
      name: '砂光拉丝三角形', en: 'SATIN HAIRLINE · TRIANGLE',
      category: 'shaguang-brush', finish: 'brush',
      shape: '三角形', size: '三角', color: '银色', tag: '', count: 3,
      desc: '三角形轮廓打破常规，可组合拼接成几何阵列，为桌面带来更强的设计感。'
    },
    {
      slug: 'shaguang-brush-octagon',
      name: '砂光拉丝八边形', en: 'SATIN HAIRLINE · OCTAGON',
      category: 'shaguang-brush', finish: 'brush',
      shape: '八边形', size: '八边', color: '银色', tag: '', count: 3,
      desc: '八边切角在圆与方之间取得平衡，握持与摆放都更为稳定。'
    },
    {
      slug: 'shaguang-brush-concave',
      name: '砂光拉丝内凹圆', en: 'SATIN HAIRLINE · CONCAVE',
      category: 'shaguang-brush', finish: 'brush',
      shape: '内凹圆', size: '内凹', color: '银色', tag: '', count: 3,
      desc: '中心内凹的碟形结构，可自然汇集水汽，兼顾隔热与防溢功能。'
    },
    {
      slug: 'shaguang-brush-set10',
      name: '圆形砂光套装 10cm', en: 'SATIN HAIRLINE · ROUND SET 10',
      category: 'shaguang-brush', finish: 'brush',
      shape: '圆形', size: '10 cm 套装', color: '银色', tag: '成套', count: 6,
      desc: '以 10 cm 圆形砂光件组成的成套出品，尺寸统一，适合批量配置与整体方案搭配。'
    },
    {
      slug: 'shaguang-brush-square-gold',
      name: '方形金色拉丝套装', en: 'SATIN HAIRLINE · SQUARE GOLD',
      category: 'shaguang-brush', finish: 'brush',
      shape: '正方形', size: '方形套装', color: '金色', tag: '推荐', count: 6,
      desc: '方形基底配合金色拉丝表面，哑光暖金与直角轮廓相互衬托，成套呈现更具整体感。'
    },
    {
      slug: 'shaguang-brush-square-silver',
      name: '银色方形套装', en: 'SATIN HAIRLINE · SQUARE SILVER',
      category: 'shaguang-brush', finish: 'brush',
      shape: '正方形', size: '方形套装', color: '银色', tag: '', count: 5,
      desc: '银色方形成套出品，表面砂光细腻一致，规格统一便于成组使用。'
    },

    /* ---------- 03 砂光激光系列 ---------- */
    {
      slug: 'shaguang-laser-round10',
      name: '砂光激光圆 10', en: 'SATIN LASER · ROUND 10',
      category: 'shaguang-laser', finish: 'sanding',
      shape: '圆形', size: '10 cm', color: '银色', tag: '', count: 2,
      desc: '在砂光底面上以激光雕刻细密纹路，光线下形成若隐若现的图案层次。'
    },
    {
      slug: 'shaguang-laser-round8',
      name: '砂光激光圆 8', en: 'SATIN LASER · ROUND 8',
      category: 'shaguang-laser', finish: 'sanding',
      shape: '圆形', size: '8 cm', color: '银色', tag: '', count: 2,
      desc: '8 cm 规格的激光纹圆件，纹路精细，适合细节陈列与小件器皿。'
    },
    {
      slug: 'shaguang-laser-square',
      name: '砂光激光正方形', en: 'SATIN LASER · SQUARE',
      category: 'shaguang-laser', finish: 'sanding',
      shape: '正方形', size: '方形', color: '银色', tag: '', count: 2,
      desc: '方形激光纹样规整对称，边线清晰，适合对位拼接摆放。'
    },
    {
      slug: 'shaguang-laser-triangle',
      name: '砂光激光三角', en: 'SATIN LASER · TRIANGLE',
      category: 'shaguang-laser', finish: 'sanding',
      shape: '三角形', size: '三角', color: '银色', tag: '', count: 2,
      desc: '三角形结构与激光纹理结合，锐利的几何感在哑光表面上更具张力。'
    },
    {
      slug: 'shaguang-laser-octagon',
      name: '砂光激光八边', en: 'SATIN LASER · OCTAGON',
      category: 'shaguang-laser', finish: 'sanding',
      shape: '八边形', size: '八边', color: '银色', tag: '', count: 2,
      desc: '八边轮廓配合激光细节，多角度观察均有不同的反光表现。'
    },
    {
      slug: 'shaguang-laser-concave',
      name: '砂光激光内凹', en: 'SATIN LASER · CONCAVE',
      category: 'shaguang-laser', finish: 'sanding',
      shape: '内凹圆', size: '内凹', color: '银色', tag: '', count: 2,
      desc: '内凹碟形搭配激光纹面，凹面在聚光时形成柔和的明暗过渡。'
    },

    /* ---------- 04 座式砂光系列 ---------- */
    {
      slug: 'zuoshi-sanding',
      name: '座式砂光系列', en: 'PEDESTAL · SATIN SANDING',
      category: 'zuoshi', finish: 'sanding',
      shape: '座式', size: '座式', color: '银色', tag: '主推', count: 7,
      desc: '壶身与底座一体成型的座式结构，重心下沉、姿态稳重。整体砂光处理，光泽柔和内敛，是桌面场景中的视觉主体。'
    }
  ];

  /* 便捷索引 */
  const CATEGORY_BY_ID = CATEGORIES.reduce((m, c) => (m[c.id] = c, m), {});
  const PRODUCT_BY_SLUG = PRODUCTS.reduce((m, p) => (m[p.slug] = p, m), {});

  /* 图片路径生成 */
  const cardImg = (slug, i) => `assets/img/card/${slug}-${String(i).padStart(2, '0')}.jpg`;
  const viewImg = (slug, i) => `assets/img/view/${slug}-${String(i).padStart(2, '0')}.jpg`;
  const heroImg = (slug, i) => `assets/img/hero/${slug}-${String(i).padStart(2, '0')}.jpg`;

  /* 分类计数 */
  const COUNT_BY_CATEGORY = PRODUCTS.reduce((m, p) => {
    m[p.category] = (m[p.category] || 0) + 1;
    return m;
  }, {});

  global.MLM = {
    BRAND, FINISHES, CATEGORIES, PRODUCTS,
    CATEGORY_BY_ID, PRODUCT_BY_SLUG, COUNT_BY_CATEGORY,
    cardImg, viewImg, heroImg
  };
})(typeof window !== 'undefined' ? window : globalThis);
