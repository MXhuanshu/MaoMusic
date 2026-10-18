<template>
  <!--
    可折叠图标侧栏：收起 64px 只留图标，点顶部标识展开到 200px 露出文字。
    展开参与布局（挤压内容）而不是覆盖——覆盖会把内容区左侧的输入框和图标遮住。
  -->
  <div
    class="relative h-full shrink-0 overflow-hidden border-r border-line bg-bg transition-[width] duration-200 ease-ui"
    :class="[expanded ? 'w-[200px]' : 'w-16', isFullscreen ? '' : 'app-drag']"
  >
    <!-- 顶部：标识 + 折叠开关 -->
    <div class="mt-8 flex h-12 items-center pl-[14px]">
      <button
        type="button"
        class="app-no-drag flex h-8 items-center gap-2.5 rounded-[10px] pr-2 transition-colors duration-150 hover:bg-fill"
        :title="expanded ? '收起侧栏' : '展开侧栏'"
        @click="expanded = !expanded"
      >
        <span class="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-accent text-[13px] font-semibold text-on-accent">猫</span>
        <span
          class="whitespace-nowrap text-[13px] font-medium text-fg transition-opacity duration-150"
          :class="expanded ? 'opacity-100' : 'opacity-0'"
        >猫仙音乐</span>
      </button>
    </div>

    <!-- 导航 -->
    <nav class="app-no-drag mt-2 flex flex-col gap-1 px-2">
      <router-link
        v-for="item in menus"
        :key="item.to"
        :to="item.to"
        :title="expanded ? undefined : item.label"
        class="group relative flex h-10 items-center gap-3 rounded-[10px] pl-[14px] transition-colors duration-150"
        :class="isActive(item.name)
          ? 'bg-fill2 text-fg'
          : 'text-t2 hover:bg-fill hover:text-fg'"
      >
        <span
          class="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity duration-150"
          :class="isActive(item.name) ? 'opacity-100' : 'opacity-0'"
        />
        <component :is="item.icon" :size="19" :stroke-width="1.8" class="shrink-0" />
        <span
          class="whitespace-nowrap text-[13px] transition-opacity duration-150"
          :class="expanded ? 'opacity-100' : 'opacity-0'"
        >{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  Disc3,
  Download,
  Heart,
  Search,
  Settings,
  Trophy,
} from 'lucide-vue-next'
import { computed, ref } from '@common/utils/vueTools'
import { useRoute } from '@common/utils/vueRouter'
import { useI18n } from '@root/lang'
import { appSetting } from '@renderer/store/setting'
import { isFullscreen } from '@renderer/store'

const expanded = ref(false)
const route = useRoute()
const t = useI18n()

const menus = computed(() => [
  { to: '/search', name: 'Search', icon: Search, label: t('search'), enable: true },
  { to: '/songList/list', name: 'SongList', icon: Disc3, label: t('song_list'), enable: true },
  { to: '/leaderboard', name: 'Leaderboard', icon: Trophy, label: t('leaderboard'), enable: true },
  { to: '/list', name: 'List', icon: Heart, label: t('my_list'), enable: true },
  { to: '/download', name: 'Download', icon: Download, label: t('download'), enable: appSetting['download.enable'] },
  { to: '/setting', name: 'Setting', icon: Settings, label: t('setting'), enable: true },
].filter(item => item.enable))

const isActive = (name: string) => route.meta?.name === name
</script>
