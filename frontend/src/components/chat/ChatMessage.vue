<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import BaseButton from '../ui/BaseButton.vue'
import AutoResizeTextarea from '../ui/AutoResizeTextarea.vue'
import { useEditable } from '@/composables/useEditable'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const emit = defineEmits(['retry', 'select', 'edit'])
const props = defineProps({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, required: false },
  siblings: { type: Array, default: () => [] },
  selfId: { type: [String, Number], required: true },
})

// State
const selectedIndex = ref(0)
const containerRef = ref(null)
const { isEditing, editingValue, inputRef, startEdit, save, cancel } = useEditable(
  () => props.content,
  (newContent) => emit('edit', newContent),
  {
    validate: (value) => {
      const trimmed = value.trim()
      return trimmed && trimmed !== props.content ? trimmed : null
    },
  },
)

// Computed
const isUser = computed(() => props.sender === 'user')
const isLoading = computed(() => props.status === 'generating' && props.content === '')
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

const renderMarkdown = (text) => {
  const html = marked.parse(text || '')
  return DOMPurify.sanitize(html)
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
      startEdit()
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

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    save()
  } else if (e.key === 'Escape') {
    cancel()
  }
}

const prev = () => goToIndex(selectedIndex.value - 1)

const next = () => goToIndex(selectedIndex.value + 1)

// Watchers
watch(() => [props.siblings, props.selfId], syncSelectedIndex, { deep: true })

// Callbacks
onMounted(syncSelectedIndex)
onClickOutside(containerRef, save)
</script>

<template>
  <div class="group relative mb-2 flex min-w-0 pb-9" :class="{ 'justify-end': isUser }">
    <!-- User Message -->
    <div
      v-if="isUser && !isEditing"
      class="max-w-[80%] rounded-xl bg-neutral-800 p-3 whitespace-pre-wrap"
    >
      {{ content }}
    </div>

    <div
      ref="containerRef"
      class="w-full max-w-[80%] rounded-xl bg-neutral-800 ring-2 ring-indigo-800"
      v-else-if="isUser && isEditing"
    >
      <AutoResizeTextarea
        ref="inputRef"
        v-model="editingValue"
        @keydown="handleKeydown"
        class="w-full p-3"
        type="text"
      />
      <div class="flex justify-end gap-2 px-3 pb-3">
        <BaseButton @click="cancel" variant="secondary">Anulla</BaseButton>
        <BaseButton @click="save" variant="primary">Salva</BaseButton>
      </div>
    </div>

    <!-- Error Message -->
    <div v-else-if="status === 'failed'" class="rounded-xl bg-red-500/10 p-3">
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
    <div v-else class="flex max-w-full min-w-0 flex-col">
      <span class="mb-1 font-bold uppercase">SAGPT</span>
      <feather-icons v-if="isLoading" :spin="true" name="loader" />
      <div
        class="prose prose-neutral prose-invert prose-headings:text-neutral-200 prose-p:text-neutral-200 prose-strong:text-neutral-200 prose-em:text-neutral-200 prose-a:text-neutral-200 prose-code:text-neutral-200 prose-pre:text-neutral-200 prose-blockquote:text-neutral-200 prose-ul:text-neutral-200 prose-ol:text-neutral-200 prose-li:text-neutral-200 prose-hr:text-neutral-200 prose-table:text-neutral-200 prose-th:text-neutral-200 prose-td:text-neutral-200 prose-del:text-neutral-200 prose-img:text-neutral-200 prose-img:max-w-full prose-a:break-all max-w-full min-w-0 break-words text-neutral-200"
        v-html="renderMarkdown(content)"
      ></div>
    </div>

    <!-- Actions -->
    <div
      v-if="status === 'success'"
      class="absolute bottom-0 flex gap-x-2 pb-2 sm:hidden sm:group-hover:flex"
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
<style scoped>
.prose {
  min-width: 0;
}

/* Blocchi di codice - NON wrappano, scroll orizzontale */
.prose :deep(pre) {
  overflow-x: auto;
  white-space: pre;
  min-width: 0;
}

.prose :deep(pre code) {
  white-space: pre;
}

/* Tabelle - scroll orizzontale */
.prose :deep(table) {
  display: block;
  overflow-x: auto;
  min-width: 0;
}

.prose :deep(img) {
  max-width: 100%;
}
</style>
