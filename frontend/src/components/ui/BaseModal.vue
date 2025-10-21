<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

defineOptions({ inheritAttrs: false })
const emit = defineEmits(['close'])
defineProps({ background: Boolean })

// Helpers
const handleKeydown = (e) => {
if (e.key === 'Escape') emit('close')
}

// Callbacks
onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div 
    @click.self="$emit('close')"
    class="fixed inset-0 flex items-center justify-center" 
    :class="{ 'bg-black/50 backdrop-blur-sm': background }"
  >
    <div class="rounded-xl shadow-lg/25 bg-neutral-800 z-10" v-bind="$attrs">
      <slot/>
    </div>
  </div>
</template>
