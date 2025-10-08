<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'

defineProps({
  sender: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div v-if="sender == 'user'" class="mt-4 flex justify-end">
    <div class="rounded-xl bg-neutral-800 px-6 py-4 text-end">{{ message }}</div>
  </div>
  <div v-else class="mt-4">
    <div class="mb-1 font-bold uppercase">{{ sender }}</div>
    {{ message }}
    <div class="mt-2 flex gap-x-3 text-neutral-500">
      <button class="cursor-pointer">
        <feather-icons class="hover:text-neutral-600" name="copy" />
      </button>
      <button class="cursor-pointer">
        <feather-icons class="hover:text-neutral-600" name="repeat" />
      </button>
      <button class="cursor-pointer">
        <feather-icons class="hover:text-neutral-600" name="edit" />
      </button>
    </div>
  </div>
</template>
