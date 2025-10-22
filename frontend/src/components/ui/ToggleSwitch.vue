<script setup>
defineEmits(['toggle'])
defineProps({
  value: Boolean,
})
</script>

<template>
  <button
    @click="$emit('toggle')"
    :class="[
      'relative inline-flex h-6 w-12 cursor-pointer items-center rounded-xl transition-colors',
      value ? 'bg-indigo-900' : 'bg-neutral-700',
    ]"
  >
    <!-- Thumb -->
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-xl bg-white transition-transform',
        value ? 'translate-x-7' : 'translate-x-1',
      ]"
    ></span>
  </button>
</template>
