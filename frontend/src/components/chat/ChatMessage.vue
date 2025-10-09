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
  <div v-if="sender == 'user'" class="group pb-10 mb-2 flex justify-end">
    <div class="relative">
      <div class="rounded-xl bg-neutral-800 px-6 py-4 text-end">{{ message }}</div>
      <div class="absolute right-0 mt-2 hidden gap-x-2 text-neutral-500 group-hover:flex">
        <button class="cursor-pointer">
          <feather-icons size="20" class="hover:text-neutral-600" name="copy" />
        </button>
        <button class="cursor-pointer">
          <feather-icons size="20" class="hover:text-neutral-600" name="edit" />
        </button>
      </div>
    </div>
    
  </div>
  <div v-else class="pb-10 mb-2 group relative">
    <div class="mb-1 font-bold uppercase">{{ sender }}</div>
    {{ message }}
    <div class="absolute left-0 mt-2 hidden gap-x-2 text-neutral-500 group-hover:flex">
      <button class="cursor-pointer">
        <feather-icons size="20" class="hover:text-neutral-600" name="copy" />
      </button>
      <button class="cursor-pointer">
        <feather-icons size="20" class="hover:text-neutral-600" name="repeat" />
      </button>
      <button class="cursor-pointer">
        <feather-icons size="20" class="hover:text-neutral-600" name="edit" />
      </button>
    </div>
  </div>
</template>
