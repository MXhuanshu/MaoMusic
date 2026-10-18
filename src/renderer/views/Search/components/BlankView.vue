<template>
  <Transition
    enter-active-class="transition duration-200 ease-ui"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-150 ease-ui"
    leave-to-class="opacity-0"
  >
    <div v-show="visible" class="absolute inset-0 overflow-hidden">
      <!-- 热门 / 历史 -->
      <div
        v-if="showHotSearch || (showHistory && historyList.length)"
        class="ui-scroll h-full px-6 py-4"
      >
        <section v-if="showHotSearch" class="mb-5">
          <h3 class="mb-2.5 text-[12.5px] font-medium text-t3">{{ $t('search__hot_search') }}</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(item, index) in hotSearchList"
              :key="index"
              type="button"
              class="max-w-[180px] truncate rounded-full bg-fill px-3 py-1.5 text-[12.5px] text-t2 transition-colors duration-150 hover:bg-fill2 hover:text-fg"
              @click="handleSearch(item)"
            >{{ item }}</button>
          </div>
        </section>

        <section v-if="showHistory && historyList.length">
          <div class="mb-2.5 flex items-center gap-2">
            <h3 class="text-[12.5px] font-medium text-t3">{{ $t('history_search') }}</h3>
            <button
              type="button"
              class="grid h-6 w-6 place-items-center rounded-full text-t3 transition-colors duration-150 hover:bg-fill hover:text-fg"
              :aria-label="$t('history_clear')"
              @click="clearHistoryList"
            >
              <Eraser :size="13" :stroke-width="2" />
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(item, index) in historyList"
              :key="index + item"
              type="button"
              class="max-w-[180px] truncate rounded-full bg-fill px-3 py-1.5 text-[12.5px] text-t2 transition-colors duration-150 hover:bg-fill2 hover:text-fg"
              :aria-label="$t('history_remove')"
              @contextmenu.prevent="removeHistoryWord(index)"
              @click="handleSearch(item)"
            >{{ item }}</button>
          </div>
        </section>
      </div>

      <!-- 欢迎语 -->
      <div v-else class="flex h-full items-center justify-center px-6">
        <p class="text-center text-[17px] text-t3">{{ $t('search__welcome') }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, shallowRef, watch } from '@common/utils/vueTools'
import { Eraser } from 'lucide-vue-next'
import { historyList } from '@renderer/store/search/state'
import { getHistoryList, removeHistoryWord, clearHistoryList } from '@renderer/store/search/action'
import { getList } from '@renderer/store/hotSearch'
import { appSetting } from '@renderer/store/setting'
import { useRouter } from '@common/utils/vueRouter'

const props = defineProps({
  visible: Boolean,
  source: {
    type: String,
    required: true,
  },
})

const showHotSearch = computed(() => appSetting['search.isShowHotSearch'])
const showHistory = computed(() => appSetting['search.isShowHistorySearch'])

const hotSearchList = shallowRef([])

if (appSetting['search.isShowHotSearch']) {
  watch(() => props.visible, (visible) => {
    if (!visible) return
    void getList(props.source).then(list => {
      hotSearchList.value = list
    })
  }, {
    immediate: true,
  })

  watch(() => props.source, (source) => {
    if (!props.visible) return
    void getList(source).then(list => {
      if (source != props.source) return
      hotSearchList.value = list
    })
  })
}

if (appSetting['search.isShowHistorySearch']) {
  void getHistoryList()
}

const router = useRouter()
const handleSearch = (text) => {
  void router.replace({
    path: '/search',
    query: {
      text,
    },
  })
}
</script>
