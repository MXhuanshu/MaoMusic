# Generates the NSIS installer artwork (24bpp BMP) used by electron-builder.
# Keep this file ASCII-only: Windows PowerShell 5.1 reads it as ANSI when there is no BOM.
# Chinese glyphs are built from char codes so the script stays portable.

param([string]$Version = '')

Add-Type -AssemblyName System.Drawing

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $here
$outDir = Join-Path $root 'resources\installer'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if (-not $Version) {
  $pkg = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'package.json') | ConvertFrom-Json
  $Version = $pkg.version
}

# 猫仙音乐
$brand = [string]([char]0x732B + [char]0x4ED9 + [char]0x97F3 + [char]0x4E50)
# 猫
$catChar = [string]([char]0x732B)

function New-Canvas {
  param([int]$w, [int]$h, [string]$top, [string]$bottom, [double]$angle = 90.0)

  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.ColorTranslator]::FromHtml($top),
    [System.Drawing.ColorTranslator]::FromHtml($bottom),
    $angle
  )
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()

  return @($bmp, $g)
}

function Get-RoundPath {
  param([single]$x, [single]$y, [single]$w, [single]$h, [single]$r)

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Centered {
  param($g, [string]$text, $font, $brush, [single]$x, [single]$y, [single]$w, [single]$h)

  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF($x, $y, $w, $h)
  $g.DrawString($text, $font, $brush, $rect, $fmt)
  $fmt.Dispose()
}

function Draw-Left {
  param($g, [string]$text, $font, $brush, [single]$x, [single]$y)

  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Near
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Near
  $point = New-Object System.Drawing.PointF($x, $y)
  $g.DrawString($text, $font, $brush, $point, $fmt)
  $fmt.Dispose()
}

# ---------------------------------------------------------------- header 150x57
$pair = New-Canvas -w 150 -h 57 -top '#101014' -bottom '#1D1D24' -angle 0
$bmp = $pair[0]; $g = $pair[1]

$accentPath = Get-RoundPath -x 11 -y 16 -w 26 -h 26 -r 8
$accentRect = New-Object System.Drawing.Rectangle(11, 16, 26, 26)
$accentBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $accentRect,
  [System.Drawing.ColorTranslator]::FromHtml('#FB923C'),
  [System.Drawing.ColorTranslator]::FromHtml('#EA580C'),
  45.0
)
$g.FillPath($accentBrush, $accentPath)
$accentBrush.Dispose()
$accentPath.Dispose()

$fontCat = New-Object System.Drawing.Font('Microsoft YaHei UI', 15, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
Draw-Centered -g $g -text $catChar -font $fontCat -brush $white -x 11 -y 16 -w 26 -h 26
$fontCat.Dispose()

$fontBrandHeader = New-Object System.Drawing.Font('Microsoft YaHei UI', 12, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
Draw-Left -g $g -text $brand -font $fontBrandHeader -brush $white -x 45 -y 13
$fontBrandHeader.Dispose()

$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 138, 138, 148))
$fontSub = New-Object System.Drawing.Font('Segoe UI', 6.5, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
Draw-Left -g $g -text 'M A O   M U S I C' -font $fontSub -brush $muted -x 45 -y 32
$fontSub.Dispose()

$bmp.Save((Join-Path $outDir 'installerHeader.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)
$white.Dispose(); $muted.Dispose(); $g.Dispose(); $bmp.Dispose()

# ------------------------------------------------------------- sidebar 164x314
$pair = New-Canvas -w 164 -h 314 -top '#0A0A0D' -bottom '#18181E' -angle 90
$bmp = $pair[0]; $g = $pair[1]

# soft top glow
for ($i = 3; $i -ge 1; $i--) {
  $alpha = 6 + (3 - $i) * 5
  $size = 60 + $i * 34
  $glow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
  $g.FillEllipse($glow, 82 - $size / 2, 40 - $size / 2, $size, $size)
  $glow.Dispose()
}

# orbit ring + accent dot
$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(46, 255, 255, 255), 1.2)
$g.DrawEllipse($ringPen, 40, 58, 84, 84)
$ringPen.Dispose()

$dotRect = New-Object System.Drawing.Rectangle(101, 76, 14, 14)
$dotBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $dotRect,
  [System.Drawing.ColorTranslator]::FromHtml('#FDBA74'),
  [System.Drawing.ColorTranslator]::FromHtml('#EA580C'),
  45.0
)
$g.FillEllipse($dotBrush, $dotRect)
$dotBrush.Dispose()

$fontBrand = New-Object System.Drawing.Font('Microsoft YaHei UI', 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
Draw-Centered -g $g -text $brand -font $fontBrand -brush $white -x 0 -y 176 -w 164 -h 26
$fontBrand.Dispose()

$fontSub = New-Object System.Drawing.Font('Segoe UI', 7, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 113, 113, 122))
Draw-Centered -g $g -text 'M A O   M U S I C' -font $fontSub -brush $dimBrush -x 0 -y 204 -w 164 -h 12
$fontSub.Dispose()

$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(34, 255, 255, 255), 1)
$g.DrawLine($linePen, 52, 230, 112, 230)
$linePen.Dispose()

$fontTiny = New-Object System.Drawing.Font('Segoe UI', 6.5, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$faintBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 82, 82, 91))
Draw-Centered -g $g -text 'F O L I A   U I' -font $fontTiny -brush $faintBrush -x 0 -y 238 -w 164 -h 12
Draw-Centered -g $g -text ('v' + $Version) -font $fontTiny -brush $faintBrush -x 0 -y 252 -w 164 -h 12
$fontTiny.Dispose()

$barPath = Get-RoundPath -x 64 -y 282 -w 36 -h 2 -r 1
$barBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(64, 281, 36, 4)),
  [System.Drawing.ColorTranslator]::FromHtml('#FB923C'),
  [System.Drawing.ColorTranslator]::FromHtml('#EA580C'),
  0.0
)
$g.FillPath($barBrush, $barPath)
$barBrush.Dispose(); $barPath.Dispose()

$bmp.Save((Join-Path $outDir 'installerSidebar.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)
$white.Dispose(); $dimBrush.Dispose(); $faintBrush.Dispose(); $g.Dispose(); $bmp.Dispose()

Copy-Item (Join-Path $outDir 'installerSidebar.bmp') (Join-Path $outDir 'uninstallerSidebar.bmp') -Force

Get-ChildItem $outDir -Filter *.bmp | ForEach-Object {
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  $tag = [char]$bytes[0] + [char]$bytes[1]
  '{0,-24} {1,4} x {2,-4}  {3}  {4} KB' -f $_.Name, [System.BitConverter]::ToInt32($bytes, 18), [System.BitConverter]::ToInt32($bytes, 22), $tag, [math]::Round($_.Length / 1KB, 1)
}
