<script setup>
import { ref } from 'vue'
import BaseButton from '../../ui/BaseButton.vue'
import SidebarChatActions from './SidebarChatActions.vue'
import SidebarChatList from './SidebarChatList.vue'
import SidebarUserSection from './SidebarUserSection.vue'

// State
const collapsed = ref(false)

// Actions
const toggleSidebar = () => (collapsed.value = !collapsed.value)
</script>

<template>
  <aside
    class="relative flex flex-col border-r border-neutral-700 bg-neutral-800 shadow-lg/25"
    :class="collapsed ? 'w-14' : 'w-64'"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between border-b-2 border-neutral-700"
      :class="collapsed ? 'p-2' : 'p-3'"
    >
      <h2 v-if="!collapsed" class="text-xl font-bold">
        SaChat -
        <span class="text-lg bg-red-500/25 px-1 py-0.5 rounded-lg">BETA</span>
      </h2>
      <BaseButton @click="toggleSidebar" variant="ghost" icon="sidebar" :icon-size="24" />
    </header>

    <!-- Body -->
    <div class="h-full overflow-y-auto py-4" :class="collapsed ? 'px-2' : 'px-3'">
      <SidebarChatActions :collapsed="collapsed" class="sticky top-0 z-10 mb-4" />
      <SidebarChatList v-if="!collapsed" />
    </div>

    <!-- Footer -->
    <footer class="relative border-t-2 border-neutral-700 p-2">
      <SidebarUserSection :collapsed="collapsed" />
    </footer>
  </aside>
</template>
