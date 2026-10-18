// 旧主题体系那 232 个 --color-primary-* / --color-000..1000 的生成逻辑。
//
// 原本在 src/common/theme/utils.js（CommonJS，主进程与渲染进程共用）。
// 迁移到令牌层后只剩渲染进程的过渡桥需要它，于是搬到这里并改成 TS，
// 让 src/common/theme 只保留 colorUtils（歌词窗）与 index.json（主进程首帧兜底）。
// 过渡期结束、旧组件全部重写后可整体删除。

/** 线性明暗：p ∈ [-1, 1]，负值压暗、正值提亮。 */
export const linearShade = (p: number, color: string): string => {
  const [a, b, c, d] = color.split(',')
  const negative = p < 0
  const target = negative ? 0 : 255 * p
  const factor = negative ? 1 + p : 1 - p
  const red = Math.round(parseInt(a[3] === 'a' ? a.slice(5) : a.slice(4)) * factor + target)
  const green = Math.round(parseInt(b) * factor + target)
  const blue = Math.round(parseInt(c) * factor + target)
  return `rgb${d ? 'a(' : '('}${red},${green},${blue}${d ? `,${d}` : ')'}`
}

/** 调整透明度：p ∈ [0, 1] 表示叠加的不透明度。 */
export const alphaShade = (p: number, color: string): string => {
  const [rawR, rawG, rawB, rawA] = color.split(',')
  const r = rawR[3] === 'a' ? rawR.slice(5) : rawR.slice(4)
  let alpha: number
  if (rawA) {
    const current = parseFloat(rawA)
    alpha = p < 0
      ? Math.max(0, current - (1 - current) * p)
      : Math.min(1, current - current * p)
  } else {
    alpha = Math.min(1, 1 - p)
  }
  return `rgba(${parseInt(r)}, ${parseInt(rawG)}, ${parseInt(rawB)}, ${alpha.toFixed(2)})`
}

const fontColors = (rgbaColor: string | null | undefined, isDark: boolean, isDarkFont: boolean): Record<string, string> => {
  const base = rgbaColor ?? (isDark ? 'rgb(229, 229, 229)' : 'rgb(33, 33, 33)')
  const colors: Record<string, string> = { '--color-1000': base }

  if (isDark) {
    const step = isDarkFont ? -0.015 : -0.05
    let previous = base
    for (let i = 1; i < 21; i++) {
      previous = linearShade(step, previous)
      colors[`--color-${String(1000 - 50 * i).padStart(3, '0')}`] = previous
    }
    return colors
  }

  const step = (isDarkFont ? 0.02 : 0.05)
  for (let i = 1; i < 21; i++) {
    colors[`--color-${String(1000 - 50 * i).padStart(3, '0')}`] = linearShade(step * i, base)
  }
  return colors
}

export const createLegacyThemeColors = (
  rgbaColor: string,
  fontRgbaColor: string | null,
  isDark: boolean,
  isDarkFont = false,
): Record<string, string> => {
  const colors: Record<string, string> = { '--color-primary': rgbaColor }

  let previous = rgbaColor
  for (let i = 1; i < 11; i++) {
    previous = linearShade(isDark ? 0.2 : -0.1, previous)
    colors[`--color-primary-dark-${i * 100}`] = previous
    for (let j = 1; j < 10; j++) {
      colors[`--color-primary-dark-${i * 100}-alpha-${j * 100}`] = alphaShade(0.1 * j, previous)
      colors[`--color-primary-alpha-${j * 100}`] = alphaShade(0.1 * j, rgbaColor)
    }
  }

  previous = rgbaColor
  for (let i = 1; i < 10; i++) {
    previous = linearShade(isDark ? -0.1 : 0.2, previous)
    colors[`--color-primary-light-${i * 100}`] = previous
    for (let j = 1; j < 10; j++) {
      colors[`--color-primary-light-${i * 100}-alpha-${j * 100}`] = alphaShade(0.1 * j, previous)
    }
  }

  previous = linearShade(isDark ? -0.35 : 1, previous)
  colors['--color-primary-light-1000'] = previous
  for (let j = 1; j < 10; j++) {
    colors[`--color-primary-light-1000-alpha-${j * 100}`] = alphaShade(0.1 * j, previous)
  }

  colors['--color-theme'] = isDark ? colors['--color-primary-light-900'] : rgbaColor

  return { ...colors, ...fontColors(fontRgbaColor, isDark, isDarkFont) }
}
