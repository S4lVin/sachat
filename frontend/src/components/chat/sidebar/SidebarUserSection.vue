<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import UserSettingsModal from '@/components/user/UserSettingsModal.vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

defineProps({
  collapsed: Boolean,
})

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// State
const showMenu = ref(false)
const showModal = ref(false)
const actions = [
  {
    label: 'Impostazioni',
    icon: 'settings',
    handler: () => showModal.value = true
  },
  {
    label: 'Disconnettiti',
    icon: 'log-out',
    class: 'text-md text-red-500',
    handler: () => authStore.logout(),
  },
]

// Actions
const toggleMenu = () => showMenu.value = !showMenu.value
</script>

<template>
  <div>
    <!-- User Button -->
    <BaseButton
      @click.stop="toggleMenu"
      class="w-full"
      :class="collapsed ? 'p-2' : 'p-3'"
      variant="ghost"
      icon="user"
      :icon-size="collapsed ? 24 : 20"
    >
      <span v-if="!collapsed">{{ user?.name }}</span>
    </BaseButton>

    <!-- Context Menu -->
    <ContextMenu
      :actions="actions"
      v-model="showMenu"
      class="absolute bottom-full left-2 -mb-1 w-56"
    />

    <UserSettingsModal @close="showModal = false" v-if="showModal"/>
  </div>
</template>
