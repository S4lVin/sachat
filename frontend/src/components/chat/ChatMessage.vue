<script setup>
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import { computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

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
      <BaseButton
        @click="$emit('retry')"
        class="w-full p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800"
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
    </div>
  </div>
</template>
