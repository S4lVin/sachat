<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import { ref } from 'vue'

const emit = defineEmits(['send'])

const input = ref('')

const send = () => {
  const message = input.value.trim()
  if (!message) return
  emit('send', message)
  input.value = ''
}
</script>

<template>
  <div class="flex w-full gap-x-4">
    <input
      @keydown.enter="send"
      v-model="input"
      type="text"
      placeholder="Scrivi un messaggio..."
      class="w-full rounded-xl bg-neutral-700 px-6 py-4 shadow-lg/25 focus:outline-none"
    />
    <button
      @click="send"
      class="cursor-pointer rounded-xl bg-indigo-800 p-3 shadow-lg/25 hover:bg-indigo-900"
    >
      <feather-icons class="h-8 w-8" name="send" />
    </button>
  </div>
</template>
