<script setup>
import TheAuthForm from '@/components/auth/TheAuthForm.vue'
import { reactive } from 'vue'

const authForm = reactive({
  isOpen: false,
  type: 'login',
})

const openForm = (type) => {
  authForm.isOpen = true
  authForm.type = type
}
const closeForm = () => (authForm.isOpen = false)
</script>

<template>
  <div
    class="relative mx-auto flex h-screen w-screen max-w-5xl flex-col justify-between overflow-clip px-4 py-4 text-neutral-200 md:px-8"
  >
    <TheAuthForm @close="closeForm" v-if="authForm.isOpen" :type="authForm.type" />
    <div class="flex h-full w-full flex-col justify-center">
      <div class="mb-4 text-4xl font-bold">Benvenuto su SaChat</div>
      <div class="mb-8 leading-8 text-neutral-300">
        SaChat è una WebApp creata da Salvatore Giaquinto per poter interagire con LLM (Large
        Language Model) forniti da OpenAI.
      </div>
      <div class="flex gap-4 font-medium">
        <button
          @click="openForm('login')"
          class="w-32 cursor-pointer rounded-lg bg-indigo-800 p-4 transition-colors hover:bg-indigo-900"
        >
          Accedi
        </button>
        <button
          @click="openForm('register')"
          class="w-32 cursor-pointer rounded-lg bg-neutral-700 p-4 transition-colors hover:bg-neutral-800"
        >
          Registrati
        </button>
      </div>
    </div>
    <footer class="mt-16 flex w-full justify-between text-neutral-400">
      <div class="text-sm">&copy; 2025 Salvatore Giaquinto. Tutti i diritti riservati.</div>
      <div class="flex gap-4 text-sm">
        <a href="#" class="transition-colors hover:text-neutral-300">Codice sorgente</a>
      </div>
    </footer>
  </div>
</template>
