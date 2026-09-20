# 产品图片批处理：从原始 JPG 生成网页用缩略图 / 灯箱图
# 输出目录: assets/img/{card,view,hero}
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$root    = Split-Path -Parent $PSScriptRoot
$srcRoot = Join-Path $root '产品素材'
$outRoot = Join-Path $root 'assets\img'

# 产品文件夹 -> slug
$map = [ordered]@{
  '竖边金色镜光套装圆形'   = 'shubian-mirror-gold'
  '竖边镜光套装圆形'       = 'shubian-mirror-silver'
  '竖边拉丝金色圆形套装'   = 'shubian-brush-gold'
  '竖边拉丝银色圆形套装'   = 'shubian-brush-silver'
  '竖边套装底座'           = 'shubian-base'
  '砂光拉丝\三角形'        = 'shaguang-brush-triangle'
  '砂光拉丝\八边形'        = 'shaguang-brush-octagon'
  '砂光拉丝\内凹圆'        = 'shaguang-brush-concave'
  '砂光拉丝\圆8'           = 'shaguang-brush-round8'
  '砂光拉丝\圆10'          = 'shaguang-brush-round10'
  '砂光拉丝\正方形'        = 'shaguang-brush-square'
  '砂光拉丝\圆形砂光套装10cm' = 'shaguang-brush-set10'
  '砂光拉丝\方形金色拉丝套装' = 'shaguang-brush-square-gold'
  '砂光拉丝\银色方形套装'   = 'shaguang-brush-square-silver'
  '砂光激光\三角'          = 'shaguang-laser-triangle'
  '砂光激光\八边'          = 'shaguang-laser-octagon'
  '砂光激光\内凹'          = 'shaguang-laser-concave'
  '砂光激光\圆8'           = 'shaguang-laser-round8'
  '砂光激光\圆10'          = 'shaguang-laser-round10'
  '砂光激光\正方形'        = 'shaguang-laser-square'
  '坐式砂光'               = 'zuoshi-sanding'
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }

function Get-EncoderParams([int]$quality) {
  $p = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [int64]$quality)
  return $p
}

function Save-Crop {
  param(
    [System.Drawing.Image]$Image,
    [double]$TargetRatio,             # 目标宽高比 (w/h)
    [int]$TargetWidth,
    [string]$OutPath,
    [int]$Quality
  )
  $srcRatio = $Image.Width / $Image.Height
  if ($srcRatio -gt $TargetRatio) {
    # 原图更宽 -> 裁左右
    $cropH = $Image.Height
    $cropW = [int][math]::Round($cropH * $TargetRatio)
  } else {
    $cropW = $Image.Width
    $cropH = [int][math]::Round($cropW / $TargetRatio)
  }
  $sx = [int](($Image.Width  - $cropW) / 2)
  $sy = [int](($Image.Height - $cropH) / 2)
  $targetH = [int][math]::Round($TargetWidth / $TargetRatio)

  $bmp = New-Object System.Drawing.Bitmap($TargetWidth, $targetH)
  $bmp.SetResolution(72, 72)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $dest = New-Object System.Drawing.Rectangle(0, 0, $TargetWidth, $targetH)
  $srcR = New-Object System.Drawing.Rectangle($sx, $sy, $cropW, $cropH)
  $g.DrawImage($Image, $dest, $srcR, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  # 渐进式 JPEG
  $bmp.Save($OutPath, $jpegCodec, (Get-EncoderParams $Quality))
  $bmp.Dispose()
}

foreach ($dir in @('card', 'view', 'hero')) {
  New-Item -ItemType Directory -Force -Path (Join-Path $outRoot $dir) | Out-Null
}

# 变体定义：目录 / 目标宽 / 宽高比 / 质量
$variants = @(
  @{ Dir = 'card'; W = 1100; Ratio = 4.0 / 3.0; Q = 86 },
  @{ Dir = 'view'; W = 1500; Ratio = 1.0;       Q = 86 },
  @{ Dir = 'hero'; W = 1800; Ratio = 4.0 / 5.0; Q = 82 }
)

$manifest = @()
$total = 0

foreach ($key in $map.Keys) {
  $slug = $map[$key]
  $dirPath = Join-Path $srcRoot $key
  if (-not (Test-Path -LiteralPath $dirPath)) { Write-Warning "缺少目录: $key"; continue }

  $files = Get-ChildItem -LiteralPath $dirPath -File |
           Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' } |
           Sort-Object Name

  $idx = 0
  foreach ($f in $files) {
    $idx++
    $num = '{0:D2}' -f $idx
    $img = $null
    try { $img = [System.Drawing.Image]::FromFile($f.FullName) } catch { Write-Warning "读取失败 $($f.Name)"; continue }
    foreach ($v in $variants) {
      $out = Join-Path (Join-Path $outRoot $v.Dir) "$slug-$num.jpg"
      Save-Crop -Image $img -TargetRatio $v.Ratio -TargetWidth $v.W -OutPath $out -Quality $v.Q
    }
    $manifest += [pscustomobject]@{
      slug  = $slug
      index = $idx
      file  = $f.Name
      w     = $img.Width
      h     = $img.Height
    }
    $img.Dispose()
    $total++
    Write-Host ("  {0}-{1}  <- {2}" -f $slug, $num, $f.Name)
  }
}

$manifest | ConvertTo-Json -Depth 3 | Set-Content -Encoding UTF8 (Join-Path $root 'tools\manifest.json')
Write-Host "`n完成：处理 $total 张原图" -ForegroundColor Green

Get-ChildItem -LiteralPath $outRoot -Directory | ForEach-Object {
  $s = (Get-ChildItem -LiteralPath $_.FullName -File | Measure-Object Length -Sum).Sum / 1MB
  "{0}: {1:N1} MB" -f $_.Name, $s
}
