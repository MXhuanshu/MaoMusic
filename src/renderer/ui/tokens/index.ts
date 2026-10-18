// 设计常量：给 JS 里需要数值的地方用（比如拖拽吸附、延迟、内联 transition）。
// CSS 侧请直接用 --st-dur-* / --st-ease-*，两边的值必须一致。

export const DURATION = {
  /** 颜色变化、按下反馈、tooltip */
  fast: 0.12,
  /** 短距离移动：开关滑块、选中标记、页面进入 */
  move: 0.22,
  /** 行、折叠组的展开收起 */
  unfold: 0.3,
  /** 被揭开、或从一处移到另一处 */
  show: 0.48,
  /** 落位高亮停留时长 */
  flash: 2.2,
  /** 指针悬停多久出 tooltip */
  tooltipDelay: 0.4,
  /** 操作完成后确认态停留多久 */
  confirm: 1.6,
} as const

export const EASE = {
  /** 离开得快、落得柔：所有到达/位移 */
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** 两端均匀：颜色 */
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** 两端慢：从一处离开展到另一处 */
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const

export const RADIUS = {
  card: 12,
  sheet: 16,
  panel: 20,
  command: 24,
  window: 8,
  pill: 999,
} as const

/** Folia 的外壳尺寸 */
export const CHROME = {
  titleBarHeight: 32,
  titleBarRevealHeight: 56,
  sideRailWidth: 64,
  sideRailExpandedWidth: 200,
  playerBottom: 32,
  playerMaxWidth: 512,
  panelWidth: 360,
  settingsWidth: 960,
} as const

export const ms = (seconds: number) => `${Math.round(seconds * 1000)}ms`
