// 从封面色相 + 和声方案算出明暗双主题。每个文字色都沿明度轴被推到对比度下限之上，
// 因此保留色相而不是塌成写死的近白/近黑。
// 移植自 Folia src/utils/builtinTheme/generateBuiltinDualTheme.ts，
// 主题名改用本地化的简化命名（原实现的名称/描述词库对本项目没有价值）。

import {
  adjustLightnessForContrast,
  clamp01,
  getContrastRatio,
  getHueDistance,
  hslToHex,
  normalizeHue,
} from './colorMath'
import { analyzeCoverPalette, type CoverPalette, type PaletteTone } from './coverPalette'
import {
  ACCENT_MIN_CONTRAST,
  ACCENT_RANGES,
  BACKGROUND_TONES,
  MIN_BACKGROUND_SATURATION,
  PRIMARY_MIN_CONTRAST,
  PRIMARY_RANGES,
  SECONDARY_MIN_CONTRAST,
  SECONDARY_RANGES,
  type Range,
  type ThemeMode,
} from './themeRanges'
import type { DualTheme, Theme } from './types'

const between = (random: () => number, [min, max]: Range) => min + random() * (max - min)

/** 沿较短弧插值，避免主色/点缀色对穿到对侧色相。 */
const lerpHue = (from: number, to: number, amount: number) => {
  const delta = ((to - from + 540) % 360) - 180
  return normalizeHue(from + delta * amount)
}

const TONE_LABEL: Record<PaletteTone, string> = {
  ink: '墨',
  tinted: '染',
  rich: '浓',
}

const MODE_LABEL: Record<ThemeMode, string> = {
  light: '日光',
  dark: '夜',
}

const HUE_LABEL = (hue: number) => {
  if (hue < 15 || hue >= 345) return '绯'
  if (hue < 45) return '橙'
  if (hue < 70) return '缃'
  if (hue < 160) return '青'
  if (hue < 200) return '天'
  if (hue < 260) return '黛'
  if (hue < 300) return '紫'
  return '绛'
}

const buildBackgroundColor = (mode: ThemeMode, palette: CoverPalette, random: () => number) => {
  const tone = BACKGROUND_TONES[palette.tone]
  const lightnessRange = mode === 'dark' ? tone.darkLightness : tone.lightLightness
  const saturationRange = mode === 'dark' ? tone.darkSaturation : tone.lightSaturation
  // 洗淡的封面不该强迫出洗淡的地面，但确实应该更安静一些
  const coverWeight = 0.55 + 0.45 * clamp01(palette.baseSaturation / 0.7)

  return hslToHex({
    h: palette.baseHue,
    s: Math.max(MIN_BACKGROUND_SATURATION, between(random, saturationRange) * coverWeight),
    l: between(random, lightnessRange),
  })
}

const buildAccentColor = (
  mode: ThemeMode,
  palette: CoverPalette,
  backgroundColor: string,
  primaryColor: string,
  random: () => number,
) => {
  const ranges = ACCENT_RANGES[mode]
  const saturation = between(random, ranges.saturation)
  const lightness = between(random, ranges.lightness)
  const accent = adjustLightnessForContrast(
    hslToHex({ h: palette.accentHue, s: saturation, l: lightness }),
    backgroundColor,
    ACCENT_MIN_CONTRAST,
  )

  // 单色/类似色方案的点缀色可能压到正文色上，转开
  const collidesWithPrimary = getHueDistance(palette.accentHue, palette.baseHue) < 15
    && getContrastRatio(accent, primaryColor) < 1.3

  if (!collidesWithPrimary) return accent

  return adjustLightnessForContrast(
    hslToHex({ h: normalizeHue(palette.accentHue + 40), s: saturation, l: lightness }),
    backgroundColor,
    ACCENT_MIN_CONTRAST,
  )
}

const buildModeTheme = (
  mode: ThemeMode,
  palette: CoverPalette,
  random: () => number,
): Theme => {
  const backgroundColor = buildBackgroundColor(mode, palette, random)

  const primaryRanges = PRIMARY_RANGES[mode]
  const primaryColor = adjustLightnessForContrast(
    hslToHex({
      h: palette.baseHue,
      s: between(random, primaryRanges.saturation),
      l: between(random, primaryRanges.lightness),
    }),
    backgroundColor,
    PRIMARY_MIN_CONTRAST,
  )

  const accentColor = buildAccentColor(mode, palette, backgroundColor, primaryColor, random)

  const secondaryRanges = SECONDARY_RANGES[mode]
  const secondaryColor = adjustLightnessForContrast(
    hslToHex({
      h: lerpHue(palette.baseHue, palette.accentHue, 0.2 + random() * 0.4),
      s: between(random, secondaryRanges.saturation),
      l: between(random, secondaryRanges.lightness),
    }),
    backgroundColor,
    SECONDARY_MIN_CONTRAST,
  )

  return {
    name: `${MODE_LABEL[mode]}${TONE_LABEL[palette.tone]}${HUE_LABEL(palette.baseHue)}`,
    description: `封面取色 · ${palette.scheme}`,
    backgroundColor,
    primaryColor,
    accentColor,
    secondaryColor,
  }
}

export const generateBuiltinDualTheme = ({
  coverColors = [],
  random = Math.random,
}: {
  coverColors?: string[]
  random?: () => number
} = {}): DualTheme => {
  const palette = analyzeCoverPalette(coverColors, random)

  return {
    light: buildModeTheme('light', palette, random),
    dark: buildModeTheme('dark', palette, random),
  }
}

/**
 * 用字符串生成确定性伪随机数，保证同一张封面永远得到同一套主题。
 * 用 FNV-1a，够短也够散。
 */
export const createSeededRandom = (seed: string): () => number => {
  let hash = 0x811c9dc5
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  let state = hash >>> 0

  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0x100000000
  }
}
