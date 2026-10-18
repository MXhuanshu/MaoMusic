// 设置套件 / 播放页面板的表面令牌。
// 对应 Folia 的 modal/settings/kit/kitTheme.ts 与 panelTab/shell/panelTheme.ts，
// 但返回普通对象，Vue 里直接 `:style="settingsTokens(...)"` 即可。
//
// 全局主题已经把这些变量写在 :root 上，所以大多数组件不需要调用它；
// 只有「要在别处独立成窗」的场合（例如弹出的 Sheet 挂到 body 下）才需要自己带一套。

import { getContrastRatio } from '@renderer/core/theme/colorMath'
import type { Theme } from '@renderer/core/theme/types'

const ON_ACCENT_DARK = '#17171a'
const ON_ACCENT_LIGHT = '#ffffff'

/** 画在强调色上的文字：深色与白色里挑对比度更高的那个。 */
export const onAccentColor = (accent: string) => (
  getContrastRatio(ON_ACCENT_DARK, accent) >= getContrastRatio(ON_ACCENT_LIGHT, accent)
    ? ON_ACCENT_DARK
    : ON_ACCENT_LIGHT
)

/** 封面占位色：没有封面时画卡片用的色块。 */
export const SAMPLE_COVERS = [
  '#6d5a8c', '#3f6f7a', '#a8664b', '#56745a',
  '#8a4f5d', '#4d5f8f', '#8c7a45', '#5d5d66',
] as const

export const settingsTokens = (
  isDaylight: boolean,
  theme?: Theme,
): Record<string, string> => {
  const accent = theme?.accentColor || (isDaylight ? '#18181b' : '#f4f4f5')

  return {
    '--st-win': isDaylight ? '#f3f3f4' : '#1a1a1d',
    '--st-side': isDaylight ? '#e9e9eb' : '#141416',
    '--st-card': isDaylight ? '#ffffff' : '#232327',
    '--st-menu': isDaylight ? '#ffffff' : '#2b2b30',
    '--st-raise': isDaylight ? '#ffffff' : '#45454c',
    '--st-knob': isDaylight ? '#ffffff' : '#ececee',
    '--st-pv': isDaylight ? '#ececef' : '#151517',
    '--st-ok': isDaylight ? '#1e9a5c' : '#56c98d',
    '--st-warn': isDaylight ? '#b97a10' : '#e3a949',
    '--st-err': isDaylight ? '#d04444' : '#ef6f6f',
    '--st-t1': 'var(--ui-fg)',
    '--st-t2': 'color-mix(in srgb, var(--ui-fg) 62%, transparent)',
    '--st-t3': 'color-mix(in srgb, var(--ui-fg) 42%, transparent)',
    '--st-line': 'color-mix(in srgb, var(--ui-fg) 8%, transparent)',
    '--st-line2': 'color-mix(in srgb, var(--ui-fg) 16%, transparent)',
    '--st-fill': 'color-mix(in srgb, var(--ui-fg) 7%, transparent)',
    '--st-fill2': 'color-mix(in srgb, var(--ui-fg) 12%, transparent)',
    '--st-track': 'color-mix(in srgb, var(--ui-fg) 17%, transparent)',
    '--st-accent': accent,
    '--st-on-accent': onAccentColor(accent),
  }
}

export const panelTokens = (
  isDaylight: boolean,
  theme: Theme,
  reduced = false,
): Record<string, string> => ({
  '--ui-fg': theme.primaryColor,
  ...settingsTokens(isDaylight, theme),
  // 玻璃面板底下是播放页的视觉层，暗色下用白色薄纱当「抬起」，
  // 固定的中灰在亮页面上会显得比底还暗
  ...(isDaylight ? {} : { '--st-raise': 'rgba(255, 255, 255, 0.18)' }),
  '--pn-glass': `color-mix(in srgb, ${theme.backgroundColor} 82%, transparent)`,
  '--pn-shadow': isDaylight
    ? '0 30px 80px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(0, 0, 0, 0.06)'
    : '0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.09)',
  '--pn-like': isDaylight ? '#e0354f' : '#f2607a',
  '--st-dur-fast': reduced ? '0s' : '0.12s',
  '--st-dur-move': reduced ? '0s' : '0.22s',
  '--st-dur-unfold': reduced ? '0s' : '0.3s',
  '--st-dur-show': reduced ? '0s' : '0.48s',
})
