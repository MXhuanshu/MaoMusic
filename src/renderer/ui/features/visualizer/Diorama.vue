<template>
  <!-- 3D 歌词走廊宿主：只做生命周期与数据搬运，场景逻辑全在 scene.ts -->
  <canvas ref="canvas" class="absolute inset-0 h-full w-full" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from '@common/utils/vueTools'
import { DioramaScene } from './diorama/scene'

const props = withDefaults(defineProps<{
  lines: string[]
  activeIndex: number
  progress: number
  power?: number
  accent?: string
  text?: string
  dim?: string
  paused?: boolean
}>(), {
  power: 0,
  accent: '#f4f4f5',
  text: '#e8e8ea',
  dim: '#6b6b74',
  paused: false,
})

const canvas = ref<HTMLCanvasElement>()
let scene: DioramaScene | null = null
let observer: ResizeObserver | null = null

const currentColors = () => ({
  accent: props.accent,
  text: props.text,
  dim: props.dim,
})

const resize = () => {
  const parent = canvas.value?.parentElement
  if (!scene || !parent) return
  scene.resize(parent.clientWidth, parent.clientHeight, window.devicePixelRatio || 1)
}

onMounted(() => {
  if (!canvas.value) return
  scene = new DioramaScene({ canvas: canvas.value, colors: currentColors() })
  resize()
  scene.setLyrics(props.lines)
  scene.setActiveLine(props.activeIndex, props.progress)
  scene.setPower(props.power)
  scene.start()

  const parent = canvas.value.parentElement
  if (parent) {
    observer = new ResizeObserver(resize)
    observer.observe(parent)
  }
})

watch(() => props.lines, (lines) => {
  scene?.setLyrics(lines)
  scene?.setActiveLine(props.activeIndex, props.progress)
})

watch([() => props.activeIndex, () => props.progress], ([index, progress]) => {
  scene?.setActiveLine(index, progress)
})

watch(() => props.power, (power) => {
  scene?.setPower(power)
})

watch([() => props.accent, () => props.text, () => props.dim], () => {
  scene?.setColors(currentColors())
})

watch(() => props.paused, (paused) => {
  if (!scene) return
  if (paused) {
    scene.stop()
    scene.renderOnce()
  } else {
    scene.start()
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  scene?.dispose()
  scene = null
})
</script>
