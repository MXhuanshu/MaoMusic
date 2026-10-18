<template>
  <!-- Folia 设置窗：左侧分类导航 + 右侧滚动面板。
       根节点必须是单一元素，否则父组件传进来的 class 无法继承。 -->
  <div class="flex h-full overflow-hidden">
    <!-- 分类导航 -->
    <nav class="ui-scroll w-[190px] shrink-0 overflow-y-auto border-r border-line pb-2">
      <div class="flex h-12 shrink-0 items-center px-4">
        <h2 class="text-[13px] font-medium text-fg">{{ $t('setting') }}</h2>
      </div>

      <div class="flex flex-col gap-0.5 px-2">
        <button
          v-for="item in tocList"
          :key="item.id"
          type="button"
          class="flex h-8 items-center rounded-[8px] px-2.5 text-[12.5px] transition-colors duration-100"
          :class="avtiveComponentName == item.id
            ? 'bg-fill2 font-medium text-fg'
            : 'text-t2 hover:bg-fill hover:text-fg'"
          @click="toggleTab(item.id)"
        >
          <component :is="item.icon" :size="14" :stroke-width="2" class="mr-2 shrink-0" />
          <span class="truncate">{{ item.title }}</span>
        </button>
      </div>
    </nav>

    <!-- 面板内容 -->
      <div ref="dom_content_ref" class="ui-scroll min-w-0 flex-1 overflow-y-auto">
        <component :is="avtiveComponentName" />
      </div>
  </div>
</template>

<script>
import { computed, nextTick, ref } from '@common/utils/vueTools'
import {
  ArrowLeftRight,
  Bookmark,
  CloudDownload,
  Download,
  Info,
  Keyboard,
  Languages,
  ListMusic,
  Monitor,
  Music,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  Sparkles,
} from 'lucide-vue-next'
import { useI18n } from '@renderer/plugins/i18n'
import { useRoute } from '@common/utils/vueRouter'

import SettingBasic from './components/SettingBasic.vue'
import SettingPlay from './components/SettingPlay.vue'
import SettingPlayDetail from './components/SettingPlayDetail.vue'
import SettingDesktopLyric from './components/SettingDesktopLyric.vue'
import SettingSearch from './components/SettingSearch.vue'
import SettingList from './components/SettingList.vue'
import SettingDownload from './components/SettingDownload.vue'
import SettingSync from './components/SettingSync/index.vue'
import SettingOpenAPI from './components/SettingOpenAPI.vue'
import SettingHotKey from './components/SettingHotKey.vue'
import SettingNetwork from './components/SettingNetwork.vue'
import SettingOdc from './components/SettingOdc.vue'
import SettingBackup from './components/SettingBackup.vue'
import SettingOther from './components/SettingOther.vue'
import SettingUpdate from './components/SettingUpdate.vue'
import SettingAbout from './components/SettingAbout.vue'

export default {
  name: 'Setting',
  components: {
    SettingBasic,
    SettingPlay,
    SettingPlayDetail,
    SettingDesktopLyric,
    SettingSearch,
    SettingList,
    SettingDownload,
    SettingSync,
    SettingOpenAPI,
    SettingHotKey,
    SettingNetwork,
    SettingOdc,
    SettingBackup,
    SettingOther,
    SettingUpdate,
    SettingAbout,
  },
  setup() {
    const t = useI18n()
    const route = useRoute()

    const dom_content_ref = ref(null)

    const tocList = computed(() => {
      return [
        { id: 'SettingBasic', title: t('setting__basic'), icon: Settings2 },
        { id: 'SettingPlay', title: t('setting__play'), icon: Music },
        { id: 'SettingPlayDetail', title: t('setting__play_detail'), icon: Sparkles },
        { id: 'SettingDesktopLyric', title: t('setting__desktop_lyric'), icon: Monitor },
        { id: 'SettingSearch', title: t('setting__search'), icon: Search },
        { id: 'SettingList', title: t('setting__list'), icon: ListMusic },
        { id: 'SettingDownload', title: t('setting__download'), icon: Download },
        { id: 'SettingHotKey', title: t('setting__hot_key'), icon: Keyboard },
        { id: 'SettingSync', title: t('setting__sync'), icon: RefreshCw },
        { id: 'SettingOpenAPI', title: t('setting__open_api'), icon: Share2 },
        { id: 'SettingNetwork', title: t('setting__network'), icon: CloudDownload },
        { id: 'SettingOdc', title: t('setting__odc'), icon: Languages },
        { id: 'SettingBackup', title: t('setting__backup'), icon: Bookmark },
        { id: 'SettingOther', title: t('setting__other'), icon: ArrowLeftRight },
        { id: 'SettingUpdate', title: t('setting__update'), icon: RefreshCw },
        { id: 'SettingAbout', title: t('setting__about'), icon: Info },
      ]
    })

    const avtiveComponentName = ref(route.query.name && tocList.value.some(t => t.id == route.query.name)
      ? route.query.name
      : tocList.value[0].id)

    const toggleTab = id => {
      avtiveComponentName.value = id
      void nextTick(() => {
        dom_content_ref.value?.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      })
    }

    return {
      tocList,
      avtiveComponentName,
      toggleTab,
      dom_content_ref,
    }
  },
}
</script>
