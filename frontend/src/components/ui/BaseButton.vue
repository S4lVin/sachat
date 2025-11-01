<script setup>
import FeatherIcon from '@/components/ui/FeatherIcon.vue'

defineProps({
  disabled: Boolean,
  variant: String,
  icon: String,
  iconSize: { type: Number, default: 20 },
  display: { type: String, default: 'inline-flex' },
})

const variants = {
  primary: 'bg-indigo-800 hover:bg-indigo-900 justify-center p-2',
  secondary: 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-2',
  ghost: 'bg-transparent hover:bg-neutral-700 p-2',
}
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      display,
      'cursor-pointer items-center gap-2 rounded-xl transition-colors disabled:pointer-events-none disabled:opacity-50',
      variants[variant],
    ]"
  >
    <FeatherIcon v-if="icon" :name="icon" :size="iconSize" aria-hidden="true" />
    <slot />
  </button>
</template>
