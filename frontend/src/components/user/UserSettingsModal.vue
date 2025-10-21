<script setup>
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'

defineEmits(['close'])
</script>

<template>
  <BaseModal @close="$emit('close')" background="true" class="flex flex-col p-4 w-160">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between w-full">
      <div class="text-2xl">Impostazioni</div>
      <BaseButton @click="$emit('close')" variant="ghost" icon="x" :icon-size="24" />
    </div>

    <div class="flex">
      <!-- Settings Sections -->
      <aside class="w-48 rounded-xl flex flex-col p-2 bg-neutral-700">
        
      </aside>
      <!-- Section Body -->
      <div class="flex-1">
      </div>
    </div>
  </BaseModal>
</template>