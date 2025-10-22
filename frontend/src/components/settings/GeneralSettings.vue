<script setup>
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import BaseButton from '../ui/BaseButton.vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import AutoResizeTextarea from '../ui/AutoResizeTextarea.vue'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// State
const settings = ref(structuredClone(toRaw(user.value.settings)))

// Computed
const isUserVip = computed(() => user.value.role === 'vip')
const areSettingsEqual = computed(
  () => JSON.stringify(toRaw(user.value.settings)) === JSON.stringify(settings.value),
)
</script>

<template>
  <div class="mb-4 flex flex-1 flex-col overflow-auto text-sm">
    <div class="flex flex-col gap-1 border-b border-neutral-700 pb-6">
      <span>Istruzioni personalizzate</span>
      <AutoResizeTextarea
        v-model="settings.customPrompt"
        :max-height="96"
        placeholder="Preferenze aggiuntive relative a comportamento, stile e tono"
        class="rounded-lg border border-neutral-700 p-1"
      />
    </div>
    <div v-if="isUserVip" class="mt-6 mb-4 flex items-center justify-between gap-1">
      <span>Usa API Key personale</span>
      <ToggleSwitch
        :value="settings.useApiKey"
        @toggle="settings.useApiKey = !settings.useApiKey"
      />
    </div>
    <div
      class="flex flex-col gap-1 border-neutral-700"
      :class="{ 'opacity-50': !settings.useApiKey && isUserVip }"
    >
      <span>API Key</span>
      <input
        v-model="settings.apiKey"
        placeholder="Inserisci la tua API key"
        :disabled="!settings.useApiKey && isUserVip"
        class="rounded-lg border border-neutral-700 bg-neutral-800 p-1 focus:outline-none"
      />
    </div>
  </div>
  <div class="flex justify-end">
    <BaseButton
      :disabled="areSettingsEqual"
      @click="authStore.updateUser({ settings })"
      variant="primary"
    >
      Applica
    </BaseButton>
  </div>
</template>
