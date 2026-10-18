// 过渡桥：把新的封面主题翻译成旧主题体系那 232 个 --color-primary-* 变量，
// 让还没迁移到 Tailwind 的 Less 组件继续正常工作。
//
// 这是**临时文件**：等旧组件全部重写完、assets/styles 删掉之后可整体删除。
// 颜色推导已内联到 legacyPalette，不再依赖 src/common/theme/utils.js。

import { hexToRgbString } from './colorMath'
import { createLegacyThemeColors } from './legacyPalette'
import type { Theme } from './types'

export const buildLegacyTokens = (theme: Theme, isDaylight: boolean): Record<string, string> => {
  const isDark = !isDaylight

  // 从主色反推出 --color-primary(-dark/-light)-* 全套，以及 --color-000..--color-1000 文字梯度
  const colors = createLegacyThemeColors(
    hexToRgbString(theme.accentColor),
    hexToRgbString(theme.primaryColor),
    isDark,
    false,
  )

  return {
    ...colors,

    // 下面这些是旧主题 config.extInfo 里的语义变量，不在这 232 个里，
    // 需要按明暗各自给一份，否则旧界面的地面/导航色会保持浅色主题的样子
    '--color-app-background': isDark ? 'rgba(0, 0, 0, 0)' : 'var(--color-primary-light-600-alpha-700)',
    '--color-main-background': isDark ? 'rgba(19, 19, 19, 0.9)' : 'rgba(255, 255, 255, 1)',
    '--color-nav-font': 'var(--color-primary)',

    '--color-btn-hide': '#3bc2b2',
    '--color-btn-min': '#85c43b',
    '--color-btn-close': '#fab4a0',

    '--color-badge-primary': 'var(--color-primary)',
    '--color-badge-secondary': '#4baed5',
    '--color-badge-tertiary': '#e7aa36',

    '--background-image': 'none',
    '--background-image-position': 'center',
    '--background-image-size': 'cover',
  }
}
