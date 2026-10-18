// 视觉强度的唯一判定入口：设置项 → WebGL2 能力 → 系统减弱动效。
//
// off  只留封面模糊背景，连 canvas 都不建
// lite 纯 CSS 渐变，零 GPU 负担（低配机 / 减弱动效 / 无 WebGL2 的兜底）
// full 星野背景 + 3D 歌词走廊 + 粒子

import { computed } from '@common/utils/vueTools'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { hasWebgl2, prefersReducedMotion } from './useShaderQuad'

export type VisualizerMode = 'off' | 'lite' | 'full'

const webgl2Ready = hasWebgl2()
const reducedMotion = prefersReducedMotion()

// 旧版本默认是 'lite'（纯 CSS 渐变），升级上来的用户配置里仍存着这个值，
// 导致装了 2.0 仍然看不到 Folia 舞台。这里在首次进入该判定时一次性把旧 'lite'
// 升级为 'full'（Folia 舞台）。用户之后在设置里手动改回 lite 不会被覆盖。
if (appSetting['playDetail.visualizer'] === 'lite' && !window.lxData.foliaVisualizerUpgraded) {
  window.lxData.foliaVisualizerUpgraded = true
  updateSetting({ 'playDetail.visualizer': 'full' })
}

export const useVisualizerMode = () => computed<VisualizerMode>(() => {
  const preference = (appSetting['playDetail.visualizer'] ?? 'full') as VisualizerMode
  if (preference === 'off') return 'off'
  if (preference === 'lite') return 'lite'
  if (!webgl2Ready || reducedMotion) return 'lite'
  return 'full'
})

export const isVisualizerSupported = () => webgl2Ready && !reducedMotion
