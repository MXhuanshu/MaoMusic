<template>
  <button
    class="inline-flex items-center justify-center gap-1 rounded-[8px] bg-fill px-3.5 py-2 text-[13px] font-medium text-fg transition-colors duration-150 ease-ui hover:bg-raise active:bg-raise disabled:cursor-default disabled:opacity-40"
    :class="[
      outline ? 'bg-transparent hover:bg-fill' : '',
      min ? 'px-2 py-1 text-[12px]' : '',
    ]"
    tabindex="0"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    min: {
      type: Boolean,
    },
    outline: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
