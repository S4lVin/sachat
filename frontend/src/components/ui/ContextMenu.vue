<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import BaseButton from './BaseButton.vue'

// Options
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: Boolean,
  actions: {
    type: Array,
    required: true,
  },
})

// State
const menuRef = ref(null)
const menuId = Symbol('context-menu')

// Actions
const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    emit('update:modelValue', false)
  }
}

const handleCloseAllMenus = (e) => {
  // se l'evento è stato emesso da me, ignoro
  if (e?.detail?.openerId === menuId) return
  emit('update:modelValue', false)
}

// Watchers
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return
    document.dispatchEvent(new CustomEvent('close-all-menus', { detail: { openerId: menuId } }))
  },
)

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
    class="z-10 rounded-xl border border-neutral-700 bg-neutral-800 p-2 shadow-lg/25"
  >
    <!-- Actions -->
    <BaseButton
      v-for="action in actions"
      :key="action.label"
      @click="
        () => {
          action.handler()
          emit('update:modelValue', false)
        }
      "
      class="w-full text-sm"
      :class="action.class"
      variant="ghost"
      :icon="action.icon"
      :icon-size="16"
    >
      <span>{{ action.label }}</span>
    </BaseButton>
  </div>
</template>
