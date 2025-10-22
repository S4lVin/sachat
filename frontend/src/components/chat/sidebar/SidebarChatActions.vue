<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ChatSearchModal from '../ChatSearchModal.vue'
import { useChatStore } from '@/stores/chatStore'

defineProps({
  collapsed: Boolean,
})

const chatStore = useChatStore()

// State
const showSearch = ref(false)
</script>

<template>
  <div class="flex gap-2" :class="{ 'flex-col': collapsed }">
    
    <!-- New Chat Button -->
    <BaseButton @click="chatStore.selectChat('new')" class="flex-1" variant="secondary" icon="plus">
      <span v-if="!collapsed">Nuova Chat</span>
    </BaseButton>

    <!-- Search Button -->
    <BaseButton
      @click="showSearch = !showSearch"
      class="px-2.5"
      variant="secondary"
      icon="search"
    />

    <ChatSearchModal @close="showSearch = false" v-if="showSearch" />
  </div>
</template>
