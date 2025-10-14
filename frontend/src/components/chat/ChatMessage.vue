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
  <div class="group relative mb-2 pb-9" :class="{ 'flex justify-end': isUser }">
    <!-- Sender -->
    <p v-if="!isUser" class="mb-1 font-bold uppercase">{{ sender }}</p>

    <!-- Message -->
    <div
      class="whitespace-pre-wrap"
      :class="{ 'max-w-[80%] rounded-xl bg-neutral-800 p-3': isUser }"
    >
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
