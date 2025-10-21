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
    class="fixed inset-0 flex items-center justify-center z-15"
    :class="{ 'bg-black/25 backdrop-blur-xs': background }"
  >
    <div class="z-20 rounded-xl bg-neutral-800 shadow-lg/25" v-bind="$attrs">
      <slot />
    </div>
  </div>
</template>
