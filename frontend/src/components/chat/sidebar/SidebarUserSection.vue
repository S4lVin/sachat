<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import SettingsModal from '@/components/settings/SettingsModal.vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

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
    handler: () => (showModal.value = true),
  },
  {
    label: 'Disconnettiti',
    icon: 'log-out',
    class: 'text-md text-red-500',
    handler: () => authStore.logout(),
  },
]

// Computed
const isUserVip = computed(() => user.value?.role === 'vip')

// Actions
const toggleMenu = () => (showMenu.value = !showMenu.value)
</script>

<template>
  <div>
    <!-- User Button -->
    <BaseButton
      @click.stop="toggleMenu"
      class="w-full"
      variant="ghost"
      icon="user"
      :icon-size="collapsed ? 24 : 20"
    >
      <div v-if="!collapsed" class="flex w-full items-center justify-between">
        {{ user?.name }}
        <span v-if="isUserVip" class="rounded-lg bg-indigo-900/75 px-1 py-0.5 font-medium"
          >VIP</span
        >
      </div>
    </BaseButton>

    <!-- Context Menu -->
    <ContextMenu v-model="showMenu" class="absolute bottom-full left-2 -mb-1 w-56">
      <BaseButton
        v-for="action in actions"
        :key="action.label"
        @click="
          () => {
            action.handler()
            showMenu = false
          }
        "
        class="w-full text-sm"
        :class="action.class"
        variant="ghost"
        :icon="action.icon"
        :icon-size="16"
      >
        <span>{{ action.label }}</span>
      </BaseButton>
    </ContextMenu>

    <SettingsModal @close="showModal = false" v-if="showModal" />
  </div>
</template>
