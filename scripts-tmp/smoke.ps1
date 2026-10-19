$ErrorActionPreference = 'Continue'
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
$env:ELECTRON_ENABLE_LOGGING = '1'

$root = 'D:\MaoMusic'
$electron = Join-Path $root 'node_modules\electron\dist\electron.exe'
$out = Join-Path $PSScriptRoot 'smoke.log'
$err = Join-Path $PSScriptRoot 'smoke.err'
Remove-Item $out,$err -Force -ErrorAction SilentlyContinue

$p = Start-Process -FilePath $electron -ArgumentList '.' -WorkingDirectory $root `
     -RedirectStandardOutput $out -RedirectStandardError $err -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 28

$running = -not $p.HasExited
"running = $running"
if ($running) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }

"--- stdout ---"
if (Test-Path $out) { Get-Content $out -Tail 20 }
"--- stderr ---"
if (Test-Path $err) { Get-Content $err -Tail 25 }
