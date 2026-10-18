<template>
  <div class="relative flex h-full flex-col">
    <!-- 头部：封面 + 标题 + 操作 -->
    <div class="relative shrink-0 overflow-hidden">
      <img
        v-if="picUrl || listDetailInfo.info.img"
        :src="picUrl || listDetailInfo.info.img"
        class="absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-3xl"
      >
      <div class="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/75 to-bg" />

      <div class="relative flex items-end gap-4 p-4">
        <div class="h-28 w-28 shrink-0 overflow-hidden rounded-[14px] bg-fill2 shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
          <img
            v-if="picUrl || listDetailInfo.info.img"
            :src="picUrl || listDetailInfo.info.img"
            class="h-full w-full object-cover"
            decoding="async"
          >
          <div v-else class="grid h-full w-full place-items-center text-t3">
            <Music2 :size="26" :stroke-width="1.6" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <h3 class="truncate text-[17px] font-semibold text-fg" :title="listDetailInfo.info.name">
            {{ listDetailInfo.info.name }}
          </h3>
          <p v-if="listDetailInfo.info.desc" class="mt-1 line-clamp-2 text-[12px] leading-relaxed text-t2" :title="listDetailInfo.info.desc">
            {{ listDetailInfo.info.desc }}
          </p>

          <div class="mt-3 flex items-center gap-2">
            <UiButton
              variant="primary"
              size="sm"
              :disabled="!!listDetailInfo.noItemLabel"
              @click="playSongListDetail(listDetailInfo.id, listDetailInfo.source, listDetailInfo.list)"
            >
              <Play :size="13" :stroke-width="2" fill="currentColor" />
              {{ $t('list__play') }}
            </UiButton>
            <UiButton
              variant="secondary"
              size="sm"
              :disabled="!!listDetailInfo.noItemLabel"
              @click="addSongListDetail(listDetailInfo.id, listDetailInfo.source, listDetailInfo.info.name)"
            >
              <FolderPlus :size="13" :stroke-width="2" />
              {{ $t('list__collect') }}
            </UiButton>
            <UiButton variant="ghost" size="sm" @click="handleBack">
              <ArrowLeft :size="13" :stroke-width="2" />
              {{ $t('back') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="relative min-h-0 flex-1">
      <UiOnlineList
        ref="listRef"
        :page="listDetailInfo.page"
        :limit="listDetailInfo.limit"
        :total="listDetailInfo.total"
        :list="listDetailInfo.list"
        :no-item="listDetailInfo.noItemLabel"
        @play-list="handlePlayList"
        @toggle-page="togglePage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch } from '@common/utils/vueTools'
import { listDetailInfo } from '@renderer/store/songList/state'
import { setVisibleListDetail } from '@renderer/store/songList/action'
import { useRouter } from '@common/utils/vueRouter'
import { addSongListDetail, playSongListDetail } from './action'
import useList from './useList'
import useKeyBack from './useKeyBack'
import { ArrowLeft, FolderPlus, Music2, Play } from 'lucide-vue-next'
import UiButton from '@renderer/ui/primitives/UiButton.vue'
import UiOnlineList from '@renderer/ui/features/search/UiOnlineList.vue'


const source = ref<LX.OnlineSource>('kw')
const id = ref<string>('')
const page = ref<number>(1)
const picUrl = ref<string>('')
const refresh = ref<boolean>(false)


interface Query {
  source?: string
  id?: string
  page?: string
  picUrl?: string
  refresh?: 'true'
  fromName?: string
}

const verifyQueryParams = async function(this: any, to: { query: Query, path: string }, from: any, next: (route?: { path: string, query: Query }) => void) {
  let _source = to.query.source
  let _id = to.query.id
  let _page: string | undefined = to.query.page
  let _picUrl: string | undefined = to.query.picUrl
  let _refresh: 'true' | undefined = to.query.refresh

  if (_source == null || _id == null) {
    if (listDetailInfo.key) {
      _source = listDetailInfo.source
      _id = listDetailInfo.id
      _page = listDetailInfo.page.toString()
      _picUrl = listDetailInfo.info.img
    } else {
      setVisibleListDetail(false)
      next({ path: '/songList/list', query: {} })
      return
    }

    next({
      path: to.path,
      query: { ...to.query, source: _source, id: _id, page: _page, picUrl: _picUrl, refresh: _refresh },
    })
    return
  }
  next()
  setVisibleListDetail(true)
  source.value = _source as LX.OnlineSource
  id.value = _id
  page.value = _page ? parseInt(_page) : 1
  picUrl.value = _picUrl ?? ''
  refresh.value = _refresh ? _refresh == 'true' : false
  if (to.query.fromName) window.lx.songListInfo.fromName = to.query.fromName
}


export default {
  components: {
    UiButton,
    UiOnlineList,
    ArrowLeft,
    FolderPlus,
    Music2,
    Play,
  },
  beforeRouteEnter: verifyQueryParams,
  beforeRouteUpdate: verifyQueryParams,
  setup() {
    const router = useRouter()

    const {
      listRef,
      listDetailInfo,
      getListData,
      handlePlayList,
    } = useList()


    const togglePage = (page: number) => {
      void getListData(source.value, id.value, page, refresh.value)
    }

    const handleBack = () => {
      setVisibleListDetail(false)
      if (window.lx.songListInfo.fromName) void router.replace({ name: window.lx.songListInfo.fromName })
      else router.back()
    }

    useKeyBack(handleBack)

    watch([source, id, page, refresh], async([_source, _id, _page, _refresh]) => {
      if (!_source || !_id) return router.replace({ path: '/songList/list' })
      // console.log(_source, _id, _page, _refresh, picUrl.value)
      // source.value = _source
      // id.value = _id
      // refresh.value = _refresh
      // page.value = _page ?? 1
      void getListData(_source, _id, _page, _refresh)
    }, {
      immediate: true,
    })

    return {
      source,
      id,
      page,
      picUrl,
      listDetailInfo,
      listRef,
      togglePage,
      addSongListDetail,
      playSongListDetail,
      handlePlayList,
      handleBack,
    }
  },
}
</script>
