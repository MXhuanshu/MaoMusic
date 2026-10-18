// 视觉强度的唯一判定入口：设置项 → WebGL2 能力 → 系统减弱动效。
//
// off  只留封面模糊背景，连 canvas 都不建
// lite 纯 CSS 渐变，零 GPU 负担（低配机 / 减弱动效 / 无 WebGL2 的兜底）
// full 星野背景 + 3D 歌词走廊 + 粒子

import { computed } from '@common/utils/vueTools'
import { appSetting } from '@renderer/store/setting'
import { hasWebgl2, prefersReducedMotion } from './useShaderQuad'

export type VisualizerMode = 'off' | 'lite' | 'full'

const webgl2Ready = hasWebgl2()
const reducedMotion = prefersReducedMotion()

export const useVisualizerMode = () => computed<VisualizerMode>(() => {
  const preference = (appSetting['playDetail.visualizer'] ?? 'lite') as VisualizerMode
  if (preference === 'off') return 'off'
  if (preference === 'lite') return 'lite'
  if (!webgl2Ready || reducedMotion) return 'lite'
  return 'full'
})

export const isVisualizerSupported = () => webgl2Ready && !reducedMotion
