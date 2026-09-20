# 美联美 MEILIANMEI · 产品展示网站

单页产品展示站，纯静态（HTML + CSS + 原生 JS），**无需构建、无框架依赖**，同时适配手机端与电脑端。

---

## 一、如何打开

**方式一（最简单）**：双击 `index.html`，浏览器直接打开即可。

**方式二（推荐，使用 http 协议）**：

```powershell
node server.mjs
# 然后浏览器访问 http://127.0.0.1:5173
```

---

## 二、目录结构

```
网页制作/
├─ index.html                # 页面结构（首屏 / 理念 / 产品 / 系列 / 关于 / 联系）
├─ server.mjs                # 可选：本地预览服务器
├─ 部署到GitHub.md            # 部署到 GitHub Pages 的详细步骤
├─ .github/workflows/        # GitHub Actions：推送后自动部署
├─ assets/
│  ├─ css/style.css          # 全部样式与动画
│  ├─ js/data.js             # 产品数据（改内容只改这里）
│  ├─ js/main.js             # 交互逻辑（动画、筛选、灯箱、导航）
│  └─ img/
│     ├─ card/               # 4:3 卡片图（1100px 宽，列表用）
│     ├─ view/               # 1:1 灯箱大图（1500px 宽，详情用）
│     └─ hero/               # 4:5 竖版大图（1800px 宽，首屏/系列用）
├─ 产品素材/                  # 你的原始素材（未改动）
└─ tools/
   ├─ build-assets.ps1       # 由原始素材生成 assets/img 下的三套图片
   ├─ verify.mjs             # 静态检查：资源引用、CSS/JS 语法
   └─ test-dom.mjs           # 运行时检查：jsdom 加载页面并模拟点击
```

---

## 三、部署到 GitHub Pages（发给别人看）

目标网址：`https://wenhaoyang1.github.io/meilianmei/`

本地 Git 仓库已初始化完成（分支 `main`），只需三步：

1. 在 https://github.com/new 创建**空的公开仓库**，名字填 `meilianmei`（不要勾选 README）
2. 推送：

   ```powershell
   cd C:\Users\Yangwenhao\Desktop\网页制作
   git config user.name "wenhaoyang1"
   git config user.email "你的GitHub邮箱"
   git commit --amend --reset-author --no-edit
   git remote add origin https://github.com/wenhaoyang1/meilianmei.git
   git push -u origin main
   ```

3. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**，等 Actions 跑完即可访问

详细步骤、Token 获取方式、常见报错解决见 **`部署到GitHub.md`**。

---

## 四、产品与素材的对应关系

网站内容全部来自 `产品素材/` 下的文件夹，共 **21 款产品 / 82 张原图**，归为 4 个系列：

| 系列 | 对应素材目录 | 产品数 |
| --- | --- | --- |
| 竖边系列 | `竖边金色镜光套装圆形`、`竖边镜光套装圆形`、`竖边拉丝金色圆形套装`、`竖边拉丝银色圆形套装`、`竖边套装底座` | 5 |
| 砂光拉丝系列 | `砂光拉丝/` 下 9 个子目录 | 9 |
| 砂光激光系列 | `砂光激光/` 下 6 个子目录 | 6 |
| 座式砂光系列 | `坐式砂光` | 1 |

原始图片是 2900–8000px 的方形大图（单张最大约 9MB），已统一处理为网页用尺寸，
并按 `产品英文标识-序号.jpg` 命名，例如 `card/shubian-mirror-gold-01.jpg`。

> `产品素材/图册/` 中是 zip / rar 压缩包（合计约 1.5GB），未纳入网站。
> 如需把其中某个压缩包的产品也展示出来，解压后告诉我文件夹名，我可以继续加进去。

---

## 五、如何自己修改内容

### 1. 改文字、价格、规格、产品说明

编辑 `assets/js/data.js`，其中：

- `BRAND` —— 品牌介绍与数字（首屏与理念区）
- `CATEGORIES` —— 四大系列的名称与描述
- `PRODUCTS` —— 每款产品的名称、英文名、分类、形状、颜色、标签、图片张数、说明

`count` 必须与该产品实际图片张数一致，否则灯箱翻页会越界。

### 2. 新增一款产品（素材已在 `assets/img` 中）

在 `PRODUCTS` 里照抄一条改内容即可，`slug` 要与图片文件名前缀一致。

### 3. 用新的原始素材重新生成图片

把新文件夹放进 `产品素材/`，然后在 `tools/build-assets.ps1` 顶部的 `$map` 里
加一行 `'文件夹名' = 'english-slug'`，再运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\build-assets.ps1"
```

脚本会自动生成 `card / view / hero` 三套尺寸，并输出 `tools/manifest.json`。

### 4. 改配色

`assets/css/style.css` 顶部的 `:root` 变量：`--gold`（金色）、`--ink`（背景）、
`--paper`（浅色）等，改一处即可全站生效。

---

## 六、已实现的动效（滚动时触发）

- 首屏：标题逐行上推、图片淡入、金色光带扫过、圆环文字缓慢旋转、浮动数据标签
- 页面顶部金色滚动进度条
- 内容进入视口时淡入上浮（`IntersectionObserver`，同组元素错峰出现）
- 大标题遮罩揭示（clip-path）
- 滚动视差：首屏光晕、系列图、横幅图、关于区块
- 工艺信息带无缝横向滚动（鼠标悬停暂停）
- 数据数字从 0 滚动到目标值
- 产品卡：悬停图片缓慢放大 + 高光扫过 + 箭头旋转
- 桌面端：自定义金色光标、按钮磁吸、图片 3D 倾斜
- 移动端：汉堡菜单逐项下坠、灯箱左右滑动切换

同时已适配 `prefers-reduced-motion`（系统开启「减弱动态效果」时自动关闭所有动画）。

---

## 七、交互功能

- **分类筛选**：全部 / 竖边 / 砂光拉丝 / 砂光激光 / 座式砂光，切换时重新播放卡片入场动画
- **产品灯箱**：点击卡片查看该款全部实拍图，支持缩略图、左右箭头、键盘 ← →、Esc 关闭、手机左右滑动
- **导航**：向下滚动自动隐藏、向上滚动出现，滚动后变为毛玻璃并高亮当前区块
- **锚点**：平滑滚动并自动补偿固定导航高度

---

## 八、自检命令

```powershell
node tools/verify.mjs .      # 资源引用 / 图片完整性 / CSS·JS 语法
node tools/test-dom.mjs .    # 无头浏览器行为测试（需要 jsdom）
```

`test-dom.mjs` 需要 jsdom：`npm install jsdom`（仅开发自检用，网站本身不依赖任何 npm 包）。
运行前请先在另一个终端启动 `node server.mjs`，测试脚本会通过 http 加载页面并模拟真实点击。

---

## 九、移动端适配说明

- 断点：`620px` / `600px` / `960px` / `1000px` / `1080px`
- 产品网格：手机 1 列 → 平板 2 列 → 桌面 3 列
- 字号使用 `clamp()` 流式缩放，不依赖固定像素
- 首屏高度使用 `100svh`，避免手机地址栏导致的高度跳动
- 触摸设备自动关闭 hover 位移与自定义光标，保留滑动切换
