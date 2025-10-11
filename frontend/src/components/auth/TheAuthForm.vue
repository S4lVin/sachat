<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import { router } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'

const emit = defineEmits(['close'])
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const submit = async () => {
  const user = { email: email.value, password: password.value, name: name.value }
  try {
    const success =
      props.type === 'register' ? await authStore.register(user) : await authStore.login(user)

    if (success) {
      emit('close')
      router.push('/chat/new')
    }
  } catch (error) {
    errorMessage.value = error.message
  }
}

const isRegister = () => props.type === 'register'
</script>

<template>
  <div @click="$emit('close')" class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
  <div
    class="absolute top-1/2 left-1/2 w-112 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-800 p-8"
  >
    <div class="mb-8 flex items-center justify-between">
      <div class="text-2xl">{{ isRegister() ? 'Registrati' : 'Accedi' }}</div>
      <feather-icons
        @click="$emit('close')"
        name="x"
        class="cursor-pointer hover:text-neutral-300"
      />
    </div>
    <div v-if="errorMessage" class="mb-1 text-red-500">
      {{ errorMessage }}
    </div>
    <form @submit.prevent="submit" class="mb-6 flex flex-col gap-4">
      <input
        v-if="isRegister()"
        v-model="name"
        class="rounded-lg bg-neutral-700 p-2"
        placeholder="Nome"
        autocomplete="name"
        required
      />
      <input
        v-model="email"
        class="rounded-lg bg-neutral-700 p-2"
        placeholder="Indirizzo e-mail"
        type="email"
        autocomplete="email"
        required
      />
      <input
        v-model="password"
        class="rounded-lg bg-neutral-700 p-2"
        placeholder="Password"
        type="password"
        autocomplete="current-password"
        required
      />
      <button
        type="submit"
        class="w-full cursor-pointer rounded-lg bg-indigo-800 p-2 transition-colors hover:bg-indigo-900"
      >
        Continua
      </button>
    </form>
  </div>
</template>
