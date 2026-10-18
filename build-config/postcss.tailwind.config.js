// Tailwind 专用 PostCSS 配置
// 只被 build-config/renderer/webpack.config.base.js 里 `src/renderer/ui/styles` 那条规则引用。
// 与根目录 postcss.config.js（pxtorem）完全隔离：Tailwind 的产物永远不经过 px→rem 转换，
// 否则 w-[360px] / p-4 之类会被 pxtorem 改写，视觉尺寸全乱。
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
