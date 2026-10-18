// 动态类名的唯一出口。
//
// Tailwind 是纯文本扫描，`'p-' + size` 这类拼接它看不见。所有需要按变量选类的场合，
// 都在这里写成完整字符串字面量——这个文件本身也在 @source 扫描范围内，所以字面量一定被收集。
// 新组件里请 import 这里的常量，不要自己拼。

/** 按钮：与 Folia settings kit 的 Button 对齐 */
export const BUTTON_VARIANT = {
  primary: 'bg-accent text-on-accent hover:brightness-110 active:brightness-95',
  secondary: 'bg-fill2 text-fg hover:bg-raise',
  ghost: 'bg-transparent text-t2 hover:bg-fill hover:text-fg',
  danger: 'bg-transparent text-err hover:bg-err/15',
  outline: 'bg-transparent text-fg border border-line2 hover:border-line2 hover:bg-fill',
} as const

export const BUTTON_SIZE = {
  sm: 'h-7 gap-1.5 rounded-lg px-2.5 text-[12px]',
  md: 'h-8 gap-2 rounded-lg px-3 text-[13px]',
  lg: 'h-10 gap-2 rounded-xl px-4 text-[14px]',
  icon: 'h-8 w-8 justify-center rounded-full',
  iconSm: 'h-7 w-7 justify-center rounded-full',
} as const

/** 文本层级：对应 Folia 的 t1 / t2 / t3 */
export const TEXT_TONE = {
  primary: 'text-fg',
  secondary: 'text-t2',
  tertiary: 'text-t3',
  accent: 'text-accent',
  danger: 'text-err',
  success: 'text-ok',
} as const

/** 表面层级 */
export const SURFACE = {
  window: 'bg-win',
  side: 'bg-side',
  card: 'bg-card',
  menu: 'bg-menu',
  raise: 'bg-raise',
  glass: 'bg-glass backdrop-blur-[40px] backdrop-saturate-150',
} as const

/** 列表行状态 */
export const ROW_STATE = {
  idle: 'bg-transparent',
  hover: 'hover:bg-fill',
  active: 'bg-fill2',
  selected: 'bg-accent/12 text-accent',
} as const

/** 设置项行高，四档统一 */
export const ROW_HEIGHT = {
  compact: 'h-9',
  normal: 'h-11',
  roomy: 'h-14',
} as const

/** 圆角组合 */
export const RADIUS_CLASS = {
  card: 'rounded-[12px]',
  sheet: 'rounded-[16px]',
  panel: 'rounded-[20px]',
  command: 'rounded-[24px]',
  pill: 'rounded-full',
} as const
