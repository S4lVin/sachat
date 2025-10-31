<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import AutoResizeTextarea from '../ui/AutoResizeTextarea.vue'

const emit = defineEmits(['retry', 'select', 'edit'])
const props = defineProps({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, required: false },
  siblings: { type: Array, default: () => [] },
  selfId: { type: [String, Number], required: true },
})

// State
const isEditing = ref(false)
const inputRef = ref(null)
const editingContent = ref('')
const selectedIndex = ref(0)
const isSaving = ref(false)

// Computed
const isUser = computed(() => props.sender === 'user')
const isLoading = computed(() => props.content === '')
const isError = computed(() => props?.status === 'error')
const actions = computed(() =>
  isUser.value ? [{ name: 'copy' }, { name: 'edit' }] : [{ name: 'copy' }, { name: 'repeat' }],
)

// Helpers
const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

const goToIndex = (nextIdx) => {
  if (!props.siblings?.length) return
  const clamped = clamp(nextIdx, 0, props.siblings.length - 1)

  if (clamped === selectedIndex.value) return
  selectedIndex.value = clamped
  emit('select', props.siblings[selectedIndex.value].id)
}

// Actions
const onAction = async (name) => {
  switch (name) {
    case 'copy':
      navigator.clipboard.writeText(props.content)
      break
    case 'repeat':
      emit('retry')
      break
    case 'edit':
      editContent()
      break
  }
}

// Sincronizza l'indice selezionato con la posizione del messaggio corrente tra i fratelli
const syncSelectedIndex = () => {
  if (!props.siblings?.length || props.siblings.length <= 1) {
    selectedIndex.value = 0
    return
  }
  const idx = props.siblings.findIndex((m) => m.id === props.selfId)
  selectedIndex.value = clamp(idx, 0, props.siblings.length - 1)
}

const prev = () => goToIndex(selectedIndex.value - 1)
const next = () => goToIndex(selectedIndex.value + 1)

const editContent = () => {
  isEditing.value = true
  editingContent.value = props.content
  // Focus sull'input dopo che il DOM si è aggiornato
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

const saveContent = () => {
  if (!isEditing.value || isSaving.value) return
  if (editingContent.value.trim() && editingContent.value.trim() !== props.content) {
    isSaving.value = true
    isEditing.value = false
    emit('edit', editingContent.value.trim())
    isSaving.value = false
  } else {
    isEditing.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editingContent.value = ''
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    saveContent()
  } else if (e.key === 'Escape') {
    cancelEdit()
  }
}

// Watchers
watch(() => [props.siblings, props.selfId], syncSelectedIndex, { deep: true })

// Callbacks
onMounted(syncSelectedIndex)
</script>

<template>
  <div class="group relative mb-2 flex pb-9 whitespace-pre-wrap" :class="{ 'justify-end': isUser }">
    <!-- User Message -->
    <div v-if="isUser && !isEditing" class="max-w-[80%] rounded-xl bg-neutral-800 p-3">
      {{ content }}
    </div>

    <AutoResizeTextarea
      v-else-if="isUser && isEditing"
      ref="inputRef"
      v-model="editingContent"
      @blur="saveContent"
      @keydown="handleKeydown"
      class="w-full max-w-[80%] rounded-xl bg-neutral-800 p-3 ring-2 ring-indigo-800 outline-none"
      type="text"
    />

    <!-- Error Message -->
    <div v-else-if="isError" class="rounded-xl bg-red-500/10 p-3">
      <div class="mb-2 flex text-red-500">
        <feather-icons name="alert-circle" />
        {{ content }}
      </div>
      <BaseButton
        @click="$emit('retry')"
        class="w-full border border-neutral-800 bg-neutral-900 p-2 hover:bg-neutral-800"
        icon="rotate-cw"
      >
        Riprova
      </BaseButton>
    </div>

    <!-- Assistant Message -->
    <div v-else class="flex flex-col">
      <span class="mb-1 font-bold uppercase">{{ sender }}</span>
      <feather-icons v-if="isLoading" :spin="true" name="loader" />{{ content }}
    </div>

    <!-- Actions -->
    <div
      v-if="!isLoading"
      class="absolute bottom-0 hidden gap-x-2 pb-2 group-hover:flex"
      :class="isUser ? 'right-0' : 'left-0'"
    >
      <BaseButton
        v-for="(action, i) in actions"
        :key="i"
        class="text-neutral-500 hover:text-neutral-600"
        @click="onAction(action.name)"
        :icon="action.name"
      />

      <!-- Selector -->
      <div class="flex items-center" v-if="siblings?.length > 1">
        <BaseButton
          class="hover:text-neutral-300"
          @click="prev"
          icon="chevron-left"
          :disabled="selectedIndex <= 0"
        />
        {{ selectedIndex + 1 + '/' + siblings.length }}
        <BaseButton
          class="hover:text-neutral-300"
          @click="next"
          icon="chevron-right"
          :disabled="selectedIndex >= siblings.length - 1"
        />
      </div>
    </div>
  </div>
</template>
