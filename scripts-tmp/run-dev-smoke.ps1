$ErrorActionPreference = 'Continue'
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
$env:ELECTRON_ENABLE_LOGGING = '1'

$root = 'D:\MaoMusic'
$electron = Join-Path $root 'node_modules\electron\dist\electron.exe'
$out = Join-Path $PSScriptRoot 'dev-run.log'
$err = Join-Path $PSScriptRoot 'dev-run.err'
Remove-Item $out,$err -Force -ErrorAction SilentlyContinue

$p = Start-Process -FilePath $electron -ArgumentList '.' -WorkingDirectory $root `
     -RedirectStandardOutput $out -RedirectStandardError $err `
     -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 30

$running = -not $p.HasExited
"running = $running"
if ($running) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }

"--- stderr full ---"
if (Test-Path $err) { Get-Content $err } else { "(none)" }
