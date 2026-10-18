<template>
  <!--
    星野背景：全屏三角 + 噪声星云 + 三层星点，颜色跟着封面强调色走。
    移植自 Folia 的 SoraBackground（twgl 版），这里换成自建的全屏三角宿主，
    只为去掉 twgl 依赖；着色器思路一致（drift 星点 + 噪声星云 + 呼吸光晕）。
  -->
  <canvas ref="canvas" class="absolute inset-0 h-full w-full" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from '@common/utils/vueTools'
import { colorToVec3, createShaderQuad, prefersReducedMotion } from '../useShaderQuad'
import type { ShaderQuadHandle } from '../useShaderQuad'

const props = withDefaults(defineProps<{
  accent?: string
  background?: string
  power?: number
  paused?: boolean
}>(), {
  accent: '#f4f4f5',
  background: '#09090b',
  power: 0,
  paused: false,
})

const FRAGMENT = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uAccent;
uniform vec3 uBg;
uniform float uPower;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv - 0.5;
  p.x *= uRes.x / uRes.y;

  float t = uTime * 0.02;

  float n1 = noise(p * 2.2 + vec2(t, -t * 0.7));
  float n2 = noise(p * 4.6 - vec2(t * 1.3, t));
  float nebula = smoothstep(0.35, 0.95, n1 * 0.65 + n2 * 0.45);

  vec3 color = uBg;
  color += uAccent * nebula * (0.16 + uPower * 0.26);

  float glow = smoothstep(0.95, 0.0, length(p));
  color += uAccent * glow * 0.10;

  for (int layer = 0; layer < 3; layer++) {
    float fl = float(layer);
    float scale = 12.0 + fl * 9.0;
    vec2 gp = p * scale + vec2(t * (0.6 + fl * 0.4), 0.0);
    vec2 id = floor(gp);
    vec2 gv = fract(gp) - 0.5;
    float rnd = hash(id + fl * 31.4);
    vec2 offset = vec2(hash(id + 11.0), hash(id + 23.0)) - 0.5;
    float d = length(gv - offset * 0.72);
    float size = 0.045 + 0.03 * rnd;
    float star = smoothstep(size, 0.0, d);
    float twinkle = 0.45 + 0.55 * sin(uTime * (1.2 + rnd * 2.4) + rnd * 6.283);
    star *= step(0.62, rnd) * twinkle * (0.5 + fl * 0.22);
    color += vec3(star);
  }

  color += uAccent * uPower * 0.05;

  float vignette = smoothstep(1.25, 0.25, length(uv - 0.5));
  color *= mix(0.55, 1.0, vignette);

  gl_FragColor = vec4(color, 1.0);
}
`

const canvas = ref<HTMLCanvasElement>()
let quad: ShaderQuadHandle | null = null
let raf = 0
let observer: ResizeObserver | null = null
let startedAt = 0
let smoothedPower = 0

const reduced = prefersReducedMotion()

const draw = (now: number) => {
  if (!quad || !canvas.value) return
  const parent = canvas.value.parentElement
  if (!parent) return

  const elapsed = (now - startedAt) / 1000
  smoothedPower += ((props.power ?? 0) - smoothedPower) * 0.08

  quad.resize(parent.clientWidth, parent.clientHeight, Math.min(window.devicePixelRatio || 1, 1.5))
  quad.render(reduced ? 8 : elapsed, {
    uAccent: colorToVec3(props.accent),
    uBg: colorToVec3(props.background),
    uPower: Math.min(1, Math.max(0, smoothedPower)),
  })

  if (!reduced) raf = window.requestAnimationFrame(draw)
}

const start = () => {
  if (!canvas.value || props.paused) return
  if (quad) return
  quad = createShaderQuad(canvas.value, FRAGMENT)
  if (!quad) return
  startedAt = window.performance.now()
  raf = window.requestAnimationFrame(draw)
}

const stop = () => {
  if (raf) window.cancelAnimationFrame(raf)
  raf = 0
}

onMounted(() => {
  start()
  if (!canvas.value?.parentElement) return
  observer = new ResizeObserver(() => {
    if (quad && canvas.value) {
      const parent = canvas.value.parentElement
      if (!parent) return
      quad.resize(parent.clientWidth, parent.clientHeight, Math.min(window.devicePixelRatio || 1, 1.5))
      if (reduced) quad.render(8, { uAccent: colorToVec3(props.accent), uBg: colorToVec3(props.background) })
    }
  })
  observer.observe(canvas.value.parentElement)
})

watch(() => props.paused, (paused) => {
  if (paused) {
    stop()
  } else {
    if (!quad) start()
    else if (!reduced && !raf) raf = window.requestAnimationFrame(draw)
  }
})

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
  observer = null
  quad?.dispose()
  quad = null
})
</script>
