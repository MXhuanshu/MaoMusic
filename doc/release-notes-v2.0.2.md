猫仙音乐 2.0.2 —— 进度条接入 Folia 原码

## 变更

- 播放详情底部进度条改用 **Folia 原码 ProgressBar**（React island 挂载），
  替换此前的 Vue 实现
- 进度填充/拖动/时间显示均为 Folia 原组件行为；播放时间通过 MotionValue
  直接更新，seek 回调接入猫仙播放器（window.app_event.setProgress）
- 进度条颜色跟随封面取色主题（填充 = 强调色）

## 其他

- 版本 2.0.2，更新检查仍指向本仓库 Releases

## 已知限制

- 主界面其余页面（音乐库、搜索、歌单广场、排行榜、下载）仍为此前的
  Folia 风格 Vue 实现，未替换为 Folia 原码组件
- 运行截图受环境限制未包含
