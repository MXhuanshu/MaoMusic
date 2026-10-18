// 把一行歌词里的「词」栅格化成贴图。
//
// 全部画成白色，颜色交给材质去乘：这样高亮时只改 material.color，
// 不需要为重音色再生成一张贴图，缓存命中率也高。
// 移植自 Folia 的 dioramaTextRaster，去掉了 React/主题依赖，只留 CanvasTexture。

import * as THREE from 'three'

export interface RasterWord {
  texture: THREE.CanvasTexture
  /** 宽 / 高，用于算平面的世界尺寸 */
  aspect: number
  /** 原词，调试与高亮分组用 */
  text: string
}

interface CacheEntry extends RasterWord {
  hits: number
}

const FONT_PX = 96
const PADDING = 10
const CACHE_LIMIT = 800

const cache = new Map<string, CacheEntry>()

const fontOf = (weight: number) => `${weight} ${FONT_PX}px "Inter", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif`

const makeCanvas = () => {
  const canvas = document.createElement('canvas')
  return { canvas, ctx: canvas.getContext('2d') }
}

export const rasterWord = (text: string, weight = 600): RasterWord | null => {
  const key = `${weight}|${text}`
  const cached = cache.get(key)
  if (cached) {
    cached.hits += 1
    return cached
  }

  const { canvas, ctx } = makeCanvas()
  if (!ctx) return null

  const font = fontOf(weight)
  ctx.font = font
  const width = Math.ceil(ctx.measureText(text).width) + PADDING * 2
  const height = Math.ceil(FONT_PX * 1.34) + PADDING * 2
  canvas.width = Math.max(2, width)
  canvas.height = Math.max(2, height)

  const draw = canvas.getContext('2d')
  if (!draw) return null
  draw.font = font
  draw.textAlign = 'center'
  draw.textBaseline = 'middle'
  draw.fillStyle = '#ffffff'
  draw.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true

  const entry: CacheEntry = {
    texture,
    aspect: canvas.width / canvas.height,
    text,
    hits: 1,
  }

  if (cache.size >= CACHE_LIMIT) {
    // 简单 LRU：按命中数淘汰一批，不追求严格
    const sorted = [...cache.entries()].sort((a, b) => a[1].hits - b[1].hits)
    for (let i = 0; i < Math.floor(sorted.length / 4); i++) {
      const [oldKey, old] = sorted[i]
      old.texture.dispose()
      cache.delete(oldKey)
    }
  }

  cache.set(key, entry)
  return entry
}

/** 中英混排切词：有空格按空格，没有空格按字符（中文逐字高亮）。 */
export const splitWords = (text: string): string[] => {
  const trimmed = text.trim()
  if (!trimmed) return []
  if (/\s/.test(trimmed)) return trimmed.split(/\s+/).filter(Boolean)
  return Array.from(trimmed)
}

export const disposeTextRasterCache = () => {
  for (const entry of cache.values()) entry.texture.dispose()
  cache.clear()
}
