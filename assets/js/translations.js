/* =========================================================
   中英文文案对照表 · i18n dictionary
   用法：index.html 里给元素加 data-i18n="键名"，main.js 按语言替换。
   产品数据（名称/描述）另见 PRODUCTS 里的 en / descEn 字段。
   ========================================================= */
(function (global) {
  'use strict';

  const ZH = {
    /* ---------- 语言选择页 ---------- */
    'gate.question':   '请选择语言',
    'gate.sub':        'Choose your language · 请选择您的语言',

    /* ---------- 导航 ---------- */
    'nav.philosophy':  '理念',
    'nav.products':    '产品',
    'nav.series':      '系列',
    'nav.about':       '关于',
    'nav.contact':     '联系',
    'nav.cta':         '获取图册',
    'nav.langBtn':     'EN',

    /* ---------- 首屏 ---------- */
    'hero.title1':     '以金属之名',
    'hero.title2':     '<em>塑</em>桌面美学',
    'hero.desc':       '镜光、拉丝、砂光、激光——四道核心工艺，<br>把冷冽的不锈钢打磨成有温度的器物。',
    'hero.cta1':       '浏览全部产品',
    'hero.cta2':       '了解工艺',
    'hero.chipA':      '食品级不锈钢',
    'hero.chipB':      '款在售产品',
    'hero.scroll':     'SCROLL',

    /* ---------- 理念 ---------- */
    'phi.title':       '器物无声，<br>质感自有分寸。',
    'phi.lede':
      '美联美深耕不锈钢家居器物制造，从选材、成型到表面处理全部自主把控。' +
      '我们相信好的器物不需要喧哗——它在光线下的反射、在手中的重量、' +
      '在长期使用后的稳定表现，才是品质真正的表达。',
    'phi.stat1':       '款在售产品',
    'phi.stat2':       '核心表面工艺',
    'phi.stat3':       '食品级不锈钢',
    'phi.stat4':       '张实物拍摄素材',
    'phi.f1t':         '镜光',
    'phi.f1e':         'MIRROR POLISHED',
    'phi.f1d':         '多道研磨抛光，表面如镜面般清晰映照，光线在曲面间流转，光感饱满而通透。',
    'phi.f2t':         '拉丝',
    'phi.f2e':         'HAIRLINE BRUSHED',
    'phi.f2d':         '细腻的定向发丝纹，触感温润不沾指纹，哑光质感中透出金属本色。',
    'phi.f3t':         '砂光',
    'phi.f3e':         'SATIN SANDING',
    'phi.f3d':         '均匀细致的砂面处理，光泽内敛柔和，低调之中见细节。',
    'phi.f4t':         '激光',
    'phi.f4e':         'LASER ENGRAVED',
    'phi.f4d':         '在哑光底面上以激光雕刻几何纹理，角度变换时呈现若隐若现的光纹层次。',

    /* ---------- 产品 ---------- */
    'prod.title':      '全部产品',
    'prod.desc':       '共 21 款在售产品，按竖边、砂光拉丝、砂光激光与座式砂光四大系列划分。点击任意产品查看多角度实拍。',
    'prod.filterAll':  '全部',
    'prod.f1':         '竖边系列',
    'prod.f2':         '砂光拉丝',
    'prod.f3':         '砂光激光',
    'prod.f4':         '座式砂光',
    'prod.empty':      '该分类下暂无产品。',
    'prod.views':      'VIEWS',
    'prod.viewDetail': 'VIEW DETAIL',

    /* ---------- 系列 ---------- */
    'series.title':    '四大系列',
    'series.desc':     '不同表面工艺对应不同的使用场景与视觉气质，可按整体方案自由搭配。',
    'series.s1t':      '竖边系列',
    'series.s1d':      '直筒竖边立面，线条利落挺拔。镜光与拉丝两种表面处理，圆形套装成套出品，涵盖金色与银色两大色系，并提供配套底座。',
    'series.s1m1':     '镜光 / 拉丝',
    'series.s1m2':     '金色 / 银色',
    'series.s1m3':     '5 款',
    'series.s2t':      '砂光拉丝系列',
    'series.s2d':      '以砂光为底、拉丝为面的复合工艺，提供圆 8、圆 10、正方形、三角形、八边形与内凹圆等多种形状选择，并可成套配置。',
    'series.s2m1':     '9 种款式',
    'series.s2m2':     '多形状',
    'series.s2m3':     '可成套',
    'series.s3t':      '砂光激光系列',
    'series.s3d':      '砂光表面叠加激光雕刻纹理，在哑光底面上呈现细腻的几何光纹，随观察角度变化而产生不同的明暗与反光。',
    'series.s3m1':     '6 种形状',
    'series.s3m2':     '激光纹理',
    'series.s3m3':     '哑光质感',
    'series.s4t':      '座式砂光系列',
    'series.s4d':      '壶身与底座一体成型的座式结构，重心下沉、姿态稳重。整体砂光处理，光泽柔和内敛，是桌面场景中的视觉主体。',
    'series.s4m1':     '一体成型',
    'series.s4m2':     '重心稳固',
    'series.s4m3':     '整体砂光',
    'series.jump':     '查看该系列',

    /* ---------- 横幅 ---------- */
    'banner.title':    '工艺，藏在细节里',
    'banner.desc':     '每件器物都要经过成型、焊接、打磨、抛光与多道质检。<br>我们坚持把工序做足，因为手感和光泽无法取巧。',

    /* ---------- 关于 ---------- */
    'about.title':     '关于美联美',
    'about.p1':        '美联美是一家专注不锈钢家居器物的制造企业。产品线覆盖竖边套装、砂光拉丝件、砂光激光件与座式砂光器物，广泛应用于酒店、餐饮、茶室及居家场景。',
    'about.p2':        '我们提供从选型、打样到批量出货的完整支持，可按客户需求调整尺寸、表面处理与包装方案。',
    'about.l1':        '自主表面处理工艺线',
    'about.l2':        '支持来图来样定制',
    'about.l3':        '多道质检 · 出货前全检',

    /* ---------- 联系 ---------- */
    'contact.title':   '需要完整产品图册？',
    'contact.desc':    '留下联系方式，我们将发送全系列产品图册、规格尺寸与报价方案。',
    'contact.cta1':    '索取产品图册',
    'contact.cta2':    '电话咨询',
    'contact.kEmail':  '邮箱',
    'contact.kPhone':  '电话',
    'contact.kAddr':   '地址',
    'contact.addr':    '广东省 · 不锈钢制品产业带',

    /* ---------- 页脚 ---------- */
    'footer.tagline':  '不锈钢家居器物制造 · 镜光 / 拉丝 / 砂光 / 激光',
    'footer.nav1':     '品牌理念',
    'footer.nav2':     '全部产品',
    'footer.nav3':     '四大系列',
    'footer.nav4':     '关于我们',
    'footer.nav5':     '联系方式',
    'footer.repo':     '网站源码',
    'footer.copy':     '© {year} 美联美 MEILIANMEI. 保留所有权利。',

    /* ---------- 灯箱 ---------- */
    'lb.specFinish':   '表面工艺',
    'lb.specShape':    '形状',
    'lb.specSize':     '规格',
    'lb.specColor':    '颜色',
    'lb.specMat':      '材质',
    'lb.specShots':    '实拍张数',
    'lb.specCat':      '系列',
    'lb.material':     '食品级 304 不锈钢',
    'lb.shots':        '{n} 张',
    'lb.counter':      '{i} / {n} · 共 {n} 张实拍',
    'lb.caption':      '{name} · 图 {i}',
    'lb.inquiry':      '咨询此款',
    'lb.close':        '关闭',

    /* ---------- 动态小词 ---------- */
    'unit.category':   '系列',
    'finish.mirror':   '镜光',
    'finish.brush':    '拉丝',
    'finish.sanding':  '砂光',
    'finish.base':     '底座'
  };

  const EN = {
    /* ---------- Language gate ---------- */
    'gate.question':   'Choose your language',
    'gate.sub':        '请选择您的语言 · Choose your language',

    /* ---------- Nav ---------- */
    'nav.philosophy':  'Philosophy',
    'nav.products':    'Products',
    'nav.series':      'Series',
    'nav.about':       'About',
    'nav.contact':     'Contact',
    'nav.cta':         'Get Catalogue',
    'nav.langBtn':     '中文',

    /* ---------- Hero ---------- */
    'hero.title1':     'IN THE NAME',
    'hero.title2':     'OF <em>METAL</em>',
    'hero.desc':       'Mirror, hairline, satin and laser — four core finishes<br>that turn cold stainless steel into objects with warmth.',
    'hero.cta1':       'Browse All Products',
    'hero.cta2':       'Our Craft',
    'hero.chipA':      'Food-grade stainless',
    'hero.chipB':      'products available',
    'hero.scroll':     'SCROLL',

    /* ---------- Philosophy ---------- */
    'phi.title':       'Objects do not speak,<br>yet their quality does.',
    'phi.lede':
      'Meilianmei manufactures stainless-steel houseware — material selection, forming and surface ' +
      'finishing are all controlled in-house. We believe a good object needs no shouting: how it ' +
      'reflects light, how it feels in the hand, and how it performs after years of use — that is ' +
      'where real quality shows.',
    'phi.stat1':       'products available',
    'phi.stat2':       'core finishes',
    'phi.stat3':       'food-grade stainless',
    'phi.stat4':       'studio photographs',
    'phi.f1t':         'Mirror',
    'phi.f1e':         'MIRROR POLISHED',
    'phi.f1d':         'Multi-stage grinding and polishing create a surface that mirrors light — reflections travel across the curves for a full, luminous finish.',
    'phi.f2t':         'Hairline',
    'phi.f2e':         'HAIRLINE BRUSHED',
    'phi.f2d':         'Fine directional grain, warm to the touch and resistant to fingerprints, revealing the true colour of the metal beneath a satin sheen.',
    'phi.f3t':         'Satin',
    'phi.f3e':         'SATIN SANDING',
    'phi.f3d':         'An even, finely sanded surface with restrained, soft lustre — quiet, but full of detail.',
    'phi.f4t':         'Laser',
    'phi.f4e':         'LASER ENGRAVED',
    'phi.f4d':         'Geometric patterns laser-engraved on a matte base, revealing shifting layers of light as the viewing angle changes.',

    /* ---------- Products ---------- */
    'prod.title':      'ALL PRODUCTS',
    'prod.desc':       '21 products across four series: Vertical Edge, Satin & Hairline, Satin & Laser, and Pedestal. Click any product to see multiple studio shots.',
    'prod.filterAll':  'All',
    'prod.f1':         'Vertical Edge',
    'prod.f2':         'Satin & Hairline',
    'prod.f3':         'Satin & Laser',
    'prod.f4':         'Pedestal',
    'prod.empty':      'No products in this category yet.',
    'prod.views':      'VIEWS',
    'prod.viewDetail': 'VIEW DETAIL',

    /* ---------- Series ---------- */
    'series.title':    'FOUR SERIES',
    'series.desc':     'Each finish suits a different setting and mood — combine them freely to build a complete tabletop scheme.',
    'series.s1t':      'Vertical Edge Series',
    'series.s1d':      'A straight, vertical edge profile with crisp, upright lines. Available in mirror and hairline finishes as round sets, in gold and silver, with a matching base.',
    'series.s1m1':     'Mirror / Hairline',
    'series.s1m2':     'Gold / Silver',
    'series.s1m3':     '5 models',
    'series.s2t':      'Satin & Hairline Series',
    'series.s2d':      'A satin base with a hairline face, available in round 8, round 10, square, triangle, octagon and concave shapes — also supplied as complete sets.',
    'series.s2m1':     '9 models',
    'series.s2m2':     'Multi-shape',
    'series.s2m3':     'Sets available',
    'series.s3t':      'Satin & Laser Series',
    'series.s3d':      'Laser-engraved textures layered over a satin surface create fine geometric light patterns that shift in brightness and reflection with the viewing angle.',
    'series.s3m1':     '6 shapes',
    'series.s3m2':     'Laser texture',
    'series.s3m3':     'Matte finish',
    'series.s4t':      'Pedestal Series',
    'series.s4d':      'Body and base formed as one piece, with a low centre of gravity and a steady, composed stance. Fully satin-finished with soft, restrained lustre — the centrepiece of any table.',
    'series.s4m1':     'One-piece formed',
    'series.s4m2':     'Stable base',
    'series.s4m3':     'Fully satin',
    'series.jump':     'View this series',

    /* ---------- Banner ---------- */
    'banner.title':    'Craft lives in the details',
    'banner.desc':     'Every piece goes through forming, welding, grinding, polishing and multiple inspections.<br>We take the time, because feel and lustre cannot be faked.',

    /* ---------- About ---------- */
    'about.title':     'About Meilianmei',
    'about.p1':        'Meilianmei manufactures stainless-steel houseware. Our range covers vertical-edge sets, satin hairline pieces, satin laser pieces and pedestal items, widely used in hotels, restaurants, tea rooms and the home.',
    'about.p2':        'We support the whole process from selection and sampling to volume shipment, and can adjust dimensions, surface finish and packaging to your requirements.',
    'about.l1':        'In-house surface finishing lines',
    'about.l2':        'Custom production from drawings or samples',
    'about.l3':        'Multi-stage QC · full inspection before shipment',

    /* ---------- Contact ---------- */
    'contact.title':   'Need the full catalogue?',
    'contact.desc':    'Leave your contact details and we will send the complete product catalogue, specifications and quotation.',
    'contact.cta1':    'Request Catalogue',
    'contact.cta2':    'Call Us',
    'contact.kEmail':  'Email',
    'contact.kPhone':  'Phone',
    'contact.kAddr':   'Address',
    'contact.addr':    'Guangdong, China · Stainless Steel Manufacturing Belt',

    /* ---------- Footer ---------- */
    'footer.tagline':  'Stainless Steel Houseware · Mirror / Hairline / Satin / Laser',
    'footer.nav1':     'Philosophy',
    'footer.nav2':     'All Products',
    'footer.nav3':     'Four Series',
    'footer.nav4':     'About Us',
    'footer.nav5':     'Contact',
    'footer.repo':     'Source code',
    'footer.copy':     '© {year} MEILIANMEI. All rights reserved.',

    /* ---------- Lightbox ---------- */
    'lb.specFinish':   'Finish',
    'lb.specShape':    'Shape',
    'lb.specSize':     'Size',
    'lb.specColor':    'Colour',
    'lb.specMat':      'Material',
    'lb.specShots':    'Studio shots',
    'lb.specCat':      'Series',
    'lb.material':     'Food-grade 304 stainless steel',
    'lb.shots':        '{n} photos',
    'lb.counter':      '{i} / {n} · {n} studio shots',
    'lb.caption':      '{name} · photo {i}',
    'lb.inquiry':      'Enquire About This',
    'lb.close':        'Close',

    /* ---------- Small dynamic words ---------- */
    'unit.category':   'Series',
    'finish.mirror':   'Mirror',
    'finish.brush':    'Hairline',
    'finish.sanding':  'Satin',
    'finish.base':     'Base'
  };

  global.MLM_I18N = { zh: ZH, en: EN };
})(typeof window !== 'undefined' ? window : globalThis);
