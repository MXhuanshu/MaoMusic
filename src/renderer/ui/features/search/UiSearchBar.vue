<template>
  <div class="relative w-full">
    <UiTextField
      v-model="searchText"
      size="lg"
      icon="search"
      clearable
      :placeholder="placeholder"
      @submit="handleSearch"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- 搜索建议：与旧 Toolbar 的 SearchInput 同一套 tipSearch 逻辑 -->
    <Transition
      enter-active-class="transition duration-150 ease-ui"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-ui"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="visibleList && tipList.length"
        class="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[12px] border border-line bg-menu py-1 shadow-[0_16px_40px_rgba(0,0,0,0.36)]"
      >
        <button
          v-for="(item, index) in tipList"
          :key="item + index"
          type="button"
          class="flex w-full items-center gap-2 px-3 py-[7px] text-left text-[12.5px] text-t2 transition-colors duration-100 hover:bg-fill hover:text-fg"
          @mousedown.prevent="handleTipClick(index)"
        >
          <Search :size="13" :stroke-width="2" class="shrink-0 text-t3" />
          <span class="truncate">{{ item }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from '@common/utils/vueTools'
import { useRoute, useRouter } from '@common/utils/vueRouter'
import { Search } from 'lucide-vue-next'
import { debounce } from '@common/utils'
import music from '@renderer/utils/musicSdk'
import { appSetting } from '@renderer/store/setting'
import { searchText as _searchText } from '@renderer/store/search/state'
import { setSearchText } from '@renderer/store/search/action'
import { getSearchSetting } from '@renderer/utils/data'
import UiTextField from '../../primitives/UiTextField.vue'

const route = useRoute()
const router = useRouter()

const searchText = ref('')
const visibleList = ref(false)
const tipList = ref<string[]>([])
let isFocused = false
let prevTempSearchSource = ''

const placeholder = computed(() => `${window.i18n.t('search')}…`)

watch(() => route.name, (newValue, oldValue) => {
  if (oldValue == 'Search' && newValue != 'SongListDetail') {
    setTimeout(() => {
      if (appSetting['odc.isAutoClearSearchInput'] && searchText.value) searchText.value = ''
      if (appSetting['odc.isAutoClearSearchList']) setSearchText('')
    })
  }
})

watch(_searchText, (newValue) => {
  searchText.value = newValue
})

watch(searchText, () => {
  handleTipSearch()
})

/** musicSdk 是按音源 id 索引的聚合对象，类型上没有 index signature，这里显式收窄 */
const getSdk = (source: string) => (music as unknown as Record<string, any>)[source]

const tipSearch = debounce(async() => {
  if (searchText.value === '' && prevTempSearchSource) {
    tipList.value = []
    getSdk(prevTempSearchSource)?.tipSearch.cancelTipSearch()
    return
  }
  const { temp_source } = await getSearchSetting()
  prevTempSearchSource ||= temp_source
  getSdk(prevTempSearchSource).tipSearch.search(searchText.value).then((list: string[]) => {
    tipList.value = list
  }).catch(() => {})
}, 50)

const handleTipSearch = () => {
  if (!visibleList.value && isFocused) visibleList.value = true
  tipSearch()
}

const handleSearch = () => {
  visibleList.value = false
  if (!searchText.value && route.path != '/search') {
    setSearchText('')
    return
  }
  setTimeout(() => {
    void router.push({
      path: '/search',
      query: { text: searchText.value },
    }).catch(() => {})
  }, searchText.value ? 200 : 0)
}

const handleFocus = () => {
  isFocused = true
  visibleList.value = true
  if (searchText.value) handleTipSearch()
}

const handleBlur = () => {
  isFocused = false
  setTimeout(() => {
    visibleList.value = false
  }, 120)
}

const handleTipClick = (index: number) => {
  searchText.value = tipList.value[index]
  void nextTick(handleSearch)
}
</script>
