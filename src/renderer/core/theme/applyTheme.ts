// 把一套主题真正写进页面：合并新令牌 + 旧变量，交给 index.html 里的 window.setTheme。
//
// 保留 window.setTheme 这套注入机制不动，是因为它已经被首屏引导脚本、桌面歌词窗、
// 主进程 URL 参数三处依赖。只换变量内容，不换注入通道。

import { buildLegacyTokens } from './legacyBridge'
import { emitThemeTokens } from './state'
import { buildUiTokens, withReducedMotion } from './tokens'
import type { Theme } from './types'

/** 首屏缓存键。存的是**最终变量表**而不是主题对象，引导脚本不需要会算主题。 */
export const THEME_CACHE_KEY = 'mao.ui.tokens'

/** 首屏明暗缓存键，供 index.html 在 JS 起来前先把 data-daylight 设对。 */
export const DAYLIGHT_CACHE_KEY = 'mao.ui.daylight'

export interface ApplyThemeOptions {
  /** 关闭界面动效（--st-dur-* 全部归零） */
  reducedMotion?: boolean
  /** 是否把结果写进首屏缓存 */
  cache?: boolean
}

export const buildAllTokens = (
  theme: Theme,
  isDaylight: boolean,
  { reducedMotion = false }: ApplyThemeOptions = {},
): Record<string, string> => {
  const tokens: Record<string, string> = {
    ...buildUiTokens(theme, isDaylight),
    ...buildLegacyTokens(theme, isDaylight),
  }
  return reducedMotion ? withReducedMotion(tokens) : tokens
}

export const applyTheme = (
  theme: Theme,
  isDaylight: boolean,
  options: ApplyThemeOptions = {},
): Record<string, string> => {
  const tokens = buildAllTokens(theme, isDaylight, options)

  window.setTheme(tokens)
  document.documentElement.dataset.daylight = String(isDaylight)
  emitThemeTokens(tokens)

  if (options.cache !== false) {
    try {
      localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(tokens))
      localStorage.setItem(DAYLIGHT_CACHE_KEY, isDaylight ? 'true' : 'false')
    } catch {
      // 隐私模式/配额满：首屏会退化成 CSS 里的默认暗色，不影响功能
    }
  }

  return tokens
}
