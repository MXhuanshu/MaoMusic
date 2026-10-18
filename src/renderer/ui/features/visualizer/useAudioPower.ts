// 从播放器现成的 AnalyserNode 取一个 0-1 的「能量」值，喂给粒子和背景。
// 不新建 AudioContext，也不碰音频链路，只读频谱。

import { onBeforeUnmount, onMounted, ref } from '@common/utils/vueTools'
import { getAnalyser } from '@renderer/plugins/player'

const SAMPLE_INTERVAL = 90

export const useAudioPower = () => {
  const power = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null
  let buffer = new Uint8Array(0)
  let smoothed = 0

  const sample = () => {
    const analyser = getAnalyser()
    if (!analyser) {
      smoothed *= 0.9
      power.value = smoothed
      return
    }
    if (buffer.length !== analyser.frequencyBinCount) buffer = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(buffer)

    // 只取低频到中频段，人声与鼓点都在这里，高音尖啸不参与律动
    const end = Math.max(8, Math.floor(buffer.length * 0.55))
    let sum = 0
    for (let i = 0; i < end; i++) sum += buffer[i]
    const average = sum / (end * 255)
    const target = Math.min(1, Math.pow(average * 2.4, 1.35))
    smoothed += (target - smoothed) * 0.35
    power.value = smoothed
  }

  onMounted(() => {
    sample()
    timer = setInterval(sample, SAMPLE_INTERVAL)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    timer = null
  })

  return { power }
}
