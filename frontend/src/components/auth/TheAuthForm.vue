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

const submit = async () => {
  const user = { email: email.value, password: password.value, name: name.value }

  const success =
    props.type === 'register' ? await authStore.register(user) : await authStore.login(user)

  if (success) {
    emit('close')
    router.push('/chat/new')
  }
}

const isRegister = () => props.type === 'register'
</script>

<template>
  <div @click="$emit('close')" class="bg- fixed inset-0 bg-black/50 backdrop-blur-xs"></div>
  <div
    class="absolute top-1/2 left-1/2 w-112 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-800 p-8"
  >
    <div class="mb-8 flex items-center justify-between">
      <div class="text-2xl">{{ isRegister() ? 'Registrati' : 'Accedi' }}</div>
      <feather-icons
        @click="$emit('close')"
        name="x"
        class="cursor-pointer hover:text-neutral-300"
      ></feather-icons>
    </div>
    <div class="mb-6 flex flex-col gap-4">
      <input
        v-model="name"
        v-if="isRegister()"
        class="rounded-lg bg-neutral-700 p-2"
        placeholder="Nome"
      />
      <input v-model="email" class="rounded-lg bg-neutral-700 p-2" placeholder="Indirizzo e-mail" />
      <input v-model="password" class="rounded-lg bg-neutral-700 p-2" placeholder="Password" />
    </div>
    <button
      @click="submit"
      class="w-full cursor-pointer rounded-lg bg-indigo-800 p-2 transition-colors hover:bg-indigo-900"
    >
      Continua
    </button>
  </div>
</template>
