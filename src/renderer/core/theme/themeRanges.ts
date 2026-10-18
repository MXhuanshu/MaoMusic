// 内置主题的数值设计空间：背景有多深/多带色，以及每个角色在跑对比度求解前的饱和度与明度区间。
// 移植自 Folia src/utils/builtinTheme/themeColorRanges.ts。

export type ThemeMode = 'light' | 'dark'
export type Range = [number, number]

export interface BackgroundTone {
  darkLightness: Range
  darkSaturation: Range
  lightLightness: Range
  lightSaturation: Range
}

export const PRIMARY_MIN_CONTRAST = 9
export const ACCENT_MIN_CONTRAST = 3.2
export const SECONDARY_MIN_CONTRAST = 4.5
export const MIN_BACKGROUND_SATURATION = 0.04

/** 背景性格：从近中性的墨色到完全带色的地面。 */
export const BACKGROUND_TONES: Record<'ink' | 'tinted' | 'rich', BackgroundTone> = {
  ink: {
    darkLightness: [0.055, 0.085],
    darkSaturation: [0.10, 0.22],
    lightLightness: [0.940, 0.965],
    lightSaturation: [0.05, 0.12],
  },
  tinted: {
    darkLightness: [0.075, 0.110],
    darkSaturation: [0.20, 0.36],
    lightLightness: [0.920, 0.950],
    lightSaturation: [0.10, 0.20],
  },
  rich: {
    darkLightness: [0.095, 0.140],
    darkSaturation: [0.32, 0.50],
    lightLightness: [0.900, 0.935],
    lightSaturation: [0.18, 0.30],
  },
}

export const PRIMARY_RANGES: Record<ThemeMode, { saturation: Range; lightness: Range }> = {
  light: { saturation: [0.15, 0.40], lightness: [0.10, 0.20] },
  dark: { saturation: [0.10, 0.30], lightness: [0.90, 0.96] },
}

export const ACCENT_RANGES: Record<ThemeMode, { saturation: Range; lightness: Range }> = {
  light: { saturation: [0.55, 0.88], lightness: [0.38, 0.55] },
  dark: { saturation: [0.55, 0.92], lightness: [0.55, 0.72] },
}

export const SECONDARY_RANGES: Record<ThemeMode, { saturation: Range; lightness: Range }> = {
  light: { saturation: [0.15, 0.45], lightness: [0.32, 0.46] },
  dark: { saturation: [0.15, 0.45], lightness: [0.62, 0.76] },
}
