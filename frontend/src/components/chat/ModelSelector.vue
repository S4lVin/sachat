<script setup>
import { ref, watch } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import ContextMenu from '../ui/ContextMenu.vue'
import { useMessageStore } from '@/stores/messageStore'
import { storeToRefs } from 'pinia'

const messageStore = useMessageStore()
const { options } = storeToRefs(messageStore)

const models = [
  {
    name: 'gpt-5',
    label: 'GPT-5',
    description: 'Intelligente, ideale per compiti complessi e creativi',
  },
  {
    name: 'gpt-5-mini',
    label: 'GPT-5 Mini',
    description: "Veloce e versatile, perfetto per l'uso quotidiano",
  },
  {
    name: 'gpt-5-nano',
    label: 'GPT-5 Nano',
    description: 'Estremamente efficiente, ottimo per attività leggere',
  },
]

// State
const showModelSelector = ref(false)
const selectedModel = ref(models[1])

watch(
  selectedModel,
  (newModel) => {
    options.value.model = newModel.name
    showModelSelector.value = false
  },
  { immediate: true },
)
</script>

<template>
  <BaseButton
    @click.stop="showModelSelector = !showModelSelector"
    class="text-neutral-400"
    variant="ghost"
    icon="chevron-down"
    icon-position="right"
  >
    <span class="text-neutral-200">{{ selectedModel.label }}</span>
  </BaseButton>
  <ContextMenu
    class="absolute right-12 bottom-full mb-1 flex w-88 flex-col gap-1"
    v-model="showModelSelector"
  >
    <div
      :class="selectedModel.name === model.name ? 'bg-neutral-700' : ''"
      class="flex w-full cursor-pointer flex-col gap-2 rounded-xl p-1.5 hover:bg-neutral-600"
      @click="selectedModel = model"
      v-for="(model, i) in models"
      :key="i"
    >
      {{ model.label }}
      <p class="-mt-2 text-left text-sm text-neutral-400">{{ model.description }}</p>
    </div>
  </ContextMenu>
</template>
