# 部署到 GitHub Pages · 操作步骤

**目标网址**：https://wenhaoyang1.github.io/meilianmei/

本地仓库已经初始化完成（分支 `main`，共 259 个文件 / 27.9 MB），
原始素材 `产品素材/`（2.4 GB）和 `node_modules/` 已排除，不会上传。

---

## 第一步：在 GitHub 上创建空仓库

1. 打开 https://github.com/new
2. **Repository name** 填：`meilianmei`
3. 可见性选 **Public**（免费账号的 Pages 必须公开仓库；Private 需要付费版）
4. **不要**勾选 "Add a README file"、".gitignore"、"license"（保持空仓库）
5. 点 **Create repository**

---

## 第二步：推送代码

先修正提交署名（可选，但建议做，这样提交才会算在你账号名下）：

```powershell
cd C:\Users\Yangwenhao\Desktop\网页制作
git config user.name "wenhaoyang1"
git config user.email "你的GitHub邮箱"      # 或 wenhaoyang1@users.noreply.github.com
git commit --amend --reset-author --no-edit
```

然后关联远程仓库并推送（把下面的用户名换成你的，与上面一致即可）：

```powershell
git remote add origin https://github.com/wenhaoyang1/meilianmei.git
git push -u origin main
```

> 推送时会弹出登录窗口，需要**用户名 + Personal Access Token（不是登录密码）**。
> Token 获取：GitHub 右上角头像 → Settings → Developer settings →
> Personal access tokens → **Tokens (classic)** → Generate new token (classic)
> → 勾选 **repo** 权限 → 生成后复制那串 `ghp_...`，粘贴到密码框。
> 建议把 token 保存到 GitHub Desktop 或凭据管理器，避免每次输入。

### 更省事的两个替代方案

- **GitHub Desktop**（图形界面，不用敲命令、不用配 token）：
  下载安装 → File → Add local repository → 选 `C:\Users\Yangwenhao\Desktop\网页制作`
  → Publish repository → 取消勾选 "Keep this code private" → Publish。
- **纯网页上传**：仓库页面 → Add file → Upload files → 把 `index.html`、`assets`、
  `.nojekyll` 等拖进去。缺点是每次更新都要手动传，不推荐。

---

## 第三步：开启 GitHub Pages

推送完成后，仓库里已经有 `.github/workflows/deploy-pages.yml`，它会在每次推送时自动发布。

1. 进入仓库 → **Settings**（顶部菜单）
2. 左侧栏 → **Pages**
3. **Build and deployment → Source** 选 **GitHub Actions**（不要选 "Deploy from a branch"）
4. 回到仓库 **Actions** 标签页，能看到 "Deploy to GitHub Pages" 正在运行
5. 等 1–2 分钟，变成绿色 ✓ 后，访问：

   ### https://wenhaoyang1.github.io/meilianmei/

首次访问可能需要等 1 分钟左右才会生效。手机上打开同一个链接即可查看移动端效果。

---

## 以后如何更新网站

改了文字、换了图片之后：

```powershell
cd C:\Users\Yangwenhao\Desktop\网页制作
git add -A
git commit -m "更新产品内容"
git push
```

推送后 GitHub Actions 会自动重新部署，约 1 分钟后线上就是最新版本。

---

## 常见问题

| 现象 | 原因与解决 |
| --- | --- |
| Actions 里报错 `Get Pages site failed` | Settings → Pages → Source 没有选成 **GitHub Actions** |
| 推送被拒绝 `remote contains work you do not have` | 建仓库时勾选了 README。执行 `git pull --rebase origin main` 再 `git push` |
| 页面样式丢失 / 图片不显示 | 确认 `assets/` 目录已一起推送（`git ls-files assets \| wc -l` 应为 249） |
| 打开是 404 | 检查网址结尾是否有 `/`；仓库必须是 Public；等待部署完成 |
| 想用自己的域名 | Settings → Pages → Custom domain 填入域名，再到域名服务商加一条 CNAME 记录 |

---

## 说明：为什么不上传原始素材

`产品素材/` 约 **2.4 GB**（最大的 `美联美原图5.25拍二.rar` 单个就有 698 MB）。
GitHub 单文件超过 100 MB 会被直接拒绝，仓库过大也会导致 clone / 推送极慢。
网站实际使用的是 `assets/img/` 下已处理好的三套图片（合计 27.6 MB），完全够用。

如果以后确实需要把原始素材备份到云端，建议用网盘或对象存储（阿里云 OSS / 腾讯云 COS），
不建议放进 Git 仓库。
