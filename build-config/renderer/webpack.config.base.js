const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const HTMLPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

const vueLoaderConfig = require('../vue-loader.config')
const { mergeCSSLoader } = require('../utils')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  target: 'electron-renderer',
  entry: {
    renderer: path.join(__dirname, '../../src/renderer/main.ts'),
  },
  output: {
    filename: '[name].js',
    library: {
      type: 'commonjs2',
    },
    path: path.join(__dirname, '../../dist'),
    publicPath: '',
  },
  resolve: {
    alias: {
      '@root': path.join(__dirname, '../../src'),
      '@main': path.join(__dirname, '../../src/main'),
      '@renderer': path.join(__dirname, '../../src/renderer'),
      '@lyric': path.join(__dirname, '../../src/renderer-lyric'),
      '@static': path.join(__dirname, '../../src/static'),
      '@common': path.join(__dirname, '../../src/common'),
      // Folia 源码里的 `@/` 指向它自己的 src，即 vendor 进来的 folia-src
      '@/': path.join(__dirname, '../../src/renderer/folia-src'),
      '@': path.join(__dirname, '../../src/renderer/folia-src'),
    },
    extensions: ['.tsx', '.ts', '.js', '.json', '.node'],
  },
  module: {
    rules: [
      {
        // Folia 视觉层是 React/TSX，用 esbuild 只转译不类型检查，避免把上游类型错误带进构建
        test: /\.tsx$/,
        include: filePath => filePath.replace(/\\/g, '/').includes('/src/renderer/folia-src/'),
        use: {
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx',
            target: 'es2020',
            jsx: 'automatic',
          },
        },
      },
      {
        // 纯 .ts 文件不能用 tsx loader，否则泛型语法会被当成 JSX
        test: /\.ts$/,
        include: filePath => filePath.replace(/\\/g, '/').includes('/src/renderer/folia-src/'),
        use: {
          loader: 'esbuild-loader',
          options: {
            loader: 'ts',
            target: 'es2020',
          },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: [
          /node_modules/,
          filePath => filePath.replace(/\\/g, '/').includes('/src/renderer/folia-src/'),
        ],
        use: {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            // 只检查被引用到的文件，避免把 vendor 进来的 Folia 源码整棵树做类型检查
            onlyCompileBundledFiles: true,
            // Folia 源码由 esbuild 转译；ts-loader 只转译不做类型检查，避免上游类型错误阻断构建
            transpileOnly: true,
          },
        },
        parser: {
          worker: [
            '*audioContext.audioWorklet.addModule()',
            '...',
          ],
        },
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig,
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader',
      },
      {
        test: /\.css$/,
        oneOf: [
          // Tailwind 入口走独立的 PostCSS 配置（build-config/postcss.tailwind.config.js），
          // 完全不经过根目录的 pxtorem，否则工具类的 px 会被改写成 rem。
          {
            include: [path.join(__dirname, '../../src/renderer/ui/styles')],
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  esModule: false,
                },
              },
              {
                loader: 'css-loader',
                options: {
                  esModule: false,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    config: path.join(__dirname, '../postcss.tailwind.config.js'),
                  },
                },
              },
            ],
          },
          ...mergeCSSLoader(),
        ],
      },
      {
        test: /\.less$/,
        oneOf: mergeCSSLoader({
          loader: 'less-loader',
          options: {
            sourceMap: true,
          },
        }),
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        exclude: path.join(__dirname, '../../src/renderer/assets/svgs'),
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
        generator: {
          filename: 'imgs/[name]-[contenthash:8][ext]',
        },
      },
      {
        test: /\.svg$/,
        include: path.join(__dirname, '../../src/renderer/assets/svgs'),
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: 'icon-[name]',
            },
          },
          'svg-transform-loader',
          'svgo-loader',
        ],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
        generator: {
          filename: 'media/[name]-[contenthash:8][ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
        generator: {
          filename: 'fonts/[name]-[contenthash:8][ext]',
        },
      },
    ],
  },
  plugins: [
    new HTMLPlugin({
      filename: 'index.html',
      template: path.join(__dirname, '../../src/renderer/index.html'),
      isProd: process.env.NODE_ENV == 'production',
      browser: process.browser,
      __dirname,
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: isDev ? '[name].css' : '[name].[contenthash:8].css',
      chunkFilename: isDev ? '[id].css' : '[id].[contenthash:8].css',
    }),
    new ESLintPlugin({
      extensions: ['js', 'vue'],
      formatter: require('eslint-formatter-friendly'),
    }),
  ],
}
