<template>
  <canvas ref="canvasRef" class="absolute inset-0 block h-full w-full" />
</template>

<script setup lang="ts">
// 直接移植自 Folia 的 SoraBackground（AGPL-3.0）：
// src/components/visualizer/backgrounds/sora/SoraBackground.tsx
// 着色器与粒子参数保持原样，仅把 React 外壳换成 Vue。
import { onBeforeUnmount, onMounted, ref, watch } from '@common/utils/vueTools'
import * as twgl from 'twgl.js'

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

const PARTICLE_COUNT = 150

const VERTEX_SHADER = `
attribute float a_index;
uniform vec2 u_resolution;
uniform float u_time;
varying float v_color_type;
varying float v_intensity_base;

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float seed = a_index * 123.456;

  float speed_rand = hash2(vec2(seed, 1.1));
  float size_rand = hash2(vec2(seed, 2.2));
  float y_rand = hash2(vec2(seed, 3.3));
  float x_rand = hash2(vec2(seed, 4.4));
  float blink_rand = hash2(vec2(seed, 5.5));
  float color_type_rand = hash2(vec2(seed, 6.6));

  float aspect = u_resolution.x / u_resolution.y;
  float speed = 0.008 + speed_rand * 0.024;
  float size = 0.0006 + 0.0032 * pow(size_rand, 3.8);

  float y = -0.45 + y_rand * 0.9;

  float margin = 0.05;
  float width = aspect + margin * 2.0;
  float x = fract(x_rand + u_time * speed);
  x = x * width - (aspect * 0.5 + margin);

  float wave = sin(u_time * 0.3 + y_rand * 6.283) * 0.005;

  float ndc_x = x / (aspect * 0.5);
  float ndc_y = (y + wave) / 0.5;

  gl_Position = vec4(ndc_x, ndc_y, 0.0, 1.0);

  float pointSize = size * u_resolution.y * 3.5;
  gl_PointSize = max(2.0, pointSize);

  float blink = 0.3 + 0.7 * sin(u_time * (1.0 + blink_rand * 2.5) + x_rand * 6.283);
  v_intensity_base = blink;
  v_color_type = color_type_rand;
}
`

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 u_particle_color;
uniform vec3 u_particle_accent_color;

varying float v_color_type;
varying float v_intensity_base;

void main() {
  vec2 pc = gl_PointCoord - 0.5;
  float dist = length(pc);

  float alpha = smoothstep(0.5, 0.1, dist) * v_intensity_base;
  if (alpha < 0.01) discard;

  vec3 baseColor = v_color_type > 0.90 ? u_particle_accent_color : u_particle_color;

  gl_FragColor = vec4(baseColor * alpha, alpha);
}
`

const canvasRef = ref<HTMLCanvasElement | null>(null)
let gl: WebGLRenderingContext | null = null
let programInfo: twgl.ProgramInfo | null = null
let bufferInfo: twgl.BufferInfo | null = null
let raf: number | null = null
let time = 0
let last: number | null = null

const parseColor = (value: string): number[] => {
  const hex = value.trim().replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(hex)) return [1, 1, 1]
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ]
}

const render = (now: number) => {
  raf = null
  if (!gl || !programInfo || !bufferInfo) return
  if (!props.paused && last !== null) time += (now - last) / 1000
  last = props.paused ? null : now

  twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  const bg = parseColor(props.background)
  gl.clearColor(bg[0], bg[1], bg[2], 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  gl.useProgram(programInfo.program)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
  twgl.setUniforms(programInfo, {
    u_resolution: [gl.canvas.width, gl.canvas.height],
    u_time: time,
    u_particle_color: parseColor(props.accent),
    u_particle_accent_color: parseColor(props.accent),
  })
  twgl.drawBufferInfo(gl, bufferInfo, gl.POINTS)

  if (!props.paused) raf = requestAnimationFrame(render)
}

const invalidate = () => {
  if (raf !== null) return
  raf = requestAnimationFrame(render)
}

const setup = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  gl = twgl.getContext(canvas, { alpha: false, depth: false, antialias: false })
  if (!gl) return
  programInfo = twgl.createProgramInfo(gl, [VERTEX_SHADER, FRAGMENT_SHADER])
  if (!programInfo) return

  const indices = new Float32Array(PARTICLE_COUNT)
  for (let i = 0; i < PARTICLE_COUNT; i++) indices[i] = i
  bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    a_index: { numComponents: 1, data: indices },
  })
  invalidate()
}

const dispose = () => {
  if (raf !== null) cancelAnimationFrame(raf)
  raf = null
  if (!gl || !programInfo) return
  gl.deleteProgram(programInfo.program)
  if (bufferInfo?.attribs?.a_index?.buffer) gl.deleteBuffer(bufferInfo.attribs.a_index.buffer)
  gl = null
  programInfo = null
  bufferInfo = null
}

onMounted(setup)
onBeforeUnmount(dispose)

watch(() => [props.paused, props.accent, props.background, props.power], invalidate)
</script>
