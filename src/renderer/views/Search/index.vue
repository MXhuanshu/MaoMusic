<template>
  <div class="relative flex h-full flex-col">
    <!-- 搜索框 -->
    <div class="app-no-drag shrink-0 px-4 pt-2">
      <UiSearchBar />
    </div>

    <!-- 音源 / 类型 -->
    <div class="flex shrink-0 items-center justify-between gap-3 px-4 pb-1 pt-1.5">
      <UiTabs
        v-model="source"
        :list="sources"
        class="min-w-0"
        @change="handleSourceChange"
      />
      <UiSegmented
        :model-value="searchType || 'music'"
        :list="searchTypes"
        @change="handleTypeChange"
      />
    </div>

    <!-- 结果 -->
    <div class="relative min-h-0 flex-1">
      <SongListList
        v-if="searchType === 'songlist'"
        v-show="searchText"
        :page="page"
        :source-id="source"
      />
      <MusicList
        v-else
        v-show="searchText"
        :page="page"
        :source-id="source"
      />
      <BlankView :visible="!searchText" :source="source" />
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from '@common/utils/vueRouter'
import { searchText } from '@renderer/store/search/state'
import { getSearchSetting, setSearchSetting } from '@renderer/utils/data'
import { sources as _sources } from '@renderer/store/search/music'

import MusicList from './MusicList/index.vue'
import SongListList from './SongListList/index.vue'
import BlankView from './components/BlankView.vue'
import { computed, ref } from '@common/utils/vueTools'
import { sourceNames } from '@renderer/store'
import UiSearchBar from '@renderer/ui/features/search/UiSearchBar.vue'
import UiSegmented from '@renderer/ui/primitives/UiSegmented.vue'
import UiTabs from '@renderer/ui/primitives/UiTabs.vue'

const source = ref('kw')
const searchType = ref(null)
const page = ref(1)

const verifyQueryParams = async(to, from, next) => {
  let _source = to.query.source
  let _type = to.query.type
  let _page = to.query.page

  if (_source == null || _type == null) {
    const setting = await getSearchSetting()
    _source ??= setting.source
    _type ??= setting.type

    next({
      path: to.path,
      query: { ...to.query, source: _source, type: _type, page: _page },
    })
    return
  }
  source.value = _source
  searchType.value = _type

  if (_page) page.value = parseInt(_page)

  if (to.query.text != null) {
    searchText.value = to.query.text
    if (!_page) page.value = 1
  }
  next()
  void setSearchSetting({ source: _source, type: _type })
}

export default {
  components: {
    MusicList,
    SongListList,
    BlankView,
    UiSearchBar,
    UiTabs,
    UiSegmented,
  },
  beforeRouteEnter: verifyQueryParams,
  beforeRouteUpdate: verifyQueryParams,
  setup() {
    const route = useRoute()
    const router = useRouter()

    const sources = _sources.map(id => {
      return {
        id,
        label: sourceNames.value[id],
      }
    })
    const handleSourceChange = (id) => {
      void router.replace({
        path: route.path,
        query: {
          ...route.query,
          source: id,
          page: 1,
        },
      })
    }

    const searchTypes = computed(() => {
      return [
        { label: window.i18n.t('search__type_music'), id: 'music' },
        { label: window.i18n.t('search__type_songlist'), id: 'songlist' },
      ]
    })
    const handleTypeChange = (type) => {
      void router.replace({
        path: route.path,
        query: {
          ...route.query,
          type,
          page: 1,
        },
      })
    }


    return {
      sources,
      source,
      handleSourceChange,
      searchTypes,
      searchType,
      handleTypeChange,
      page,
      searchText,
    }
  },
}
</script>
