<script setup>
import { ref, nextTick, watch } from 'vue'

const emit = defineEmits(['update:modelValue', 'enter'])
const props = defineProps({
  maxHeight: {
    type: Number,
    default: 256,
  },
  modelValue: String,
  placeholder: String,
  disabled: Boolean,
})

// State
const textArea = ref()

// Helpers
const autoResize = () => {
  nextTick(() => {
    if (!textArea.value) return

    textArea.value.style.height = 'auto'
    textArea.value.style.height = Math.min(textArea.value.scrollHeight, props.maxHeight) + 'px'
  })
}

// Watchers
watch(() => props.modelValue, autoResize)
</script>

<template>
  <textarea
    ref="textArea"
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
    class="resize-none focus:outline-none"
    rows="1"
    :placeholder="placeholder"
    :disabled="disabled"
  />
</template>
