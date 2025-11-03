<script setup>
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import { ref } from 'vue'
import GeneralSettings from './GeneralSettings.vue'
import AccountSettings from './AccountSettings.vue'

defineEmits(['close'])

// State
const menus = [
  { name: 'general', label: 'Generale', icon: 'settings' },
  { name: 'account', label: 'Account', icon: 'user' },
]
const selectedMenu = ref(menus[0])

// Helpers
const isMenuSelected = (menu) => menu.name === selectedMenu.value.name
</script>

<template>
  <BaseModal @close="$emit('close')" :background="true" class="flex h-96 w-160">
    <!-- Sidebar -->
    <aside
      class="flex w-40 flex-col gap-1 rounded-l-xl border-r border-neutral-700 p-4 shadow-lg/25"
    >
      <BaseButton
        @click="selectedMenu = menus[i]"
        v-for="(menu, i) in menus"
        :key="i"
        class="w-full p-2 hover:bg-neutral-600"
        :class="{ 'bg-neutral-700': isMenuSelected(menu) }"
        :icon="menu.icon"
        :icon-size="16"
      >
        {{ menu.label }}
      </BaseButton>
    </aside>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-4">
      <!-- Header -->
      <header class="mb-4 flex items-center justify-between">
        <span class="text-lg font-medium">{{ selectedMenu.label }}</span>
        <BaseButton @click="$emit('close')" variant="ghost" icon="x" :icon-size="24" />
      </header>

      <!-- Settings -->
      <GeneralSettings v-if="selectedMenu.name === 'general'" />
      <AccountSettings v-else-if="selectedMenu.name === 'account'" />
    </div>
  </BaseModal>
</template>
