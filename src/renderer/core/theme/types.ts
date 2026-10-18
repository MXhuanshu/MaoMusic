// 主题的数据契约。刻意保持最小：只要四个颜色，其余表面（--st-* / --pn-*）都由它们推导。

export interface Theme {
  name: string
  description: string
  backgroundColor: string
  primaryColor: string
  accentColor: string
  secondaryColor: string
}

export interface DualTheme {
  light: Theme
  dark: Theme
}

/** 明暗模式：跟随系统 / 强制亮 / 强制暗。 */
export type ThemeModePreference = 'system' | 'light' | 'dark'

/** 主题来源：跟随封面取色 / 静态主题。 */
export type ThemeSource = 'cover' | 'static'
