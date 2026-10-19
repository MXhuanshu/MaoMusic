# 猫仙音乐 v2.0.7

## 修复：歌词视觉模式点了没反应

根因在设置状态的写入方式。

`src/renderer/store/setting.ts` 里的 `updateSetting` **只往主进程发 IPC，不更新渲染进程自己的 `appSetting`**：

```ts
export const updateSetting = (setting) => {
  void saveSetting(setting)   // 只有发出去，没有本地生效
}
```

于是所有设置项能否立刻变化，完全依赖主进程把新值广播回渲染进程
（`updated_config` → `sendConfigChange` → `mergeSetting`）。这条异步链路有两个已知断点：

1. **启动期丢失**：`initSetting` 在 `main.ts` 里于 `app.mount()` 之前调用，
   而注册 `onSettingChanged` 的 `useApp()` 要等挂载之后才跑。
   启动阶段发出的更新广播没有任何监听者接收，本次会话收不到。
2. **值没变就不广播**：主进程 `update_config` 里
   `if (!updatedSettingKeys.length) return`，值相同时直接返回。

这直接导致歌词视觉模式切不动——设置值确实写进了磁盘，
但渲染进程里的 `appSetting['playDetail.visualizerMode']` 一直没变，
而 Folia 舞台和模式切换器都是读这个值来决定渲染的。

顺带也解释了「升级后还是 lite 档位」为什么时好时坏：
那次的迁移也是通过 `updateSetting` 写的，正好踩在第 1 个断点上。

## 改法

`updateSetting` 先合并到本地 `appSetting`，再发 IPC 写盘：

```ts
export const updateSetting = (setting) => {
  mergeSetting(setting)        // 本地立即生效，UI 立即响应
  void saveSetting(setting)    // 再持久化到主进程
}
```

主进程广播回来的值与本地一致，是幂等的，不影响原有行为。
所有设置项（开关、下拉、滑块、歌词视觉模式、背景模式、调优参数）从此都是点击即响应。

## 验证

- `npm run build:renderer` 构建通过（2 warnings，0 errors）
- 主进程广播链路已逐段核对：`set_app_setting` → `update_config` → `updated_config` → `sendConfigChange`

## 已知限制

- 环境无 GUI，无法截图；改动仅经过构建验证
- 主界面其余页面仍为重构前的 Vue 实现，未使用 Folia 原码
- Folia Lattice（全屏可移动磁贴墙）尚未移植
