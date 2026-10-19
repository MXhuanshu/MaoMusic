# 猫仙音乐 v2.0.5

本版的核心是把「装了新版却什么都没变」的根因一次性挖出来并修掉。

## 根因：模式渲染器用了 React.lazy，打包后加载不到

Folia 每个歌词视觉模式的 `entry.tsx` 是这样写的：

```tsx
const Visualizer = React.lazy(() => import('./Visualizer'));
```

而 `VisualizerRenderer` 外层是：

```tsx
<React.Suspense fallback={null}>
```

在 Vite 开发环境下没问题，但 **Electron 打包后页面走 `file://` 协议**，webpack 产出的异步 chunk 经常解析不到路径。
chunk 永远不 resolve，`Suspense` 的 fallback 又是 `null` —— 结果就是：

- 舞台区域**完全空白**
- 歌词不显示
- 背景也不显示

这就是「完整模式没有歌词」以及之前每一轮「看起来一点没变」的真正原因，不是配色或参数问题。

**修法**：写 codemod 把 14 个模式的 `React.lazy(() => import('./X'))` 全部改写成顶层静态 `import X from './X'`。
Electron 是本地文件加载，懒加载不仅没收益，还引入了这个失败点，直接去掉最稳。

## 其他修复

- **磁贴墙歌曲无封面**：`UiSongWall` 取封面的回退链三个分支全写错了字段。猫仙在线歌曲的封面在 `meta.picUrl`，下载任务在 `metadata.musicInfo.meta.picUrl`，原来一个都没覆盖。现在先归一化再取。
- **升级后档位仍是 lite**：上一版的「自动升级」写在模块顶层，执行时机早于 `initSetting`，等于没跑。已挪进 `initSetting` 内部，配置合并之后执行。
- **进度条**：恢复原本可用的 `UiProgressBar`（拖动 / 点击 / 键盘方向键都能用）。
- **歌词模式入口**：新增 `FoliaModeSwitcher`，直接挂在播放详情舞台右上角，14 种模式点开即可切换，不用再去设置页翻。

## 验证

- `npm run build:main` / `build:renderer` / `build:renderer-lyric` 三端构建通过
- 用 `electron .` 启动真实应用，抓取渲染进程 console 输出（此前靠这一点定位到上面的根因）

## 限制（如实说明）

- 环境无 GUI 显示，无法截图做视觉验收；启动与控制台日志是实测，画面本身未过目
- 主界面其余页面（音乐库 / 搜索 / 歌单广场 / 排行榜 / 下载）仍是重构前的 Vue 实现，尚未替换为 Folia 原码
- Folia 的 Lattice（全屏可移动磁贴墙）尚未移植
