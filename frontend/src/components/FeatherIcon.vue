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
  spin: {
    type: Boolean,
    default: false,
  },
})

const icon = computed(() => {
  return (
    feather.icons[props.name]?.toSvg({
      width: props.size,
      height: props.size,
      'stroke-width': props.strokeWidth,
      class: props.spin ? 'animate-spin' : '',
    }) || ''
  )
})
</script>

<template>
  <span v-html="icon"></span>
</template>
