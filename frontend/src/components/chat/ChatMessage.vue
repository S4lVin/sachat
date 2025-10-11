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

const isUser = computed(() => props.sender === 'user')
const isLoading = computed(() => !isUser.value && !props.content)
const actions = computed(() =>
  isUser.value
    ? [{ name: 'copy' }, { name: 'edit' }]
    : [{ name: 'copy' }, { name: 'repeat' }, { name: 'edit' }],
)

function onAction(name) {
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
      <div v-if="!isUser" class="mb-1 font-bold uppercase">{{ sender }}</div>
      <div :class="{ 'rounded-xl bg-neutral-800 px-6 py-4 text-end': isUser }">
        <feather-icons v-if="isLoading" class="animate-spin" name="loader" />
        {{ content }}
      </div>
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
