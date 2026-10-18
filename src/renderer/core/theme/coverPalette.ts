// 读取封面取出的色板，决定一套内置主题的颜色骨架：哪个色相主导、哪个色相点缀、
// 背景该多深多带色。移植自 Folia src/utils/builtinTheme/coverPaletteAnalysis.ts。

import { getHueDistance, hexToHsl, normalizeHue, type Hsl } from './colorMath'

export type HarmonyScheme = 'analogous' | 'complementary' | 'split' | 'triadic' | 'duotone' | 'monochrome'
export type PaletteTone = 'ink' | 'tinted' | 'rich'

export interface CoverPalette {
  baseHue: number
  baseSaturation: number
  baseLightness: number
  accentHue: number
  scheme: HarmonyScheme
  tone: PaletteTone
}

const MIN_SUPPORT_SATURATION = 0.15
const MIN_SUPPORT_HUE_DISTANCE = 25
const MAX_SUPPORT_HUE_DISTANCE = 160
const MONOCHROME_SATURATION_CEILING = 0.18

/** 偏爱既有饱和度又处在中间明度的颜色：它们承载封面身份，近黑/近白只是在描述背景。 */
const getCoverColorScore = ({ s, l }: Hsl) => s * Math.max(0, 1 - Math.abs(l - 0.5) * 1.2)

const pickWeighted = <T>(random: () => number, entries: { value: T; weight: number }[]): T => {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0)
  let cursor = random() * total

  for (const entry of entries) {
    cursor -= entry.weight
    if (cursor <= 0) return entry.value
  }

  return entries[entries.length - 1].value
}

const pickBaseColor = (parsedColors: Hsl[], random: () => number): Hsl => {
  if (parsedColors.length === 0) {
    // 没有封面可读：直接抽一个色相，让无封面歌曲每次也不一样
    return { h: random() * 360, s: 0.35 + random() * 0.3, l: 0.5 }
  }

  const scored = parsedColors.reduce((best, candidate) => (
    getCoverColorScore(candidate) > getCoverColorScore(best) ? candidate : best
  ), parsedColors[0])

  return getCoverColorScore(scored) > 0.02 ? scored : parsedColors[0]
}

const pickSupportHue = (parsedColors: Hsl[], base: Hsl) => {
  const support = parsedColors.find(candidate => {
    if (candidate.s < MIN_SUPPORT_SATURATION) return false
    const distance = getHueDistance(candidate.h, base.h)
    return distance >= MIN_SUPPORT_HUE_DISTANCE && distance <= MAX_SUPPORT_HUE_DISTANCE
  })

  return support ? support.h : null
}

const pickScheme = (
  baseSaturation: number,
  supportHue: number | null,
  random: () => number,
): HarmonyScheme => {
  // 封面上真实存在的第二个色相，是最「来自这张画」的点缀色
  if (supportHue !== null && random() < 0.65) return 'duotone'

  return pickWeighted<HarmonyScheme>(random, [
    { value: 'analogous', weight: 3 },
    { value: 'complementary', weight: 2 },
    { value: 'split', weight: 2 },
    { value: 'triadic', weight: 1.5 },
    { value: 'monochrome', weight: baseSaturation < MONOCHROME_SATURATION_CEILING ? 2.5 : 0 },
  ])
}

const resolveAccentHue = (
  scheme: HarmonyScheme,
  baseHue: number,
  supportHue: number | null,
  random: () => number,
) => {
  const sign = random() < 0.5 ? -1 : 1

  switch (scheme) {
    case 'duotone':
      return supportHue ?? baseHue
    case 'analogous':
      return baseHue + sign * (20 + random() * 15)
    case 'complementary':
      return baseHue + 150 + random() * 30
    case 'split':
      return baseHue + (sign < 0 ? 150 : 210)
    case 'triadic':
      return baseHue + sign * 120
    case 'monochrome':
    default:
      return baseHue
  }
}

/** 把封面原始色块转成内置主题生成器依赖的「色相/色调」契约。 */
export const analyzeCoverPalette = (coverColors: string[], random: () => number): CoverPalette => {
  const parsedColors = coverColors
    .map(color => hexToHsl(color))
    .filter((color): color is Hsl => color !== null)

  const base = pickBaseColor(parsedColors, random)
  const supportHue = pickSupportHue(parsedColors, base)
  const scheme = pickScheme(base.s, supportHue, random)
  const accentJitter = scheme === 'monochrome' ? 0 : (random() - 0.5) * 16

  return {
    baseHue: normalizeHue(base.h),
    baseSaturation: base.s,
    baseLightness: base.l,
    accentHue: normalizeHue(resolveAccentHue(scheme, base.h, supportHue, random) + accentJitter),
    scheme,
    tone: pickWeighted<PaletteTone>(random, [
      { value: 'ink', weight: 3 },
      { value: 'tinted', weight: 4 },
      { value: 'rich', weight: 2.5 },
    ]),
  }
}
