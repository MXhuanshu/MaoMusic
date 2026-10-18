// 主题引擎的共享状态。放在模块级 ref 里，任何组件都能读到当前封面主题，
// 不需要走 provide/inject（与项目现有的 store 风格一致）。

import { ref } from '@common/utils/vueTools'
import { BASE_DUAL_THEME } from './baseThemes'
import type { DualTheme, Theme } from './types'

/** 当前封面生成出来的明暗双主题 */
export const coverDualTheme = ref<DualTheme>(BASE_DUAL_THEME)

/** 当前主题对应的封面标识（url），用于去重与调试 */
export const coverThemeSeed = ref('')

/** 取色是否正在进行 */
export const isExtractingTheme = ref(false)

/** 当前实际生效的那一半 */
export const activeTheme = ref<Theme>(BASE_DUAL_THEME.dark)

/** 取色失败/无封面时是否在用兜底主题 */
export const isFallbackTheme = ref(true)

/**
 * 最近一次写入页面的完整变量表。
 * 桌面歌词窗是独立进程，只能靠 IPC 同步，所以这里留一份快照给它按需索取。
 */
let lastTokens: Record<string, string> = {}

const tokenListeners = new Set<(tokens: Record<string, string>) => void>()

export const getLastThemeTokens = () => lastTokens

export const onThemeTokensApplied = (listener: (tokens: Record<string, string>) => void) => {
  tokenListeners.add(listener)
  return () => {
    tokenListeners.delete(listener)
  }
}

/** applyTheme 写完页面后调用；订阅方（歌词窗桥接）据此把令牌转发出去。 */
export const emitThemeTokens = (tokens: Record<string, string>) => {
  lastTokens = tokens
  for (const listener of tokenListeners) listener(tokens)
}
