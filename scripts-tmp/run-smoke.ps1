$ErrorActionPreference = 'Continue'
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
$env:ELECTRON_ENABLE_LOGGING = '1'

$dir = 'D:\MaoMusic\build\win-unpacked'
$exe = Get-ChildItem -Path $dir -Filter '*.exe' |
       Where-Object { $_.Name -notmatch 'uninstall|elevate' } |
       Select-Object -First 1

$out = Join-Path $PSScriptRoot 'app-run.log'
$err = Join-Path $PSScriptRoot 'app-run.err'
Remove-Item $out,$err -Force -ErrorAction SilentlyContinue

$p = Start-Process -FilePath $exe.FullName -WorkingDirectory $dir `
     -RedirectStandardOutput $out -RedirectStandardError $err `
     -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 20

$running = -not $p.HasExited
"running = $running"
if ($running) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }

"--- stdout ---"
if (Test-Path $out) { (Get-Content $out -Tail 80) -join "`n" }
"--- stderr ---"
if (Test-Path $err) { (Get-Content $err -Tail 80) -join "`n" }
