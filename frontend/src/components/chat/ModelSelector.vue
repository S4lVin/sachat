<script setup>
import { ref, watch } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import ContextMenu from '../ui/ContextMenu.vue'
import { useMessageStore } from '@/stores/messageStore'
import { storeToRefs } from 'pinia'

const messageStore = useMessageStore()
const { options } = storeToRefs(messageStore)

const models = [
  { name: 'gpt-5', label: 'GPT-5' },
  { name: 'gpt-5-mini', label: 'GPT-5 Mini' },
  { name: 'gpt-5-nano', label: 'GPT-5 Nano' },
]

// State
const showModelSelector = ref(false)
const selectedModel = ref(models[0])

watch(
  selectedModel,
  (newModel) => {
    options.value.model = newModel.name
  },
  { immediate: true },
)
</script>

<template>
  <BaseButton @click.stop="showModelSelector = !showModelSelector" variant="ghost" icon="cpu">
    {{ selectedModel.label }}
  </BaseButton>
  <ContextMenu
    class="absolute bottom-full mb-1 flex w-32 flex-col gap-1"
    v-model="showModelSelector"
  >
    <BaseButton
      :class="selectedModel.name === model.name ? 'bg-neutral-700' : ''"
      @click="selectedModel = model"
      v-for="(model, i) in models"
      :key="i"
      class="w-full p-1.5 hover:bg-neutral-700"
    >
      {{ model.label }}
    </BaseButton>
  </ContextMenu>
</template>
