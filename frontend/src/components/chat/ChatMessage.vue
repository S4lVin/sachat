<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import { computed } from 'vue'

const props = defineProps({
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
})

// Computed
const isUser = computed(() => props.sender === 'user')
const isLoading = computed(() => !isUser.value && !props.content)
const actions = computed(() =>
  isUser.value ? [{ name: 'copy' }, { name: 'edit' }] : [{ name: 'copy' }, { name: 'repeat' }],
)

// Actions
const onAction = async (name) => {
  switch (name) {
    case 'copy':
      navigator.clipboard.writeText(props.content)
      break
  }
}
</script>

<template>
  <div class="group pb-10" :class="{ 'flex justify-end': isUser }">
    <div class="relative">
      <!-- Sender -->
      <p v-if="!isUser" class="mb-1 font-bold uppercase">{{ sender }}</p>

      <!-- Message -->
      <div class="whitespace-pre-wrap" :class="{ 'rounded-xl bg-neutral-800 px-6 py-4 text-end': isUser }">
        <feather-icons v-if="isLoading" :spin="true" name="loader" />
        {{ content }}
      </div>

      <!-- Actions -->
      <div
        v-if="!isLoading"
        class="absolute mt-2 hidden gap-x-2 text-neutral-500 group-hover:flex"
        :class="isUser ? 'right-0' : 'left-0'"
      >
        <button
          v-for="(action, i) in actions"
          :key="i"
          class="cursor-pointer"
          @click="onAction(action.name)"
        >
          <feather-icons :size="20" class="hover:text-neutral-600" :name="action.name" />
        </button>
      </div>
    </div>
  </div>
</template>
