// 全屏三角 + fragment shader 的极简宿主。
//
// Folia 用 @paper-design/shaders-react 承载 Latent / Nomand 背景，那是 React 组件，
// 引进来会把 React 拖进 bundle。这里只抽「画一个铺满屏幕的三角形，喂 uniform」这一层，
// 着色器字符串自己维护，既没有框架依赖，也没有额外包体。

const VERTEX_SHADER = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export type ShaderUniforms = Record<string, number | number[]>

export interface ShaderQuadHandle {
  resize: (width: number, height: number, dpr: number) => void
  render: (time: number, uniforms?: ShaderUniforms) => void
  dispose: () => void
  readonly gl: WebGL2RenderingContext | null
}

const compile = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[visualizer] shader compile failed:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

const applyUniform = (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: number | number[]) => {
  if (typeof value === 'number') {
    gl.uniform1f(location, value)
    return
  }
  switch (value.length) {
    case 2: gl.uniform2f(location, value[0], value[1]); break
    case 3: gl.uniform3f(location, value[0], value[1], value[2]); break
    case 4: gl.uniform4f(location, value[0], value[1], value[2], value[3]); break
    default: break
  }
}

export const createShaderQuad = (
  canvas: HTMLCanvasElement,
  fragment: string,
  initialUniforms: ShaderUniforms = {},
): ShaderQuadHandle | null => {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true })
  if (!gl) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment)
  if (!vs || !fs) {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return null
  }

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[visualizer] program link failed:', gl.getProgramInfoLog(program))
    return null
  }
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const locations = new Map<string, WebGLUniformLocation | null>()
  const locationOf = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name))
    return locations.get(name) ?? null
  }

  const setUniforms = (uniforms: ShaderUniforms) => {
    for (const [name, value] of Object.entries(uniforms)) {
      const location = locationOf(name)
      if (location) applyUniform(gl, location, value)
    }
  }

  setUniforms(initialUniforms)
  gl.clearColor(0, 0, 0, 0)

  return {
    gl,
    resize(width, height, dpr) {
      const w = Math.max(1, Math.round(width * dpr))
      const h = Math.max(1, Math.round(height * dpr))
      if (canvas.width === w && canvas.height === h) {
        setUniforms({ uRes: [w, h] })
        return
      }
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      setUniforms({ uRes: [w, h] })
    },
    render(time, uniforms = {}) {
      setUniforms({ ...uniforms, uTime: time })
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

/** 把 CSS 颜色转成 shader 用的 0-1 三元组。取不到就返回中性灰。 */
export const colorToVec3 = (color: string | undefined): [number, number, number] => {
  if (!color) return [0.6, 0.6, 0.65]
  const hex = color.trim()
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex)
  if (match) {
    const value = match[1]
    const full = value.length === 3
      ? value.split('').map(c => c + c).join('')
      : value
    return [
      parseInt(full.slice(0, 2), 16) / 255,
      parseInt(full.slice(2, 4), 16) / 255,
      parseInt(full.slice(4, 6), 16) / 255,
    ]
  }
  const rgb = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(hex)
  if (rgb) {
    return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255]
  }
  return [0.6, 0.6, 0.65]
}

export const prefersReducedMotion = (): boolean => (
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
)

/** 一次性探测 WebGL2。没有就整条重型视觉链路降级。 */
export const hasWebgl2 = (): boolean => {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}
