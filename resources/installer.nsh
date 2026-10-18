; ============================================================================
;  猫仙音乐 · NSIS 安装界面定制
;
;  这个文件由 electron-builder 在 installer.nsi 之前 include，
;  因此这里定义的 MUI_* 常量会覆盖 MUI2 的默认值。
;  electron-builder 自己也 define 了其中一部分（例如配置了 installerHeader 就会定义
;  MUI_HEADERIMAGE），重复 define 在 NSIS 里是错误，所以统一用 !ifndef 保护。
;
;  视觉基调与主界面一致：近黑玻璃底、半透明白描边、封面取色的橙色强调。
;  安装包只有一个语言（2052 简体中文），所以文案直接写中文，不做多语言分支。
; ============================================================================

!ifndef MUI_BGCOLOR
  !define MUI_BGCOLOR "101014"
!endif
!ifndef MUI_TEXTCOLOR
  !define MUI_TEXTCOLOR "F4F4F5"
!endif
!ifndef MUI_ABORTWARNING
  !define MUI_ABORTWARNING
!endif
!ifndef MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE
!endif
!ifndef MUI_HEADERIMAGE_RIGHT
  !define MUI_HEADERIMAGE_RIGHT
!endif

; ---- 欢迎页 ----
!ifndef MUI_WELCOMEPAGE_TITLE
  !define MUI_WELCOMEPAGE_TITLE "猫仙音乐"
!endif
!ifndef MUI_WELCOMEPAGE_TITLE_3LINES
  !define MUI_WELCOMEPAGE_TITLE_3LINES
!endif
!ifndef MUI_WELCOMEPAGE_TEXT
  !define MUI_WELCOMEPAGE_TEXT "把喜欢的歌，放进一片会呼吸的夜色里。$\r$\n$\r$\n这个向导会把猫仙音乐安装到你的电脑上。界面与播放详情页会跟随当前封面自动取色，亮暗随系统切换。$\r$\n$\r$\n点击「下一步」继续。"
!endif

; ---- 完成页 ----
!ifndef MUI_FINISHPAGE_TITLE
  !define MUI_FINISHPAGE_TITLE "安装完成"
!endif
!ifndef MUI_FINISHPAGE_TITLE_3LINES
  !define MUI_FINISHPAGE_TITLE_3LINES
!endif
!ifndef MUI_FINISHPAGE_TEXT
  !define MUI_FINISHPAGE_TEXT "猫仙音乐已经装好了。$\r$\n$\r$\n启动后可以在「设置 → 播放详情」里把视觉风格切到「完整」，体验 3D 歌词走廊与星野背景。"
!endif
!ifndef MUI_FINISHPAGE_RUN_TEXT
  !define MUI_FINISHPAGE_RUN_TEXT "立即启动猫仙音乐"
!endif

; 欢迎页（MUI 默认不插这一页，这里补上）
!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
!macroend

; 跳过系统风格的「安装模式」页，默认按当前用户安装，免 UAC
!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend

; 完成页：保留「立即运行」，但用我们自己的启动函数
!macro customFinishPage
  Function StartApp
    ${if} ${isUpdated}
      StrCpy $1 "--updated"
    ${else}
      StrCpy $1 ""
    ${endif}
    ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
  FunctionEnd

  !ifndef MUI_FINISHPAGE_RUN
    !define MUI_FINISHPAGE_RUN
  !endif
  !ifndef MUI_FINISHPAGE_RUN_FUNCTION
    !define MUI_FINISHPAGE_RUN_FUNCTION "StartApp"
  !endif
  !insertmacro MUI_PAGE_FINISH
!macroend

; 窗口标题与底部品牌行
!macro customHeader
  Name "猫仙音乐"
  BrandingText "猫仙音乐 · MAO MUSIC"
!macroend

; 卸载器欢迎页文案
!ifndef MUI_UNWELCOMEPAGE_TITLE
  !define MUI_UNWELCOMEPAGE_TITLE "卸载猫仙音乐"
!endif
!ifndef MUI_UNWELCOMEPAGE_TITLE_3LINES
  !define MUI_UNWELCOMEPAGE_TITLE_3LINES
!endif
!ifndef MUI_UNWELCOMEPAGE_TEXT
  !define MUI_UNWELCOMEPAGE_TEXT "这个向导会把猫仙音乐从你的电脑上移除。$\r$\n$\r$\n歌单、设置与缓存会保留在用户目录里，方便你下次重装后继续使用。"
!endif
!ifndef MUI_UNCONFIRMPAGE_TEXT_TOP
  !define MUI_UNCONFIRMPAGE_TEXT_TOP "即将卸载猫仙音乐。"
!endif
