# 猫仙音乐 · MaoMusic

> 把喜欢的歌，放进一片会呼吸的夜色里。

猫仙音乐是一款**从界面到交互完全重做**的桌面音乐播放器：保留成熟的音乐源与播放内核，重写全部视觉层，用封面取色做主题、用 3D 歌词做舞台。

它兼容 LX Music 的音乐源与自定义源，但**不是 LX Music 的皮肤版**——界面、组件、主题系统、视觉引擎都是重新实现的，与旧版不共享任何 UI 代码。

- 作者：MXhuanshu（猫仙）
- 当前版本：**2.0.7**
- 平台：Windows 10 / 11（x64）
- 许可：AGPL-3.0（视觉层复用 Folia，详见 NOTICE）

---

## 它长什么样

- **近黑玻璃质感**：侧栏、标题栏、播放条、弹窗统一使用半透明玻璃与细描边，亮暗随系统切换。
- **封面取色主题**：播放时从封面提取主色与强调色，整窗的强调色、选中态、歌词高亮会跟着歌变，不再需要手动挑皮肤。
- **全屏音乐磁贴**：播放详情页默认把当前播放队列的封面铺成一面缓慢流动的磁贴墙。
- **3D 歌词走廊**：完整视觉档位下，歌词逐词立在纵深里，随节拍点亮，镜头跟随当前行推进。
- **星野背景**：不想看磁贴时，可以在设置里切成跟随封面取色的星空。
- **桌面歌词窗**：独立窗口，深色胶囊控制条，可锁定穿透，与主窗共用同一套主题令牌。

## 功能

**播放**
- 本地歌曲 + 在线音乐源播放，支持 LX Music 自定义源
- 播放队列、下一首播放、播放模式（顺序 / 单曲 / 随机）、倍速、音量
- 全屏播放详情：磁贴墙 / 星野背景、3D 歌词、评论、歌曲信息
- 桌面歌词：字体、颜色、透明度、对齐、锁定、双行
- 音频可视化、音效（均衡器、卷积、环绕、变调）

**音乐库**
- 我的列表、收藏、最近播放、下载管理
- 歌单广场、排行榜、搜索（歌曲 / 歌单 / 专辑）
- 歌单导入、列表排序、重复歌曲清理、歌曲标签编辑

**系统**
- 封面取色主题，跟随系统明暗
- 全局快捷键、托盘控制、深链 `maomusic://`
- 数据备份与恢复、WebDAV / 局域网同步
- 检查更新：直接读取本仓库的 GitHub Releases

## 安装

1. 打开 [Releases](https://github.com/MXhuanshu/MaoMusic/releases)；
2. 下载 `MaoMusic-2.0.7-x64-setup.exe`；
3. 双击安装。安装包未做代码签名，Windows SmartScreen 若提示「未知发布者」，选择「更多信息 → 仍要运行」；
4. 安装位置默认 `%LOCALAPPDATA%\Programs\猫仙音乐`，按当前用户安装，不需要管理员权限。

> 从旧版（LX Music）升级：首次启动会自动把 `%APPDATA%\lx-music-desktop` 下的歌单、设置、缓存复制到 `%APPDATA%\maomusic`，原目录保留不删。

## 使用说明

- **打开播放详情**：点击底部播放条封面，或使用全局快捷键。
- **切换视觉**：设置 → 播放详情 → 视觉风格（关闭 / 轻量 / 完整）；背景可在「磁贴墙 / 星野」之间切换。
- **换主题**：不需要手动选皮肤。主题跟随封面取色，设置 → 基础 → 明暗模式控制亮暗。
- **桌面歌词**：设置 → 桌面歌词，或播放详情里的字幕按钮。

## 数据位置

| 内容 | 路径 |
|---|---|
| 用户数据 | `%APPDATA%\maomusic` |
| 歌曲数据 | `%APPDATA%\maomusic\LxDatas` |
| 下载目录 | 设置 → 下载 中配置 |

便携版：在程序目录放一个 `portable` 文件夹，数据会写到 `portable\userData`。

## 开发

```bash
# 需要 Node.js 22+
npm install
npm run dev            # 启动开发环境
npm run build:renderer # 只构建渲染进程
npm run pack:win:setup:x64  # 构建并打 Windows 安装包
```

技术栈：Electron 42 · Vue 3 · TypeScript · webpack 5 · Tailwind CSS 4 · three.js · lucide。

目录结构：

```
src/main            主进程（窗口、IPC、播放器、数据库）
src/renderer        主窗口（ui/ 为新界面与视觉引擎）
src/renderer-lyric  桌面歌词窗
src/common          跨进程共享的类型与工具
build-config        构建与打包配置
resources           NSIS 安装界面资源与图标
```

新增界面请使用 `src/renderer/ui/` 下的原语与设计令牌（`ui/styles/tokens.css`），不要再写 `$style` 或新增 Less Modules。

## 与 LX Music 的关系

猫仙音乐的音乐源协议、自定义源机制与部分底层业务能力来自 LX Music（Apache-2.0）。界面、主题、视觉与设置系统为本项目重写，因此：

- 兼容 LX Music 的音乐源与自定义源脚本；
- 不继承 LX Music 的界面、皮肤与主题市场；
- 更新只从本仓库发布，不会覆盖为其他项目的版本。

## 与 Folia 的关系

播放详情的沉浸式歌词舞台（14 种歌词视觉模式、6 种背景模式、封面取色主题混合、模式切换转场）**直接复用 Folia 项目的源代码**，位于 `src/renderer/folia-src/`，通过 React island 挂载在 Vue 页面中。

- Folia 项目：https://github.com/chthollyphile/folia-major
- Folia 许可证：AGPL-3.0
- 因此本项目整体以 **AGPL-3.0** 发布，详见 [NOTICE](./NOTICE)

歌词视觉模式：经典 / 华彩 / 阿卡贝拉 / 克拉达 / 立体景 / 烟雾 / 光晕 / 莫奈 / 帕蒂塔 / 摆钟 / 十四行诗 / 静物 / 蛋彩 / 倾斜
背景模式：星野 / 潜影 / 莫奈 / 游牧 / 通用 / 自定义

## 反馈

- 问题与建议：[Issues](https://github.com/MXhuanshu/MaoMusic/issues)
- 作者：MXhuanshu（猫仙）

## 许可

[AGPL-3.0](./LICENSE) — 见 [NOTICE](./NOTICE) 了解第三方来源与修改说明
