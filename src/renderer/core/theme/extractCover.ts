// 封面取色：缩到 50×50 读像素，再用加权中位切分（median cut）取出代表性色板。
// 移植自 Folia src/utils/colorExtractor.ts + colorPalette.ts。
// 唯一改动：只有 http(s) 才设 crossOrigin。猫仙的封面大量是 file:// 本地路径，
// 给 file:// 设 Anonymous 会导致图片直接加载失败。

const SAMPLE_SIZE = 50
const MIN_ALPHA = 128
const QUANTIZATION_SHIFT = 4

interface WeightedColor {
  r: number
  g: number
  b: number
  weight: number
}

interface ColorBucket {
  colors: WeightedColor[]
  weight: number
}

const getChannelRange = (colors: WeightedColor[], channel: 'r' | 'g' | 'b') => {
  let min = 255
  let max = 0
  for (const color of colors) {
    min = Math.min(min, color[channel])
    max = Math.max(max, color[channel])
  }
  return max - min
}

const splitBucket = (bucket: ColorBucket): [ColorBucket, ColorBucket] | null => {
  if (bucket.colors.length < 2) return null

  const ranges = {
    r: getChannelRange(bucket.colors, 'r'),
    g: getChannelRange(bucket.colors, 'g'),
    b: getChannelRange(bucket.colors, 'b'),
  }
  const channel = (Object.keys(ranges) as Array<keyof typeof ranges>)
    .reduce((widest, candidate) => ranges[candidate] > ranges[widest] ? candidate : widest, 'r')
  const sorted = [...bucket.colors].sort((a, b) => a[channel] - b[channel])
  const midpoint = bucket.weight / 2
  let accumulatedWeight = 0
  let splitIndex = 1

  for (let index = 0; index < sorted.length - 1; index += 1) {
    accumulatedWeight += sorted[index].weight
    splitIndex = index + 1
    if (accumulatedWeight >= midpoint) break
  }

  const left = sorted.slice(0, splitIndex)
  const right = sorted.slice(splitIndex)
  return [
    { colors: left, weight: left.reduce((sum, color) => sum + color.weight, 0) },
    { colors: right, weight: right.reduce((sum, color) => sum + color.weight, 0) },
  ]
}

const averageBucket = (bucket: ColorBucket): WeightedColor => {
  const totals = bucket.colors.reduce((result, color) => ({
    r: result.r + color.r * color.weight,
    g: result.g + color.g * color.weight,
    b: result.b + color.b * color.weight,
  }), { r: 0, g: 0, b: 0 })
  return {
    r: Math.round(totals.r / bucket.weight),
    g: Math.round(totals.g / bucket.weight),
    b: Math.round(totals.b / bucket.weight),
    weight: bucket.weight,
  }
}

const toHex = ({ r, g, b }: WeightedColor) => (
  `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
)

/** 加权中位切分：封面里大面积的区域比细小的鲜艳细节更重要。 */
export const extractRepresentativeColorsFromPixels = (
  pixels: Uint8ClampedArray,
  count = 5,
): string[] => {
  if (count <= 0) return []

  const histogram = new Map<number, WeightedColor>()
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < MIN_ALPHA) continue
    const r = pixels[index]
    const g = pixels[index + 1]
    const b = pixels[index + 2]
    const key = ((r >> QUANTIZATION_SHIFT) << 8)
      | ((g >> QUANTIZATION_SHIFT) << 4)
      | (b >> QUANTIZATION_SHIFT)
    const existing = histogram.get(key)
    if (existing) {
      existing.r += r
      existing.g += g
      existing.b += b
      existing.weight += 1
    } else {
      histogram.set(key, { r, g, b, weight: 1 })
    }
  }

  const colors = [...histogram.values()].map(color => ({
    r: Math.round(color.r / color.weight),
    g: Math.round(color.g / color.weight),
    b: Math.round(color.b / color.weight),
    weight: color.weight,
  }))
  if (colors.length === 0) return []

  const buckets: ColorBucket[] = [{
    colors,
    weight: colors.reduce((sum, color) => sum + color.weight, 0),
  }]

  while (buckets.length < Math.min(count, colors.length)) {
    let bucketIndex = -1
    let bestScore = -1
    for (let index = 0; index < buckets.length; index += 1) {
      const bucket = buckets[index]
      if (bucket.colors.length < 2) continue
      const widestRange = Math.max(
        getChannelRange(bucket.colors, 'r'),
        getChannelRange(bucket.colors, 'g'),
        getChannelRange(bucket.colors, 'b'),
      )
      const score = widestRange * Math.sqrt(bucket.weight)
      if (score > bestScore) {
        bestScore = score
        bucketIndex = index
      }
    }
    if (bucketIndex < 0) break
    const split = splitBucket(buckets[bucketIndex])
    if (!split) break
    buckets.splice(bucketIndex, 1, ...split)
  }

  return buckets
    .map(averageBucket)
    .sort((a, b) => b.weight - a.weight)
    .map(toHex)
}

/** 把图片缩到 50×50 读出像素；加载失败或读像素抛错都返回 null。 */
export const loadImagePixels = (
  imageUrl: string,
  { silent = false }: { silent?: boolean } = {},
): Promise<Uint8ClampedArray | null> => (
  new Promise(resolve => {
    const img = new Image()
    // file:// 不能设 crossOrigin，否则直接加载失败；http(s) 需要它才能读像素
    if (/^https?:/i.test(imageUrl)) img.crossOrigin = 'Anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(null)
        return
      }

      canvas.width = SAMPLE_SIZE
      canvas.height = SAMPLE_SIZE

      try {
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
        resolve(ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data)
      } catch (error) {
        if (!silent) console.warn('封面取色：读取像素失败', error)
        resolve(null)
      }
    }

    img.onerror = (error) => {
      if (!silent) console.warn('封面取色：图片加载失败', error)
      resolve(null)
    }

    img.src = imageUrl
  })
)

/** 取封面的代表性色板。失败返回空数组，调用方回落到默认主题。 */
export const extractCoverColors = async (imageUrl: string, count = 5): Promise<string[]> => {
  if (!imageUrl) return []
  const pixels = await loadImagePixels(imageUrl, { silent: true })
  return pixels ? extractRepresentativeColorsFromPixels(pixels, count) : []
}
