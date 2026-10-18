// 3D 歌词走廊。
//
// 结构：每行歌词是一组「词」平面，沿 -Z 方向排队；相机固定朝前，只把 Z 慢慢推向当前行，
// 于是滚动感来自空间而不是 DOM。当前行按行内进度逐词点亮，其余行按与当前行的距离淡出。
//
// 与 Folia 的 VisualizerDiorama 是同一个视觉思路，但这里是原生 three + 一个类，
// 不引入 @react-three/fiber，也不把场景塞进 Vue 响应式系统。

import * as THREE from 'three'
import { rasterWord, splitWords } from './textRaster'

const LINE_GAP = 3.4
const WORD_HEIGHT = 0.78
const MAX_WORD_HEIGHT = 2.6
const WINDOW_BEFORE = 2
const WINDOW_AFTER = 10
const MAX_WORDS_PER_LINE = 28
const PARTICLE_COUNT = 420
const PARTICLE_DEPTH = 74

export interface DioramaThemeColors {
  accent: string
  text: string
  dim: string
}

export interface DioramaOptions {
  canvas: HTMLCanvasElement
  colors: DioramaThemeColors
  maxAnisotropy?: number
}

interface WordMeta {
  wordIndex: number
  count: number
}

export class DioramaScene {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private corridor: THREE.Group
  private particles: THREE.Points
  private particlePositions: Float32Array
  private particleMaterial: THREE.PointsMaterial

  private groups = new Map<number, THREE.Group>()
  private lines: string[] = []
  private colors: DioramaThemeColors
  private activeIndex = 0
  private activeProgress = 0
  private power = 0
  private smoothedPower = 0
  private cameraZ = 0
  private targetZ = 0
  private raf = 0
  private lastFrame = 0
  private disposed = false

  constructor({ canvas, colors }: DioramaOptions) {
    this.colors = colors

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 240)
    this.camera.position.set(0, 0.15, 0)
    this.camera.lookAt(0, 0.1, -10)

    this.corridor = new THREE.Group()
    this.scene.add(this.corridor)

    const geometry = new THREE.BufferGeometry()
    this.particlePositions = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 18
      this.particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 9
      this.particlePositions[i * 3 + 2] = 5 - Math.random() * PARTICLE_DEPTH
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3))

    this.particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(colors.accent),
      size: 0.055,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    this.particles = new THREE.Points(geometry, this.particleMaterial)
    this.scene.add(this.particles)
  }

  setLyrics(lines: string[]) {
    this.lines = lines
    for (const group of this.groups.values()) this.disposeGroup(group)
    this.groups.clear()
    this.activeIndex = 0
    this.activeProgress = 0
    this.cameraZ = 0
    this.targetZ = 0
    this.ensureWindow(0)
  }

  setActiveLine(index: number, progress: number) {
    const next = Math.max(0, Math.min(this.lines.length - 1, index))
    this.activeIndex = next
    this.activeProgress = progress
    this.targetZ = next * LINE_GAP
    this.ensureWindow(next)
  }

  setPower(value: number) {
    this.power = Math.max(0, Math.min(1, value))
  }

  setColors(colors: DioramaThemeColors) {
    this.colors = colors
    this.particleMaterial.color = new THREE.Color(colors.accent)
    this.applyLineColors()
  }

  resize(width: number, height: number, dpr = 1) {
    if (width <= 0 || height <= 0) return
    this.renderer.setPixelRatio(Math.min(dpr, 1.5))
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  start() {
    if (this.raf || this.disposed) return
    this.lastFrame = window.performance.now()
    const loop = (now: number) => {
      if (this.disposed) return
      const delta = Math.min(0.05, (now - this.lastFrame) / 1000)
      this.lastFrame = now
      this.update(delta)
      this.renderer.render(this.scene, this.camera)
      this.raf = window.requestAnimationFrame(loop)
    }
    this.raf = window.requestAnimationFrame(loop)
  }

  stop() {
    if (this.raf) window.cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  /** 输出一帧静态画面（减弱动效 / 非活动窗口时用）。 */
  renderOnce() {
    this.update(0)
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    this.stop()
    for (const group of this.groups.values()) this.disposeGroup(group)
    this.groups.clear()
    this.particles.geometry.dispose()
    this.particleMaterial.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }

  private ensureWindow(index: number) {
    const start = Math.max(0, index - WINDOW_BEFORE)
    const end = Math.min(this.lines.length - 1, index + WINDOW_AFTER)

    for (const [key, group] of [...this.groups.entries()]) {
      if (key < start || key > end) {
        this.disposeGroup(group)
        this.groups.delete(key)
      }
    }

    for (let i = start; i <= end; i++) {
      if (!this.groups.has(i)) this.groups.set(i, this.buildLine(i))
    }
  }

  private buildLine(index: number): THREE.Group {
    const group = new THREE.Group()
    group.position.z = -index * LINE_GAP
    group.position.y = Math.sin(index * 0.55) * 0.16

    const words = splitWords(this.lines[index] ?? '').slice(0, MAX_WORDS_PER_LINE)
    if (!words.length) {
      this.corridor.add(group)
      return group
    }

    const rasters = words.map(word => ({ word, raster: rasterWord(word) }))
    const heights = rasters.map(({ raster }) => {
      const height = Math.min(MAX_WORD_HEIGHT, WORD_HEIGHT * (raster?.aspect && raster.aspect > 3 ? 1.25 : 1))
      return height
    })
    const widths = rasters.map(({ raster }, i) => (raster ? heights[i] * raster.aspect : 0))
    const gap = 0.12
    const total = widths.reduce((sum, w) => sum + w, 0) + gap * (words.length - 1)

    let cursor = -total / 2
    rasters.forEach(({ raster, word }, wordIndex) => {
      if (!raster) {
        cursor += widths[wordIndex] + gap
        return
      }

      const material = new THREE.MeshBasicMaterial({
        map: raster.texture,
        color: new THREE.Color(this.colors.dim),
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      })
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(widths[wordIndex], heights[wordIndex]),
        material,
      )
      mesh.position.set(cursor + widths[wordIndex] / 2, 0, 0)
      const meta: WordMeta = { wordIndex, count: words.length }
      mesh.userData = meta
      mesh.name = word
      group.add(mesh)
      cursor += widths[wordIndex] + gap
    })

    this.corridor.add(group)
    return group
  }

  private applyLineColors() {
    for (const [index, group] of this.groups) {
      const distance = index - this.activeIndex
      const isActive = distance === 0
      for (const child of group.children) {
        const mesh = child as THREE.Mesh
        const meta = mesh.userData as WordMeta
        const material = mesh.material as THREE.MeshBasicMaterial
        if (isActive) {
          const passed = meta.wordIndex < Math.floor(this.activeProgress * meta.count)
          material.color.set(passed ? this.colors.accent : this.colors.text)
          material.opacity = 1
        } else {
          material.color.set(this.colors.dim)
          material.opacity = distance < 0 ? 0.22 : 0.5
        }
      }
    }
  }

  private update(delta: number) {
    this.smoothedPower += (this.power - this.smoothedPower) * 0.1
    this.cameraZ += (this.targetZ - this.cameraZ) * Math.min(1, delta * 4.2)

    const float = Math.sin(window.performance.now() / 2200) * 0.06
    this.camera.position.set(float, 0.15 + this.smoothedPower * 0.05, this.cameraZ)
    this.camera.lookAt(0, 0.1 + float * 0.4, this.cameraZ - 9)

    this.applyLineColors()

    // 粒子朝相机漂移，出画后回收到远处
    const speed = (0.7 + this.smoothedPower * 3.4) * delta
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const zIndex = i * 3 + 2
      this.particlePositions[zIndex] += speed
      if (this.particlePositions[zIndex] > 7) {
        this.particlePositions[zIndex] -= PARTICLE_DEPTH
      }
    }
    const attribute = this.particles.geometry.getAttribute('position') as THREE.BufferAttribute
    attribute.needsUpdate = true
    this.particles.position.z = this.cameraZ
    this.particleMaterial.size = 0.05 + this.smoothedPower * 0.06
    this.particleMaterial.opacity = 0.32 + this.smoothedPower * 0.4
  }

  private disposeGroup(group: THREE.Group) {
    for (const child of group.children) {
      const mesh = child as THREE.Mesh
      mesh.geometry?.dispose()
      const material = mesh.material as THREE.MeshBasicMaterial
      // 贴图由 textRaster 的缓存统一管理，这里只释放材质与几何
      material?.dispose()
    }
    this.corridor.remove(group)
  }
}
