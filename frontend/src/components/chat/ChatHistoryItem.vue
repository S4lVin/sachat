<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import ContextMenu from '../ui/ContextMenu.vue'
import { ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import { useEditable } from '@/composables/useEditable'

const emit = defineEmits(['select', 'rename', 'delete'])
const props = defineProps({
  title: { type: String, required: true },
  selected: { type: Boolean, required: true },
  generating: { type: Boolean, required: false },
})

const actions = [
  {
    label: 'Rinomina',
    icon: 'edit-2',
    handler: () => startEdit(),
  },
  {
    label: 'Elimina',
    icon: 'trash-2',
    class: 'text-red-500 hover:bg-red-500/10',
    handler: () => emit('delete'),
  },
]

// State
const showMenu = ref(false)
const { isEditing, editingValue, inputRef, startEdit, save, cancel } = useEditable(
  () => props.title,
  (newTitle) => emit('rename', newTitle),
)

// Actions
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    save()
  } else if (e.key === 'Escape') {
    cancel()
  }
}

const toggleMenu = () => (showMenu.value = !showMenu.value)
</script>

<template>
  <div class="group relative flex items-center justify-between gap-x-2">
    <!-- Chat Title (editing mode) -->
    <input
      v-if="isEditing"
      ref="inputRef"
      v-model="editingValue"
      @blur="save"
      @keydown="handleKeydown"
      class="w-full rounded-xl bg-neutral-700 p-2 text-left ring-2 ring-indigo-800 outline-none"
      type="text"
    />

    <!-- Chat Title (normal mode) -->
    <BaseButton
      v-else
      @click="$emit('select')"
      class="w-full truncate p-2 transition-none hover:bg-neutral-600"
      :class="{ 'bg-neutral-700': selected }"
    >
      <span class="truncate">{{ title }}</span>
    </BaseButton>

    <!-- Generating Icon -->
    <feather-icons
      v-if="generating"
      class="group-hover:hidden"
      :class="{ hidden: selected }"
      name="loader"
      :spin="true"
    />

    <!-- More Options -->
    <BaseButton
      @click.stop="toggleMenu"
      variant="ghost"
      icon="more-vertical"
      :icon-size="24"
      display="hidden group-hover:inline-flex"
    />

    <!-- Context Menu -->
    <ContextMenu class="absolute top-full right-0 z-10 mt-1 w-32" v-model="showMenu">
      <BaseButton
        v-for="action in actions"
        :key="action.label"
        @click="
          () => {
            action.handler()
            showMenu = false
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
    </ContextMenu>
  </div>
</template>
