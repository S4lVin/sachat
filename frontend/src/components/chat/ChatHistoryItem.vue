<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <div class="group mb-2 flex items-center justify-between gap-x-2">
    <div
      @click="$emit('select')"
      class="w-full cursor-pointer truncate rounded-lg p-2 hover:bg-neutral-700"
      :class="selected ? 'bg-neutral-700' : ''"
    >
      {{ title }}
    </div>
    <button class="hidden cursor-pointer group-hover:inline hover:text-neutral-300">
      <feather-icons name="more-vertical" />
    </button>
  </div>
</template>
