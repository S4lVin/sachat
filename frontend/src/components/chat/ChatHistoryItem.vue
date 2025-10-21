<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import ContextMenu from '../ui/ContextMenu.vue'
import { nextTick, ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

// Options
const emit = defineEmits(['select', 'rename', 'delete'])
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    required: true,
  },
  generating: {
    type: Boolean,
    required: false,
  },
})

// State
const showMenu = ref(false)
const isEditing = ref(false)
const editingTitle = ref('')
const inputRef = ref(null)

const actions = [
  {
    label: 'Rinomina',
    icon: 'edit-2',
    handler: () => renameTitle(),
  },
  {
    label: 'Elimina',
    icon: 'trash-2',
    class: 'text-red-500 hover:bg-red-500/10',
    handler: () => emit('delete'),
  },
]

// Actions
const renameTitle = () => {
  isEditing.value = true
  editingTitle.value = props.title
  // Focus sull'input dopo che il DOM si è aggiornato
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  }, 0)
}

const saveTitle = () => {
  if (editingTitle.value.trim()) {
    emit('rename', editingTitle.value.trim())
  }
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  editingTitle.value = ''
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    saveTitle()
  } else if (e.key === 'Escape') {
    cancelEdit()
  }
}

const toggleMenu = () => {
  // Chiudi tutti gli altri menu prima di aprire questo
  showMenu.value = !showMenu.value
}
</script>

<template>
  <div class="group relative mb-2 flex items-center justify-between gap-x-2">
    <!-- Chat Title (editing mode) -->
    <input
      v-if="isEditing"
      ref="inputRef"
      v-model="editingTitle"
      @blur="saveTitle"
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
    <ContextMenu
      class="absolute top-full right-0 z-10 mt-1 w-32"
      v-model="showMenu"
      :actions="actions"
    />
  </div>
</template>
