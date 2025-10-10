<script setup>
import { computed } from 'vue'
import feather from 'feather-icons'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 24,
  },
  strokeWidth: {
    type: Number,
    default: 2,
  },
  class: {
    type: String,
    default: ''
  }
})

const icon = computed(() => {
  return (
    feather.icons[props.name]?.toSvg({
      width: props.size,
      height: props.size,
      'stroke-width': props.strokeWidth,
      class: props.class
    }) || ''
  )
})
</script>

<template>
  <span v-html="icon"></span>
</template>
