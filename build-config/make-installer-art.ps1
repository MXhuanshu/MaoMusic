# Generates NSIS installer artwork from the app logo.
# ASCII only: Windows PowerShell reads BOM-less files as ANSI.

param(
  [Parameter(Mandatory = $true)][string]$Logo,
  [string]$Version = '1.0.2'
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'resources\installer'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$brand = [string]([char]0x732B + [char]0x4ED9 + [char]0x97F3 + [char]0x4E50)
$logoImg = [System.Drawing.Image]::FromFile($Logo)

function New-RoundPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(16, 16, 20),
    [System.Drawing.Color]::FromArgb(28, 28, 34),
    90.0
  )
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()
  return @($bmp, $g)
}

function Draw-Logo($g, [single]$x, [single]$y, [single]$size, [single]$radius) {
  $path = New-RoundPath $x $y $size $size $radius
  $state = $g.Save()
  $g.SetClip($path)
  $dest = New-Object System.Drawing.Rectangle([int]$x, [int]$y, [int]$size, [int]$size)
  $g.DrawImage($logoImg, $dest)
  $g.Restore($state)
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), 1)
  $g.DrawPath($pen, $path)
  $pen.Dispose()
  $path.Dispose()
}

# header 150x57
$pair = New-Canvas -w 150 -h 57
$bmp = $pair[0]; $g = $pair[1]
Draw-Logo $g 11 13 32 9
$font = New-Object System.Drawing.Font('Microsoft YaHei UI', 12, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString($brand, $font, $white, 50, 12)
$font.Dispose()
$fontSub = New-Object System.Drawing.Font('Segoe UI', 6.5, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(138, 138, 148))
$g.DrawString('M A O   M U S I C', $fontSub, $muted, 50, 32)
$fontSub.Dispose()
$bmp.Save((Join-Path $outDir 'installerHeader.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)
$white.Dispose(); $muted.Dispose(); $g.Dispose(); $bmp.Dispose()

# sidebar 164x314
$pair = New-Canvas -w 164 -h 314
$bmp = $pair[0]; $g = $pair[1]

for ($i = 3; $i -ge 1; $i--) {
  $alpha = 7 + (3 - $i) * 5
  $size = 70 + $i * 40
  $glow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
  $g.FillEllipse($glow, 82 - $size / 2, 90 - $size / 2, $size, $size)
  $glow.Dispose()
}

Draw-Logo $g 46 54 72 18

$font = New-Object System.Drawing.Font('Microsoft YaHei UI', 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$g.DrawString($brand, $font, $white, (New-Object System.Drawing.RectangleF(0, 152, 164, 26)), $fmt)
$font.Dispose()

$fontSub = New-Object System.Drawing.Font('Segoe UI', 7, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$dim = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(113, 113, 122))
$g.DrawString('M A O   M U S I C', $fontSub, $dim, (New-Object System.Drawing.RectangleF(0, 182, 164, 12)), $fmt)
$g.DrawString('v' + $Version, $fontSub, $dim, (New-Object System.Drawing.RectangleF(0, 198, 164, 12)), $fmt)
$fontSub.Dispose()

$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(34, 255, 255, 255), 1)
$g.DrawLine($pen, 52, 226, 112, 226)
$pen.Dispose()

$bar = New-RoundPath 64 248 36 2 1
$barBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle(64, 247, 36, 4)),
  [System.Drawing.Color]::FromArgb(251, 146, 60),
  [System.Drawing.Color]::FromArgb(234, 88, 12),
  0.0
)
$g.FillPath($barBrush, $bar)
$barBrush.Dispose(); $bar.Dispose()

$bmp.Save((Join-Path $outDir 'installerSidebar.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)
$white.Dispose(); $dim.Dispose(); $g.Dispose(); $bmp.Dispose()

Copy-Item (Join-Path $outDir 'installerSidebar.bmp') (Join-Path $outDir 'uninstallerSidebar.bmp') -Force
$logoImg.Dispose()

Get-ChildItem $outDir -Filter *.bmp | ForEach-Object { $_.Name + ' ' + [math]::Round($_.Length / 1KB, 1) + ' KB' }
