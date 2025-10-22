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

    <!-- Custom Prompt Field -->
    <div class="flex flex-col gap-1">
      <span>Istruzioni personalizzate</span>
      <AutoResizeTextarea
        :value="settings.customPrompt"
        @input="settings.customPrompt = $event.target.value || undefined"
        :max-height="96"
        placeholder="Preferenze aggiuntive relative a comportamento, stile e tono"
        class="rounded-lg border border-neutral-600 bg-neutral-700 p-1"
      />
    </div>

    <hr class="my-6 text-neutral-700" />

    <!-- Personal API Key Toggle -->
    <div v-if="isUserVip" class="mb-4 flex items-center justify-between gap-1">
      <span>Usa API Key personale</span>
      <ToggleSwitch
        :value="settings.useApiKey"
        @toggle="settings.useApiKey = !settings.useApiKey"
      />
    </div>

    <!-- API Key Field -->
    <div
      class="flex flex-col gap-1 border-neutral-700"
      :class="{ 'opacity-50': !settings.useApiKey && isUserVip }"
    >
      <span>API Key</span>
      <input
        :value="settings.apiKey"
        @input="settings.apiKey = $event.target.value || undefined"
        placeholder="Inserisci la tua API key"
        :disabled="!settings.useApiKey && isUserVip"
        class="rounded-lg border border-neutral-600 bg-neutral-700 p-1 focus:outline-none"
      />
    </div>
  </div>

  <!-- Apply Button -->
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
