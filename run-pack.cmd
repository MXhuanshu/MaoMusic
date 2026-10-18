@echo off
set PATH=C:\Users\32562\.workbuddy-ai\binaries\node\versions\22.22.2-6;%PATH%
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
set ELECTRON_BUILDER_NSIS_DIR=D:\NSIS
node build-config\pack.js > pack.log 2>&1
node build-config\build-pack.js target=win arch=x64 type=setup > nsis-build.log 2>&1
