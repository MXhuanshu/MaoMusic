<template>
  <div
    class="group flex items-center gap-2 rounded-[10px] border border-line bg-fill px-2.5 transition-colors duration-150 ease-ui focus-within:border-line2 focus-within:bg-fill2"
    :class="size === 'lg' ? 'h-10' : 'h-8'"
  >
    <slot name="prefix">
      <Search v-if="icon === 'search'" :size="15" :stroke-width="2" class="shrink-0 text-t3" />
    </slot>

    <input
      ref="inputRef"
      :value="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-fg outline-none placeholder:text-t3 disabled:cursor-default"
      :class="size === 'lg' ? 'text-[13.5px]' : 'text-[12.5px]'"
      @input="handleInput"
      @keydown.enter="$emit('submit')"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    >

    <button
      v-if="clearable && model"
      type="button"
      class="grid h-5 w-5 shrink-0 place-items-center rounded-full text-t3 transition-colors duration-150 hover:bg-raise hover:text-fg"
      aria-label="clear"
      @click="handleClear"
    >
      <X :size="13" :stroke-width="2.2" />
    </button>

    <slot name="suffix" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from '@common/utils/vueTools'
import { Search, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  type?: string
  size?: 'md' | 'lg'
  icon?: 'search' | 'none'
  clearable?: boolean
  disabled?: boolean
}>(), {
  modelValue: '',
  placeholder: '',
  type: 'text',
  size: 'md',
  icon: 'none',
  clearable: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  clear: []
  focus: []
  blur: []
}>()

const model = ref(props.modelValue)
const inputRef = ref<HTMLInputElement>()

watch(() => props.modelValue, (value) => {
  if (value !== model.value) model.value = value
})

const handleInput = (event: Event) => {
  model.value = (event.target as HTMLInputElement).value
  emit('update:modelValue', model.value)
}

const handleClear = () => {
  model.value = ''
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>
