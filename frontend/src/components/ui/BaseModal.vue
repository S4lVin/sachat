<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'

defineOptions({ inheritAttrs: false })
defineEmits(['close'])
defineProps({
  title: {
    type: String,
    required: true
  },
  background: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div 
    @click.self="$emit('close')"
    class="fixed inset-0 flex items-center justify-center" 
    :class="{ 'bg-black/50 backdrop-blur-sm': background }"
  >
    <div class="rounded-xl shadow-lg/25 bg-neutral-800 p-8 z-10" v-bind="$attrs">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="text-2xl">{{ title }}</div>
        <feather-icons @click="$emit('close')" name="x" class="cursor-pointer hover:text-neutral-300" />
      </div>
      <slot></slot>
    </div>
  </div>

  <!-- Background -->
</template>
