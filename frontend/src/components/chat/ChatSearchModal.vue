<script setup>
import { useChatStore } from '@/stores/chatStore';
import FeatherIcons from '@/components/ui/FeatherIcon.vue'
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

defineEmits(['close'])

const chatStore = useChatStore()
const { chats } = storeToRefs(chatStore)

// State
const input = ref('')

// Computed
const filteredChats = computed(() => {
  return chats.value.filter((chat) => chat.title.toLowerCase().includes(input.value.toLowerCase()))
})

</script>

<template>
  <div @click.self="$emit('close')" class="fixed inset-0 z-10 flex items-center justify-center">
    <div class="bg-neutral-800 flex flex-col h-96 w-160 shadow-lg/25 rounded-xl">
      <div class="flex items-center justify-center p-4">
        <input v-model="input" placeholder="Cerca chat..." class="w-full focus:outline-none" />
        <button @click="$emit('close')" class="cursor-pointer hover:text-neutral-300 transition-colors">
          <feather-icons name="x"/>
        </button>
      </div>
      <div class="p-2 border-t overflow-y-auto border-neutral-700">
        <button 
          v-for="chat in filteredChats" 
          @click="chatStore.selectChat(chat.id); $emit('close')"
          class="hover:bg-neutral-700 text-left cursor-pointer rounded-xl p-2 w-full" 
          :key="chat.id"
        >
          {{ chat.title }}
        </button>

        <!-- Empty State -->
        <div v-if="filteredChats?.length === 0" class="text-center text-neutral-400">
          <p class="text-sm mt-8">Nessuna chat trovata</p>
        </div>
      </div>
    </div>
  </div>
</template>