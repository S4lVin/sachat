<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'

defineEmits(['select'])
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
    <!-- Chat Title -->
    <button
      @click="$emit('select')"
      class="w-full cursor-pointer truncate rounded-xl p-2 text-left hover:bg-neutral-600"
      :class="{ 'bg-neutral-700': selected }"
    >
      {{ title }}
    </button>

    <!-- More Options -->
    <button
      class="hidden cursor-pointer transition-colors group-hover:inline hover:text-neutral-300"
    >
      <feather-icons name="more-vertical" />
    </button>
  </div>
</template>
