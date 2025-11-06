<script setup>
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import AutoResizeTextarea from '../ui/AutoResizeTextarea.vue'
import { useMessageStore } from '@/stores/messageStore'
import ModelSelector from './ModelSelector.vue'
// import FeatherIcon from '../ui/FeatherIcon.vue'

const messageStore = useMessageStore()

const { selectedMessagePath, activeGeneration, activeError, options } = storeToRefs(messageStore)

// State
const input = ref('')
// const files = ref([])
// const fileInputRef = ref(null)
// const isUploading = ref(false)

// Computed
const isGenerating = computed(() => Boolean(activeGeneration.value))
const isError = computed(() => Boolean(activeError.value))
const canSend = computed(() => input.value.trim() && !isGenerating.value) // && !isUploading.value)
const buttonIcon = computed(() => (isGenerating.value ? 'stop-circle' : 'arrow-up'))

// Actions
const send = async () => {
  if (!canSend.value) return

  // const content = [{ type: "input_text", text: input.value.trim() }]

  // for (const file of files.value) {
  //   content.push({
  //     type: file.type.startsWith('image') ? "input_image" : "input_file",
  //     file_id: file.file.id 
  //   })
  // }

  const content = input.value.trim()
  const parentId = selectedMessagePath.value.at(-1)
  input.value = ''
  // files.value = []

  await messageStore.sendMessage({ content, parentId })
}

const handleAction = () => {
  if (isGenerating.value) {
    messageStore.cancelReply({
      messageId: activeGeneration.value?.realId ?? activeGeneration.value.id,
    })
    return
  }
  send()
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      return
    } else {
      e.preventDefault()
      send()
    }
  }
}

// const openFileDialog = () => {
//   fileInputRef.value?.click()
// }

// const handleFileChange = async (event) => {
//   const newFile = event.target.files[0]
//   const newLength = files.value.push({ 
//     file: null, 
//     type: newFile.type, 
//     previewUrl: newFile.type.startsWith('image') ? URL.createObjectURL(newFile) : undefined 
//   })
  
//   isUploading.value = true
//   files.value[newLength - 1].file = await messageStore.uploadFile({ file: newFile })
//   isUploading.value = false
// }
</script>

<template>
  <div
    class="flex w-full flex-col rounded-xl border border-neutral-700 bg-neutral-800 p-2 shadow-lg/25"
  >
    <!--
    <div v-if="files.length > 0" class="flex p-1 mb-2 gap-2 overflow-x-auto">
      <div v-for="(file, i) in files" :key="i" class="relative shrink-0">
        <FeatherIcon v-if="!file.file" name="loader" class="absolute z-5 p-2 top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2" :spin="true"/>
        <img v-if="file.previewUrl" :class="{ 'opacity-50': !file.file }" class="h-16 w-16 object-cover object-center rounded-xl shadow/25" :src="file.previewUrl">
        <div v-else class="border border-neutral-700 p-4 rounded-xl">
          <FeatherIcon :size="30" name="file" />
        </div>
        <BaseButton
          icon="x"
          :icon-size="16"
          class="absolute top-0 right-0 bg-neutral-700 p-0.5 m-0.5 hover:bg-neutral-600"
          @click="files.splice(i, 1)"
        />
      </div>
    </div>
    -->
    <!-- Text Area -->
    <AutoResizeTextarea
      v-model="input"
      @keydown="handleKeydown"
      placeholder="Scrivi un messaggio..."
      class="mb-4 w-full p-2"
      :disabled="isGenerating || isError"
    />

    <!-- Actions -->
    <div class="relative flex items-center justify-between">
      <div class="flex items-center gap-1">
        <!--
        <input 
          ref="fileInputRef"
          type="file"
          id="fileInput" 
          class="hidden"
          @change="handleFileChange"
        />
        <BaseButton 
          variant="secondary"
          icon="paperclip"
          @click="openFileDialog"
        />
        -->
        <BaseButton
          icon="cpu"
          class="group relative p-2"
          :class="
            options.reasoning
              ? 'bg-indigo-800/30 text-indigo-400 hover:bg-indigo-700/30'
              : 'text-neutral-400 hover:bg-neutral-700'
          "
          @click="options.reasoning = !options.reasoning"
        />
      </div>

      <div class="relative flex items-center gap-2">
        <ModelSelector />
        <BaseButton
          @click="handleAction"
          :disabled="(!canSend && !isGenerating) || isError"
          variant="primary"
          :icon="buttonIcon"
          :icon-size="24"
        />
      </div>
    </div>
  </div>
</template>
