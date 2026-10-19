# 猫仙音乐 v2.0.8

## 完整模式下看不到歌词：加渲染兜底

### 原因

Folia 的歌词视觉模式是 `React.lazy` + `<Suspense fallback={null}>`：

```tsx
const Visualizer = React.lazy(() => import('./Visualizer'));
...
<React.Suspense fallback={null}>
```

只要这个 lazy 组件没能 resolve（异步 chunk 未就绪、WebGL 不可用、模式初始化抛错），
Suspense 的 fallback 就是 `null` —— **舞台区域一片空白，一个字都不显示**。

而播放详情页原来的逻辑是：完整档位且有歌词时，把平面 `LyricPlayer` 隐藏、
完全交给 Folia 舞台渲染。于是 Folia 一旦不出内容，歌词就彻底消失，
用户看到的就是「视觉模式没有歌词」。

### 改法

让舞台把「我真的渲染出东西了吗」告诉调用方，调用方据此决定是否退回平面歌词。

`FoliaStage.vue`：

```ts
// 渲染后延迟 500ms 检查容器里是否有实际内容，回传结果
const reportRendered = () => {
  if (reportTimer) clearTimeout(reportTimer)
  reportTimer = setTimeout(() => {
    const el = dom_stage.value
    emit('rendered', !!el && el.childElementCount > 0)
  }, 500)
}
```

`PlayerDetail.vue`：

```js
const foliaRendered = ref(true)
const handleFoliaRendered = (ok) => { foliaRendered.value = ok }
// 非完整档位 / 没有歌词 / Folia 舞台没渲染出内容 —— 三者任一就显示平面歌词
const showFlatLyric = computed(() =>
  visualizerMode.value !== 'full' || !lyric.lines.length || !foliaRendered.value)
```

效果：
- Folia 舞台正常出内容 → 显示 Folia 自己的歌词舞台，平面歌词隐藏（不重复）
- Folia 舞台空白 / 报错 / WebGL 不可用 → 自动退回平面歌词，**保证一定看得到歌词**

同时 `render()` 每次重新渲染后都会重新检查，切换模式后会重新判定。

## 验证

- `npm run build:renderer` 构建通过（2 warnings，0 errors）

## 已知限制

- 环境无 GUI，无法截图。本版是「兜底保证有歌词」，并不等于 Folia 的 14 种歌词排版
  已经被逐一目视确认——如果舞台能正常出内容，歌词由 Folia 渲染；
  如果不能，会看到猫仙自己的平面歌词。
- 主界面其余页面仍为重构前的 Vue 实现
- Folia Lattice（全屏可移动磁贴墙）尚未移植
