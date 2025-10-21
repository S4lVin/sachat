<script setup>
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseModal from '../ui/BaseModal.vue'

const emit = defineEmits(['close'])

const chatStore = useChatStore()
const { chats } = storeToRefs(chatStore)

// State
const input = ref('')

// Computed
const filteredChats = computed(() => {
  return chats.value.filter((chat) => chat.title.toLowerCase().includes(input.value.toLowerCase()))
})

// Actions
const selectChat = (chatId) => {
  chatStore.selectChat(chatId)
  emit('close')
}
</script>

<template>
  <BaseModal @close="$emit('close')" class="flex h-96 w-160 flex-col">
    <!-- Header -->
    <div class="flex items-center justify-center p-2">
      <input v-model="input" placeholder="Cerca chat..." class="w-full p-2 focus:outline-none" />
      <BaseButton @click="$emit('close')" variant="ghost" icon="x" :icon-size="24" />
    </div>

    <!-- Chat List -->
    <div class="overflow-y-auto border-t border-neutral-700 p-2">
      <BaseButton
        v-for="chat in filteredChats"
        @click="selectChat(chat.id)"
        class="w-full p-2 transition-none hover:bg-neutral-700"
        :key="chat.id"
      >
        {{ chat.title }}
      </BaseButton>

      <!-- Empty State -->
      <div v-if="filteredChats?.length === 0" class="text-center text-neutral-400">
        <p class="mt-8 text-sm">Nessuna chat trovata</p>
      </div>
    </div>
  </BaseModal>
</template>
