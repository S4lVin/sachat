<script setup>
import { computed } from 'vue';
import feather from 'feather-icons';

// Props
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 24
  },
  strokeWidth: {
    type: Number,
    default: 2
  }
});

// Computed icon
const icon = computed(() => {
  return feather.icons[props.name]?.toSvg({
    width: props.size,
    height: props.size,
    'stroke-width': props.strokeWidth
  }) || '';
});
</script>

<template>
  <span v-html="icon"></span>
</template>