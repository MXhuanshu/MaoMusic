// 颜色数学：RGB/HSL 互转、WCAG 亮度与对比度、以及「保持色相、沿明度轴推到对比度下限」的求解器。
// 移植自 Folia src/utils/themeColorMath.ts，只把 parseColorChannels 换成自带解析（原实现依赖视觉化模块）。

export interface Rgb { r: number; g: number; b: number }
export interface Hsl { h: number; s: number; l: number }

const FALLBACK_THEME_COLOR = '#4f7cff'

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

export const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360

/** 解析 #rgb / #rrggbb / rgb() / rgba()，失败返回 null。 */
export const parseColorChannels = (value: string): Rgb | null => {
  if (typeof value !== 'string') return null
  const input = value.trim().toLowerCase()

  if (input.startsWith('#')) {
    let hex = input.slice(1)
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
    if (hex.length !== 6 || /[^0-9a-f]/.test(hex)) return null
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
  }

  const match = /^rgba?\(([^)]+)\)$/.exec(input)
  if (!match) return null
  const parts = match[1].split(/[,/\s]+/).filter(Boolean)
  if (parts.length < 3) return null
  const channels = parts.slice(0, 3).map(part => (
    part.endsWith('%') ? parseFloat(part) / 100 * 255 : parseFloat(part)
  ))
  if (channels.some(channel => Number.isNaN(channel))) return null
  return { r: channels[0], g: channels[1], b: channels[2] }
}

export const parseThemeColor = (value: string): Rgb | null => {
  const channels = parseColorChannels(value)
  return channels ? { r: clampChannel(channels.r), g: clampChannel(channels.g), b: clampChannel(channels.b) } : null
}

export const rgbToHex = ({ r, g, b }: Rgb) => (
  `#${[r, g, b].map(channel => clampChannel(channel).toString(16).padStart(2, '0')).join('')}`
)

export const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const red = clampChannel(r) / 255
  const green = clampChannel(g) / 255
  const blue = clampChannel(b) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2

  if (delta === 0) return { h: 0, s: 0, l: lightness }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))

  let hue: number
  if (max === red) {
    hue = ((green - blue) / delta) % 6
  } else if (max === green) {
    hue = (blue - red) / delta + 2
  } else {
    hue = (red - green) / delta + 4
  }

  return { h: normalizeHue(hue * 60), s: clamp01(saturation), l: clamp01(lightness) }
}

export const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const hue = normalizeHue(h)
  const saturation = clamp01(s)
  const lightness = clamp01(l)

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const offset = lightness - chroma / 2

  const sector = Math.floor(hue / 60) % 6
  const [r, g, b] = sector === 0 ? [chroma, secondary, 0]
    : sector === 1 ? [secondary, chroma, 0]
      : sector === 2 ? [0, chroma, secondary]
        : sector === 3 ? [0, secondary, chroma]
          : sector === 4 ? [secondary, 0, chroma]
            : [chroma, 0, secondary]

  return {
    r: clampChannel((r + offset) * 255),
    g: clampChannel((g + offset) * 255),
    b: clampChannel((b + offset) * 255),
  }
}

export const hexToHsl = (color: string): Hsl | null => {
  const parsed = parseThemeColor(color)
  return parsed ? rgbToHsl(parsed) : null
}

export const hslToHex = (hsl: Hsl) => rgbToHex(hslToRgb(hsl))

/** 十六进制空间里的线性混合，主题色字段只接受 hex。 */
export const mixHexColors = (from: string, to: string, amount: number) => {
  const start = parseThemeColor(from)
  const end = parseThemeColor(to)

  if (!start || !end) {
    const fallback = parseThemeColor(to) ?? parseThemeColor(from) ?? parseThemeColor(FALLBACK_THEME_COLOR)!
    return rgbToHex(fallback)
  }

  const ratio = clamp01(amount)
  return rgbToHex({
    r: start.r + (end.r - start.r) * ratio,
    g: start.g + (end.g - start.g) * ratio,
    b: start.b + (end.b - start.b) * ratio,
  })
}

export const getRelativeLuminance = (color: string) => {
  const parsed = parseThemeColor(color)
  if (!parsed) return 0

  const transform = (channel: number) => {
    const normalized = channel / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }

  return 0.2126 * transform(parsed.r) + 0.7152 * transform(parsed.g) + 0.0722 * transform(parsed.b)
}

export const getContrastRatio = (foreground: string, background: string) => {
  const luminanceA = getRelativeLuminance(foreground)
  const luminanceB = getRelativeLuminance(background)
  const [lighter, darker] = luminanceA > luminanceB
    ? [luminanceA, luminanceB]
    : [luminanceB, luminanceA]

  return (lighter + 0.05) / (darker + 0.05)
}

export const getHueDistance = (a: number, b: number) => {
  const distance = Math.abs(normalizeHue(a) - normalizeHue(b))
  return Math.min(distance, 360 - distance)
}

/**
 * 保持色相与饱和度，把颜色沿明度轴推离背景，直到满足对比度下限。
 * 到不了下限时返回对比度最高的候选。
 */
export const adjustLightnessForContrast = (
  color: string,
  background: string,
  minRatio: number,
  step = 0.02,
  maxSteps = 50,
) => {
  const hsl = hexToHsl(color)
  if (!hsl) return color

  const goDarker = getRelativeLuminance(background) > 0.35
  const direction = goDarker ? -1 : 1

  let bestColor = hslToHex(hsl)
  let bestRatio = getContrastRatio(bestColor, background)

  for (let index = 0; index <= maxSteps; index += 1) {
    const lightness = clamp01(hsl.l + direction * step * index)
    const candidate = hslToHex({ ...hsl, l: lightness })
    const ratio = getContrastRatio(candidate, background)

    if (ratio > bestRatio) {
      bestRatio = ratio
      bestColor = candidate
    }

    if (ratio >= minRatio) return candidate

    // 已经顶到明度轴端点，再走也没用
    if (index > 0 && (lightness === 0 || lightness === 1)) break
  }

  return bestColor
}

/** 十六进制色 → `rgb(r, g, b)`，旧主题变量（--color-primary-*）需要这个格式。 */
export const hexToRgbString = (hex: string) => {
  const parsed = parseThemeColor(hex)
  if (!parsed) return 'rgb(0, 0, 0)'
  return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`
}
