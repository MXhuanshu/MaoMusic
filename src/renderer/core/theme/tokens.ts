// 把一套 Theme 展开成完整的 CSS 变量表：根表面 + 设置套件表面 + 播放页玻璃层 + 动效词汇。
// 这是 Folia buildAppStyle.ts / kitTheme.ts / panelTheme.ts 三个文件在猫仙里的合并版。

import { getContrastRatio } from './colorMath'
import type { Theme } from './types'

const DARK_SURFACES = {
  '--st-win': '#1a1a1d',
  '--st-side': '#141416',
  '--st-card': '#232327',
  '--st-menu': '#2b2b30',
  '--st-raise': '#45454c',
  '--st-knob': '#ececee',
  '--st-pv': '#151517',
  '--st-ok': '#56c98d',
  '--st-warn': '#e3a949',
  '--st-err': '#ef6f6f',
  '--ui-scrollbar-track': '#18181b',
  '--ui-scrollbar-thumb': '#3f3f46',
  '--ui-scrollbar-thumb-hover': '#52525b',
}

const LIGHT_SURFACES = {
  '--st-win': '#f3f3f4',
  '--st-side': '#e9e9eb',
  '--st-card': '#ffffff',
  '--st-menu': '#ffffff',
  '--st-raise': '#ffffff',
  '--st-knob': '#ffffff',
  '--st-pv': '#ececef',
  '--st-ok': '#1e9a5c',
  '--st-warn': '#b97a10',
  '--st-err': '#d04444',
  '--ui-scrollbar-track': '#e7e5e4',
  '--ui-scrollbar-thumb': '#a8a29e',
  '--ui-scrollbar-thumb-hover': '#78716c',
}

/** 画在强调色上的前景色：从底色与正文色里挑与强调色对比度更高的那个。 */
export const resolveTextOnAccent = (
  accentColor: string,
  backgroundColor: string,
  primaryColor: string,
): string => (
  getContrastRatio(primaryColor, accentColor) > getContrastRatio(backgroundColor, accentColor)
    ? primaryColor
    : backgroundColor
)

export const buildUiTokens = (theme: Theme, isDaylight: boolean): Record<string, string> => {
  const surfaces = isDaylight ? LIGHT_SURFACES : DARK_SURFACES
  const fg = theme.primaryColor

  return {
    '--ui-bg': theme.backgroundColor,
    '--ui-fg': fg,
    '--ui-fg-2': theme.secondaryColor,
    '--ui-accent': theme.accentColor,
    '--ui-on-accent': resolveTextOnAccent(theme.accentColor, theme.backgroundColor, fg),

    ...surfaces,

    // 文字与描边阶：全部从正文色混合出来，换主题时自动跟着走
    '--st-t1': fg,
    '--st-t2': `color-mix(in srgb, ${fg} 62%, transparent)`,
    '--st-t3': `color-mix(in srgb, ${fg} 42%, transparent)`,
    '--st-line': `color-mix(in srgb, ${fg} 8%, transparent)`,
    '--st-line2': `color-mix(in srgb, ${fg} 16%, transparent)`,
    '--st-fill': `color-mix(in srgb, ${fg} 7%, transparent)`,
    '--st-fill2': `color-mix(in srgb, ${fg} 12%, transparent)`,
    '--st-track': `color-mix(in srgb, ${fg} 17%, transparent)`,

    // 播放页悬浮面板：Folia 用的是固定灰玻璃，这里改成跟随主题底色，
    // 否则封面取色后玻璃会和背景脱节。
    '--pn-glass': `color-mix(in srgb, ${theme.backgroundColor} 82%, transparent)`,
    '--pn-shadow': isDaylight
      ? '0 30px 80px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(0, 0, 0, 0.06)'
      : '0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.09)',
    '--pn-like': isDaylight ? '#e0354f' : '#f2607a',

    // 动效词汇。降级模式下由 applyTheme 把时长改成 0s。
    '--st-dur-fast': '0.12s',
    '--st-dur-move': '0.22s',
    '--st-dur-unfold': '0.3s',
    '--st-dur-show': '0.48s',
    '--st-ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
    '--st-ease-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--st-ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
  }
}

/** 关闭动效时把时长全部归零（Folia 的 reduce-motion 语义）。 */
export const withReducedMotion = (tokens: Record<string, string>): Record<string, string> => ({
  ...tokens,
  '--st-dur-fast': '0s',
  '--st-dur-move': '0s',
  '--st-dur-unfold': '0s',
  '--st-dur-show': '0s',
})
