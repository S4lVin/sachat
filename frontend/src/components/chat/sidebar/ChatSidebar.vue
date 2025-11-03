<script setup>
import { ref } from 'vue'
import BaseButton from '../../ui/BaseButton.vue'
import SidebarChatActions from './SidebarChatActions.vue'
import SidebarChatList from './SidebarChatList.vue'
import SidebarUserSection from './SidebarUserSection.vue'
import { onClickOutside } from '@vueuse/core'

// State
const collapsed = ref(false)
const sidebar = ref(null)

// Actions
const toggleSidebar = () => (collapsed.value = !collapsed.value)

// Callbacks
onClickOutside(sidebar, () => {
  if (window.matchMedia('(max-width: 639px)').matches) {
    collapsed.value = true
  }
})
</script>

<template>
  <div v-if="!collapsed" class="fixed inset-0 z-5 bg-black/25 backdrop-blur-xs sm:hidden" />
  <BaseButton
    v-if="collapsed"
    variant="secondary"
    class="absolute top-2 left-2 z-10 sm:hidden"
    @click="collapsed = !collapsed"
    icon="chevron-right"
    icon-size="24"
  />
  <aside
    class="absolute z-10 flex h-screen flex-col border-r border-neutral-700 bg-neutral-800 shadow-lg/25 sm:relative sm:z-5"
    ref="sidebar"
    :class="collapsed ? 'hidden w-14 min-w-14 sm:flex' : 'w-64 min-w-64'"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between border-b-2 border-neutral-700"
      :class="collapsed ? 'p-2' : 'p-3'"
    >
      <h2 v-if="!collapsed" class="text-xl font-bold">
        SaChat -
        <span class="rounded-lg bg-red-500/25 px-1 py-0.5 text-lg">BETA</span>
      </h2>
      <BaseButton
        @click="toggleSidebar"
        variant="ghost"
        :icon="collapsed ? 'chevron-right' : 'chevron-left'"
        :icon-size="24"
      />
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
