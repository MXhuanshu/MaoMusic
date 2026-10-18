// 封面主题的主循环：听歌换封面 → 取色 → 生成明暗双主题 → 写入 CSS 变量。
//
// 触发策略：
//   · 300ms 防抖，避免连续切歌时反复取色
//   · 以封面 url 作种子，同一张封面永远得到同一套主题
//   · 最多缓存 30 首，来回切歌不再重复读像素
//   · 页面不可见时跳过（省电，切回来时 watch 会重新触发）

import { watch } from '@common/utils/vueTools'
import { musicInfo } from '@renderer/store/player/state'
import { appSetting } from '@renderer/store/setting'
import { themeShouldUseDarkColors } from '@renderer/store'
import { applyTheme } from './applyTheme'
import { BASE_DUAL_THEME } from './baseThemes'
import { createSeededRandom, generateBuiltinDualTheme } from './dualTheme'
import { extractCoverColors } from './extractCover'
import {
  activeTheme,
  coverDualTheme,
  coverThemeSeed,
  isExtractingTheme,
  isFallbackTheme,
} from './state'
import type { DualTheme, Theme, ThemeModePreference } from './types'

const CACHE_LIMIT = 30
const DEBOUNCE_MS = 300

const themeCache = new Map<string, DualTheme>()

const rememberTheme = (seed: string, theme: DualTheme) => {
  if (themeCache.size >= CACHE_LIMIT) {
    const oldest = themeCache.keys().next().value
    if (oldest !== undefined) themeCache.delete(oldest)
  }
  themeCache.set(seed, theme)
}

/** 明暗模式的唯一判定入口。 */
export const resolveIsDaylight = (): boolean => {
  const mode = (appSetting['theme.mode'] ?? 'system') as ThemeModePreference
  if (mode === 'light') return false
  if (mode === 'dark') return true
  return themeShouldUseDarkColors.value
}

/** 把当前 coverDualTheme 的那一半写进页面。 */
export const applyCurrentCoverTheme = (): Theme => {
  const isDaylight = resolveIsDaylight()
  const theme = isDaylight ? coverDualTheme.value.light : coverDualTheme.value.dark
  activeTheme.value = theme
  applyTheme(theme, isDaylight)
  return theme
}

const setDualTheme = (theme: DualTheme, seed: string, fallback: boolean) => {
  coverDualTheme.value = theme
  coverThemeSeed.value = seed
  isFallbackTheme.value = fallback
  applyCurrentCoverTheme()
}

/** 立即用指定封面重新取色（设置页的「重新取色」按钮用）。 */
export const refreshCoverTheme = async (pic = musicInfo.pic) => {
  if (!pic) {
    setDualTheme(BASE_DUAL_THEME, '', true)
    return
  }

  const cached = themeCache.get(pic)
  if (cached) {
    setDualTheme(cached, pic, false)
    return
  }

  isExtractingTheme.value = true
  try {
    const colors = await extractCoverColors(pic)
    const random = createSeededRandom(pic)
    const theme = generateBuiltinDualTheme({ coverColors: colors, random })
    // 取不到任何颜色说明封面读失败，标记为兜底
    rememberTheme(pic, theme)
    setDualTheme(theme, pic, colors.length === 0)
  } catch {
    setDualTheme(BASE_DUAL_THEME, pic, true)
  } finally {
    isExtractingTheme.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | null = null

const scheduleRefresh = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    if (document.hidden) return
    void refreshCoverTheme()
  }, DEBOUNCE_MS)
}

/**
 * 在主窗口挂载一次即可。App.vue 里 `useApp()` 之后调用。
 * 静态主题模式下本引擎完全不介入，交回旧的 applyTheme 链路。
 */
export const useCoverTheme = () => {
  const isCoverMode = () => appSetting['theme.source'] !== 'static'

  watch(() => musicInfo.pic, () => {
    if (!isCoverMode()) return
    scheduleRefresh()
  })

  // 明暗模式切换：不需要重新取色，只换用另一半主题
  watch([
    () => appSetting['theme.mode'],
    themeShouldUseDarkColors,
  ], () => {
    if (!isCoverMode()) return
    applyCurrentCoverTheme()
  })

  // 从静态主题切回封面模式
  watch(() => appSetting['theme.source'], () => {
    if (!isCoverMode()) return
    void refreshCoverTheme()
  })

  // 首屏：先把兜底主题写上去，取色完成后再替换，避免白屏/无变量
  if (isCoverMode()) void refreshCoverTheme()
}
