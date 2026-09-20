# =========================================================
#  git-askpass.ps1 —— 让 Git 从「环境变量」读取账号密码
#
#  用途：解决 PowerShell 窗口里无法粘贴 Personal Access Token 的问题。
#  原理：Git 需要账号/密码时会调用本脚本，脚本直接从环境变量里取值返回，
#        全程不经过手输/粘贴，token 也不会写进 URL 或磁盘。
#
#  用法见 部署到GitHub.md
# =========================================================

param([string]$Prompt = '')

# Git 会问两次：一次要用户名，一次要密码 —— 用提示语区分
#   用户名提示形如： "Username for 'https://github.com'"
#   密码提示形如：   "Password for 'https://wenhaoyang1@github.com'"
if ($Prompt -match 'Username') {
    [Console]::Out.Write($env:GIT_USER)
}
elseif ($Prompt -match 'Password') {
    [Console]::Out.Write($env:GIT_TOKEN)
}
else {
    # 兜底：先给用户名，再给 token
    if ([string]::IsNullOrEmpty($env:GIT_USER)) {
        [Console]::Out.Write($env:GIT_TOKEN)
    } else {
        [Console]::Out.Write($env:GIT_USER)
    }
}
