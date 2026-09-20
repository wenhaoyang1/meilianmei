# =========================================================
#  一键推送.ps1 —— 免去在终端里输入/粘贴 token 的麻烦
#
#  用法：
#      在项目文件夹里右键 → 「在 PowerShell 中运行」
#      或者： powershell -ExecutionPolicy Bypass -File "一键推送.ps1"
#
#  它会：读取 token → 配置代理 → 推送 → 记住凭据
# =========================================================

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Root  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo  = 'meilianmei'
$User  = 'wenhaoyang1'
$Proxy = 'socks5://127.0.0.1:10808'

function Line($t) { Write-Host $t }

Line ''
Line '========================================'
Line '   美联美网站 · 一键推送到 GitHub'
Line '========================================'
Line ''

Set-Location $Root

# ---------- 1. 检查基础环境 ----------
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Line '[×] 没有找到 git，请先安装 Git for Windows。'; exit 1
}

Line "[1/5] 检查代理 $Proxy ..."
$proxyOk = Test-NetConnection -ComputerName 127.0.0.1 -Port 10808 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($proxyOk) {
    git config --global http.https://github.com.proxy  $Proxy | Out-Null
    git config --global https.https://github.com.proxy $Proxy | Out-Null
    Line '      ✓ 加速器端口正常，已让 git 走代理'
} else {
    Line '      ! 加速器端口 10808 没有监听，将不启用代理（若推送超时请先打开加速器）'
    git config --global --unset http.https://github.com.proxy  2>$null | Out-Null
    git config --global --unset https.https://github.com.proxy 2>$null | Out-Null
}

# ---------- 2. 获取 token ----------
Line ''
Line '[2/5] 需要你的 Personal Access Token（ghp_ 开头那串）'
Line '      获取地址： https://github.com/settings/tokens/new  （勾选 repo 权限）'
Line ''

$token = ''
# 优先用已有的环境变量，避免重复输入
if ($env:GIT_TOKEN -and $env:GIT_TOKEN.StartsWith('ghp_')) {
    $token = $env:GIT_TOKEN
    Line '      已使用当前窗口中已设置的 GIT_TOKEN'
} else {
    $sec = Read-Host '      请粘贴 token 后按回车（粘贴不了就用鼠标右键）' -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
    try   { $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

$token = ($token -replace '\s', '')
if ([string]::IsNullOrWhiteSpace($token)) { Line '      [×] 没有输入 token，已退出。'; exit 1 }
if ($token.Length -lt 20)                 { Line '      [×] 这串 token 看起来太短，请确认复制完整。'; exit 1 }
Line ("      ✓ 已读取 token（长度 {0}，不显示内容）" -f $token.Length)

# ---------- 3. 确认远程仓库 ----------
Line ''
Line '[3/5] 配置远程仓库 ...'
$url = "https://github.com/$User/$Repo.git"
$existing = git remote 2>$null
if ($existing -contains 'origin') {
    git remote set-url origin $url
    Line "      ✓ 已更新 origin → $url"
} else {
    git remote add origin $url
    Line "      ✓ 已添加 origin → $url"
}

# ---------- 4. 推送（token 只放在内存里，不写入文件/URL） ----------
Line ''
Line '[4/5] 开始推送 ...'
$env:GIT_USER     = $User
$env:GIT_TOKEN    = $token
$env:GIT_ASKPASS  = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$Root\tools\git-askpass.ps1`""
$env:GIT_TERMINAL_PROMPT = '0'

$pushed = $false
try {
    git push -u origin main 2>&1 | ForEach-Object { Line "      $_" }
    $pushed = ($LASTEXITCODE -eq 0)
} catch {
    Line "      [×] 推送出错：$_"
} finally {
    Remove-Item Env:\GIT_TOKEN, Env:\GIT_ASKPASS, Env:\GIT_TERMINAL_PROMPT -ErrorAction SilentlyContinue
    $token = $null
}

# ---------- 5. 结果 ----------
Line ''
if ($pushed) {
    Line '[5/5] ✓ 推送成功！'
    Line ''
    Line '  接下来做最后一步（网页操作，只需一次）：'
    Line '    1. 打开仓库 → Settings → 左侧 Pages'
    Line '    2. Build and deployment → Source 选择「GitHub Actions」'
    Line '    3. 等 1~2 分钟，访问：'
    Line "       https://$User.github.io/$Repo/"
} else {
    Line '[5/5] [×] 推送没有成功，请看上面的报错信息：'
    Line ''
    Line '  · Repository not found  → 还没在 GitHub 上创建仓库，先去 https://github.com/new'
    Line '                            创建名为 meilianmei 的公开空仓库（不要勾选 README）'
    Line '  · Authentication failed → token 复制不完整，或已过期，重新生成一个'
    Line '  · port 443 / timeout    → 加速器没开，打开后重跑本脚本'
    Line '  · 其它情况              → 把报错原文发给我'
}
Line ''
Read-Host '按回车键关闭窗口'
