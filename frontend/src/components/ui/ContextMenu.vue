<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Options
const emit = defineEmits(['update:modelValue'])
defineProps({
  modelValue: Boolean,
  actions: {
    type: Array,
    required: true,
  },
})

// State
const menuRef = ref(null)

// Actions
const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    emit('update:modelValue', false)
  }
}

const handleCloseAllMenus = () => {
  emit('update:modelValue', false)
}

// Callbacks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('close-all-menus', handleCloseAllMenus)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('close-all-menus', handleCloseAllMenus)
})
</script>

<template>
  <div
    v-if="modelValue"
    ref="menuRef"
    class="rounded-xl border border-neutral-700 bg-neutral-800 p-2 shadow-lg/25"
  >
    <button
      v-for="action in actions"
      :key="action.label"
      @click="
        () => {
          action.handler()
          emit('update:modelValue', false)
        }
      "
      class="flex w-full cursor-pointer items-center gap-2 rounded-xl p-2 text-left text-sm transition-colors hover:bg-neutral-700"
      :class="action.class"
    >
      <feather-icons :size="16" :name="action.icon" />
      <span>{{ action.label }}</span>
    </button>
  </div>
</template>
