const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')

const root = path.join(__dirname, '..')
const baseConfig = require(path.join(root, 'build-config/renderer/webpack.config.base'))
const prodConfig = require(path.join(root, 'build-config/renderer/webpack.config.prod'))

const cfg = merge(prodConfig, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  optimization: { minimize: false, minimizer: [] },
})

webpack(cfg, (err, stats) => {
  if (err) { console.error(err.stack || err); process.exit(1) }
  console.log(stats.toString({ chunks: false, colors: false }))
  process.exit(stats.hasErrors() ? 1 : 0)
})
