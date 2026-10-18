<template>
  <div id="container" class="view-container relative flex h-full overflow-hidden bg-bg">
    <SideRail />

    <div id="right" class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      <TitleBar />
      <layout-view id="view" class="relative mb-[72px] mt-8 min-h-0 flex-auto" />
      <FloatingPlayer />
    </div>

    <layout-icons />
    <layout-change-log-modal />
    <layout-update-modal />
    <layout-pact-modal />
    <layout-sync-mode-modal />
    <layout-sync-auth-code-modal />
    <PlayerDetail />
  </div>
</template>

<script setup>
import { onMounted } from '@common/utils/vueTools'
// import BubbleCursor from '@common/utils/cursor-effects/bubbleCursor'
// import '@common/utils/effects/snow.min'
import useApp from '@renderer/core/useApp'
import { useCoverTheme } from '@renderer/core/theme/useCoverTheme'
import SideRail from './ui/layout/SideRail.vue'
import TitleBar from './ui/layout/TitleBar.vue'
import FloatingPlayer from './ui/layout/FloatingPlayer.vue'
import PlayerDetail from './ui/features/player-detail/PlayerDetail.vue'

useApp()
// 封面取色主题。必须在 useApp() 之后：useApp 会先做主题/设置的初始化，
// 这里再接管 CSS 变量（静态主题模式下它会自动让路给旧的 applyTheme）。
useCoverTheme()

onMounted(() => {
  document.getElementById('root').style.display = 'block'

  // const styles = getComputedStyle(document.documentElement)
  // window.lxData.bubbleCursor = new BubbleCursor({
  //   fillStyle: styles.getPropertyValue('--color-primary-alpha-900'),
  //   strokeStyle: styles.getPropertyValue('--color-primary-alpha-700'),
  // })
})

// onBeforeUnmount(() => {
//   window.lxData.bubbleCursor?.destroy()
// })

</script>


<style lang="less">
@import './assets/styles/index.less';
@import './assets/styles/layout.less';

html {
  height: 100vh;
}
html, body {
  // overflow: hidden;
  box-sizing: border-box;
}

body {
  user-select: none;
  height: 100%;
}
#root {
  height: 100%;
  position: relative;
  overflow: hidden;
  color: var(--ui-fg, var(--color-font));
  background: var(--background-image) var(--background-image-position) no-repeat;
  background-size: var(--background-image-size);
  transition: background-color @transition-normal;
  background-color: var(--ui-bg, var(--color-content-background));
  box-sizing: border-box;
}

.disableAnimation * {
  transition: none !important;
  animation: none !important;
}

.transparent {
  background: transparent;
  padding: @shadow-app;
  #body {
    border-radius: 8px;
  }
  #root {
    box-shadow: 0 0 @shadow-app rgba(0, 0, 0, 0.5);
    border-radius: 8px;
  }
}
.disableTransparent {
  background-color: var(--ui-bg, var(--color-content-background));

  &.linux #body {
    border: 1px solid var(--st-line2, var(--color-primary-light-500));
  }
  &.windows:not(.windows-11, .fullscreen) #body {
    border-top: 1px solid #aaa;
  }

  #right {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
.fullscreen {
  background-color: var(--ui-bg, var(--color-content-background));

  #right {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}

#container {
  position: relative;
  display: flex;
  height: 100%;
  background-color: var(--ui-bg, var(--color-app-background));
}

#right {
  flex: auto;
  display: flex;
  flex-flow: column nowrap;
  transition: background-color @transition-normal;
  background-color: var(--ui-bg, var(--color-main-background));
  overflow: hidden;
}
#toolbar, #player {
  flex: none;
}
#view {
  position: relative;
  flex: auto;
  // display: flex;
  min-height: 0;
}

.view-container {
  transition: opacity @transition-normal;
}
#root.show-modal > .view-container {
  opacity: .9;
}
#view.show-modal > .view-container {
  opacity: .2;
}

</style>
