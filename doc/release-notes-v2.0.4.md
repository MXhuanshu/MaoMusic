# 猫仙音乐 v2.0.4

本版修掉三个「为什么装了新版跟以前一样」的真实 bug。

## 1. 磁贴墙歌曲没有封面

`ui/primitives/UiSongWall.vue` 里取封面的回退链写错了三个分支：

```ts
// 之前（全是错的字段）
item?.pic ?? item?.musicInfo?.pic ?? item?.metadata?.picUrl
```

猫仙的歌曲对象实际是这个形状：

```ts
// 在线歌曲 MusicInfo
{ name, singer, meta: { picUrl, albumName } }
// 播放器扁平化 musicInfo
{ name, singer, pic, album }
// 下载任务 DownloadTask
{ metadata: { musicInfo: { name, singer, meta: { picUrl } } } }
```

三种形态里封面分别在 `meta.picUrl` / `pic` / `metadata.musicInfo.meta.picUrl`，原来一个都没覆盖到，
所以整面墙全是占位灰块。现在按 `metadata.musicInfo → musicInfo → item` 归一化后再取，
歌名和歌手也走同一套回退，下载列表不再出现空标题。

## 2. 升级后 Folia 舞台不挂载（上一版的修复是废的）

v1.x 的播放详情视觉档位默认是 `lite`（纯 CSS 渐变），老用户的配置文件里存着这个值，
而 Folia 舞台只在 `full` 时挂载 —— 结果就是装了 2.0 却完全看不到变化。

上一版我写了「一次性把 lite 升级为 full」的迁移，但放在了 `useVisualizerMode.ts` 的**模块顶层**。
模块顶层代码在 import 阶段就执行完了，那时 `initSetting` 还没把用户配置从主进程读回来，
判断时读到的是默认值，直接跳过 —— 等于没修。

现在把迁移挪进 `store/setting.ts` 的 `initSetting`，在配置合并**之后**执行：

```ts
export const initSetting = (newSetting: LX.AppSetting) => {
  mergeSetting(newSetting)
  migrateVisualizerPreference()
}
```

只跑一次；之后在设置里手动改回「精简」不会被覆盖。

## 3. 恢复可拖拽的进度条

之前把底部进度条换成了 React island 版的 Folia `ProgressBar`。它自带时间标签，
和详情页 footer 已有的时间标签重复，而且我无法在这个环境确认它真的渲染出来了。
先用回原本可用的 `UiProgressBar`（支持拖动、点击、键盘左右键），保证功能正确。

## 已知限制

- 这个环境没有 GUI，我无法启动应用截图核对，以上改动只经过构建验证
- 播放详情页的 Folia 舞台仍然只在「视觉风格 = 完整」时挂载
