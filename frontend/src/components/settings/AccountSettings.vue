<script setup>
import BaseButton from '../ui/BaseButton.vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

// State
const userName = ref(user.value.name)

// Computed
const isNameEqual = computed(() => user.value.name === userName.value)
</script>

<template>
  <div class="mb-4 flex flex-1 flex-col overflow-auto text-sm">
    <div class="flex flex-col gap-1">
      <span>Nome</span>
      <input
        v-model="userName"
        class="rounded-lg border border-neutral-600 bg-neutral-700 p-1 focus:outline-none"
      />
    </div>
    <hr class="my-6 text-neutral-700" />
    <div>
      <BaseButton
        @click="authStore.deleteUser()"
        class="text-md bg-red-900 p-2 font-medium hover:bg-red-800"
      >
        Elimina Account
      </BaseButton>
    </div>
  </div>
  <div class="flex justify-end">
    <BaseButton
      :disabled="isNameEqual"
      @click="authStore.updateUser({ name: userName })"
      variant="primary"
    >
      Applica
    </BaseButton>
  </div>
</template>
