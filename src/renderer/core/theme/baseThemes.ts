// 兜底主题：没有封面、或取色失败时用它。数值与 Folia 默认主题一致，
// 这样「没封面」和「Folia 原生界面」看起来是同一套视觉。

import type { DualTheme, Theme } from './types'

/** 午夜墨染 */
export const DEFAULT_THEME: Theme = {
  name: '午夜墨染',
  description: '近中性的深墨地面，白色正文与强调',
  backgroundColor: '#09090b',
  primaryColor: '#f4f4f5',
  accentColor: '#f4f4f5',
  secondaryColor: '#71717a',
}

/** 日光素白 */
export const DAYLIGHT_THEME: Theme = {
  name: '日光素白',
  description: '珍珠白地面，墨色正文与橙色强调',
  backgroundColor: '#f5f5f4',
  primaryColor: '#1c1917',
  accentColor: '#ea580c',
  secondaryColor: '#44403c',
}

export const BASE_DUAL_THEME: DualTheme = {
  light: DAYLIGHT_THEME,
  dark: DEFAULT_THEME,
}
