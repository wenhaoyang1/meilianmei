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

### 2.1 国内网络：先给 Git 配代理

如果推送时报 `Failed to connect to github.com port 443`，说明 Git 没有走你的加速器。
假设你的加速器本地端口是 `10808`（SOCKS5），执行：

```powershell
git config --global http.https://github.com.proxy  socks5://127.0.0.1:10808
git config --global https.https://github.com.proxy socks5://127.0.0.1:10808
```

这种写法**只让 github.com 走代理**，访问 Gitee、公司内网 Git 等不受影响。

测试是否连通（能打印出一串 40 位哈希值就说明通了）：

```powershell
git ls-remote https://github.com/git/git.git HEAD
```

> `10808` 是 SOCKS5 端口就不用改。如果配了 SOCKS5 仍连不上，
> 说明你的加速器那是 HTTP 端口，换成下面这组再试：
>
> ```powershell
> git config --global http.https://github.com.proxy  http://127.0.0.1:10808
> git config --global https.https://github.com.proxy http://127.0.0.1:10808
> ```

**用完想取消代理**（换到能直连的网络时，若发现连不上就取消它）：

```powershell
git config --global --unset http.https://github.com.proxy
git config --global --unset https.https://github.com.proxy
```

查看当前代理配置是否生效：

```powershell
git config --global --get-regexp proxy
```

---

### 2.2 修正提交署名并推送

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

### 2.3 如果 PowerShell 窗口里粘不进 token

Git 在终端里索要密码时，**不显示任何字符**（连 `*` 都没有），而且部分 PowerShell
控制台里 `Ctrl+V` 是失效的。按顺序试：

1. **在窗口内点鼠标右键** —— 就是粘贴（最万能，先试这个）
2. **Ctrl+Shift+V** —— PowerShell 5.1 需要带 Shift
3. **Alt+空格 → 编辑 → 粘贴** —— 用窗口左上角菜单

如果三种都不行，用下面这个**完全不需要粘贴**的办法：把账号和 token 放进环境变量，
让 Git 自己去读。

**第 1 步**：设置环境变量（token 只在本窗口有效，关闭窗口即失效，不会落盘）

```powershell
$env:GIT_USER  = "wenhaoyang1"
$env:GIT_TOKEN = "粘贴到这里"        # 这一步在普通命令行就能正常粘贴
```

**第 2 步**：让 Git 调用现成的脚本读取（仓库里已备好 `tools/git-askpass.ps1`）

```powershell
$env:GIT_ASKPASS = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$PWD\tools\git-askpass.ps1`""
```

**第 3 步**：正常推送，不会再弹任何输入框

```powershell
git push -u origin main
```

**第 4 步**（可选，清理）：推送成功后关掉窗口即可，或手动清除

```powershell
Remove-Item Env:\GIT_TOKEN, Env:\GIT_ASKPASS
```

> 说明：`$env:GIT_TOKEN` 只存在于当前 PowerShell 进程，不会写入文件或注册表。
> 推送一次成功后，Windows 凭据管理器会自动记住凭据，之后就不用再管这些变量了。

---

## 第三步：开启 GitHub Pages

推送完成后，仓库里已经有 `.github/workflows/deploy-pages.yml`，它会在每次推送时自动发布。

1. 进入仓库 → **Settings**（顶部菜单）
2. 左侧栏 → **Pages**
3. **Build and deployment → Source** 选 **GitHub Actions**（不要选 "Deploy from a branch"）
4. 回到仓库 **Actions** 标签页，能看到 "Deploy to GitHub Pages" 正在运行
5. 等 1–2 分钟，变成绿色 ✓ 后，访问：

   ### https://wenhaoyang1.github.io/meilianmei/

首次访问可能需要等 1–5 分钟才会生效（CDN 传播），这段时间反复刷新即可，
**不是配置错误**。手机上打开同一个链接即可查看移动端效果。

> **这一步没做，Actions 必定失败**：报错位置在「配置 Pages」步骤，显示
> `Get Pages site failed`。工作流已加 `enablement: true` 兜底自动开启，
> 但仍建议在 Settings 里手动选一次，最稳。
> 选 Source 这一项**立即生效，没有"保存"按钮**。

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
| `Failed to connect to github.com port 443` | Git 没走代理，见 **2.1 节**；先确认加速器已开启且端口正确 |
| PowerShell 里粘不进 token / 输入没反应 | 见 **2.3 节**：先试鼠标右键，或改用环境变量 + `git-askpass.ps1` |
| 配了代理后仍连不上 | 把 `socks5://` 换成 `http://` 再试（端口类型判断错误） |
| 换了网络后突然推送失败 | 可能是代理配置残留，用 `--unset` 取消代理 |
| Actions 里报错 `Get Pages site failed` | **最常见**：Settings → Pages → Source 没选成 **GitHub Actions**。详见第三步 |
| Actions 显示成功但网址 404 | CDN 还在传播，等 1–5 分钟；确认网址结尾有 `/` |
| 推送时报 `schannel: failed to receive handshake` | 加速器节点不稳定。可先试直连（部分网络现在能直连），或换节点 |
| 推送被拒绝 `remote contains work you do not have` | 建仓库时勾选了 README。执行 `git pull --rebase origin main` 再 `git push` |
| 页面样式丢失 / 图片不显示 | 确认 `assets/` 目录已一起推送（`git ls-files assets \| wc -l` 应为 249） |
| 打开是 404 | 检查网址结尾是否有 `/`；仓库必须是 Public；Actions 是否已成功 |
| 想用自己的域名 | Settings → Pages → Custom domain 填入域名，再到域名服务商加一条 CNAME 记录 |

---

## 说明：为什么不上传原始素材

`产品素材/` 约 **2.4 GB**（最大的 `美联美原图5.25拍二.rar` 单个就有 698 MB）。
GitHub 单文件超过 100 MB 会被直接拒绝，仓库过大也会导致 clone / 推送极慢。
网站实际使用的是 `assets/img/` 下已处理好的三套图片（合计 27.6 MB），完全够用。

如果以后确实需要把原始素材备份到云端，建议用网盘或对象存储（阿里云 OSS / 腾讯云 COS），
不建议放进 Git 仓库。
