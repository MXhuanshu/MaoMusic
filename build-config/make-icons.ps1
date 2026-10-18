# Generates app icons and tray glyphs from a single square logo.
# ASCII only: Windows PowerShell reads BOM-less files as ANSI.

param(
  [Parameter(Mandatory = $true)][string]$Source
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$iconDir = Join-Path $root 'resources\icons'
$trayDir = Join-Path $root 'src\static\images\tray'
New-Item -ItemType Directory -Force -Path $iconDir, $trayDir | Out-Null

$src = [System.Drawing.Image]::FromFile($Source)
$baseSize = [Math]::Min($src.Width, $src.Height)

function New-Scaled([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $size, $size)), 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  return $bmp
}

# ---- app icons ----
foreach ($size in @(16, 24, 32, 48, 64, 128, 256, 512)) {
  $bmp = New-Scaled $size
  $bmp.Save((Join-Path $iconDir "$size`x$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "icon $size"
}

$bmp = New-Scaled 512
$bmp.Save((Join-Path $iconDir 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# ---- tray glyph: white lines on transparent ----
$maskSize = 128
$mask = New-Scaled $maskSize
$alpha = New-Object 'byte[,]' $maskSize, $maskSize
for ($y = 0; $y -lt $maskSize; $y++) {
  for ($x = 0; $x -lt $maskSize; $x++) {
    $c = $mask.GetPixel($x, $y)
    $v = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
    $alpha[$x, $y] = [byte][Math]::Min(255, $v)
  }
}
$mask.Dispose()

function New-Glyph([int]$size, [System.Drawing.Color]$color) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  for ($y = 0; $y -lt $size; $y++) {
    $sy = [int][Math]::Floor($y * $maskSize / $size)
    for ($x = 0; $x -lt $size; $x++) {
      $sx = [int][Math]::Floor($x * $maskSize / $size)
      $a = $alpha[$sx, $sy]
      if ($a -lt 18) { continue }
      $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $color.R, $color.G, $color.B))
    }
  }
  return $bmp
}

$variants = @(
  @{ name = 'tray_origin'; color = [System.Drawing.Color]::White },
  @{ name = 'tray_black'; color = [System.Drawing.Color]::Black },
  @{ name = 'trayTemplate'; color = [System.Drawing.Color]::Black }
)
$scales = @(
  @{ suffix = ''; size = 16 },
  @{ suffix = '@1.25x'; size = 20 },
  @{ suffix = '@1.5x'; size = 24 },
  @{ suffix = '@2x'; size = 32 }
)

foreach ($v in $variants) {
  foreach ($s in $scales) {
    $bmp = New-Glyph $s.size $v.color
    $bmp.Save((Join-Path $trayDir ($v.name + $s.suffix + '.png')), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
  }
  Write-Host ($v.name + ' done')
}

$src.Dispose()
