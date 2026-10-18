<template>
  <Modal :show="visible" :close-btn="false" :teleport="teleport" @close="handleCancel" @after-leave="afterLeave">
    <main class="min-h-[40px] min-w-[220px] flex-auto whitespace-pre-line p-4 pt-3 text-[14px] leading-relaxed" :class="selection ? 'select-text' : ''">{{ message }}</main>
    <footer class="flex flex-none flex-row flex-nowrap justify-end gap-3 p-4">
      <Btn v-if="showCancel" @click="handleCancel">{{ cancelBtnText }}</Btn>
      <Btn @click="handleComfirm">{{ confirmBtnText }}</Btn>
    </footer>
  </Modal>
</template>

<script>
import Modal from '@renderer/components/material/Modal.vue'
import Btn from '@renderer/components/base/Btn.vue'
import { useI18n } from '@renderer/plugins/i18n'
import { computed } from '@common/utils/vueTools'
export default {
  components: {
    Modal,
    Btn,
  },
  props: {
    afterLeave: {
      type: Function,
      default: () => {},
    },
  },
  setup() {
    const t = useI18n()

    const defaultBtnTexts = computed(() => {
      return {
        confirm: t('confirm_button_text'),
        cancel: t('cancel_button_text'),
      }
    })

    return {
      defaultBtnTexts,
    }
  },
  data() {
    return {
      visible: false,
      message: '',
      showCancel: false,
      cancelButtonText: '',
      confirmButtonText: '',
      teleport: '#root',
      selection: false,
    }
  },
  computed: {
    cancelBtnText() {
      return this.cancelButtonText || this.defaultBtnTexts.cancel
    },
    confirmBtnText() {
      return this.confirmButtonText || this.defaultBtnTexts.confirm
    },
  },
  beforeUnmount() {
    const el = this.$el
    el.parentNode.removeChild(el)
  },
  methods: {
    handleCancel() {
    },
    handleComfirm() {
    },
  },
}
</script>
