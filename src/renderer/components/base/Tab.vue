<template>
  <ul
    class="flex flex-row flex-nowrap gap-6 px-4 text-[12px]"
    :class="align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'"
    role="tablist"
  >
    <li
      v-for="item in list"
      :key="item[itemKey]"
      class="block cursor-pointer transition-colors duration-150 ease-ui hover:text-accent"
      :class="modelValue == item[itemKey] ? 'cursor-default text-accent' : 'text-t2'"
      tabindex="-1"
      role="tab"
      :aria-label="item[itemLabel]"
      ignore-tip
      :aria-selected="modelValue == item[itemKey]"
      @click="handleToggle(item[itemKey])"
    >
      <span
        class="relative block px-0 py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-accent after:transition-all after:duration-150 after:ease-ui"
        :class="modelValue == item[itemKey] ? 'after:translate-y-0 after:opacity-100' : 'after:translate-y-[-4px] after:opacity-0'"
      >{{ item[itemLabel] }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      },
    },
    align: {
      type: String,
      default: 'left',
    },
    itemKey: {
      type: String,
      default: 'id',
    },
    itemLabel: {
      type: String,
      default: 'label',
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const handleToggle = id => {
      if (id == props.modelValue) return
      emit('update:modelValue', id)
      emit('change', id)
    }

    return {
      handleToggle,
    }
  },
}
</script>
