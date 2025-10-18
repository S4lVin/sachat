<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import { computed } from 'vue'

// Options
const emit = defineEmits(['retry'])
const props = defineProps({
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: false,
  },
})

// Computed
const isUser = computed(() => props.sender === 'user')
const isLoading = computed(() => props.content === '')
const isError = computed(() => props?.status === 'error')
const actions = computed(() =>
  isUser.value ? [{ name: 'copy' }, { name: 'edit' }] : [{ name: 'copy' }, { name: 'repeat' }],
)

// Actions
const onAction = async (name) => {
  switch (name) {
    case 'copy':
      navigator.clipboard.writeText(props.content)
      break
    case 'repeat':
      emit('retry')
      break
  }
}
</script>

<template>
  <div class="group relative mb-2 flex pb-9 whitespace-pre-wrap" :class="{ 'justify-end': isUser }">
    <!-- User Message -->
    <div v-if="isUser" class="max-w-[80%] rounded-xl bg-neutral-800 p-3">
      {{ content }}
    </div>

    <!-- Error Message -->
    <div v-else-if="isError" class="rounded-xl bg-red-500/10 p-3">
      <div class="mb-2 flex text-red-500">
        <feather-icons name="alert-circle" />
        {{ content }}
      </div>

      <!-- Retry Button -->
      <button
        @click="$emit('retry')"
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-2 transition-colors hover:bg-neutral-800"
      >
        <feather-icons :size="20" name="rotate-cw" />
        <span>Riprova</span>
      </button>
    </div>

    <!-- Assistant Message -->
    <div v-else class="flex flex-col">
      <span class="mb-1 font-bold uppercase">{{ sender }}</span>

      <feather-icons v-if="isLoading" :spin="true" name="loader" />
      {{ content }}
    </div>

    <!-- Actions -->
    <div
      v-if="!isLoading"
      class="absolute bottom-0 hidden gap-x-2 pb-2 group-hover:flex"
      :class="isUser ? 'right-0' : 'left-0'"
    >
      <button
        v-for="(action, i) in actions"
        :key="i"
        class="cursor-pointer"
        @click="onAction(action.name)"
      >
        <feather-icons
          :size="20"
          class="text-neutral-500 transition-colors hover:text-neutral-600"
          :name="action.name"
        />
      </button>
    </div>
  </div>
</template>
