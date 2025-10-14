<script setup>
import AuthModal from '@/components/auth/AuthModal.vue'
import { ref } from 'vue'

const isModalOpen = ref(false)
const authType = ref('login')

function openForm(type) {
  authType.value = type
  isModalOpen.value = true
}
function closeForm() {
  isModalOpen.value = false
}
</script>

<template>
  <div class="flex min-h-screen w-screen flex-col text-neutral-200">
    <!-- Auth Modal -->
    <AuthModal v-if="isModalOpen" :type="authType" @close="closeForm" />

    <!-- Main Content -->
    <main class="flex flex-1 items-center px-4 py-8 md:px-8">
      <section class="mx-auto w-full max-w-5xl">
        <!-- Welcome Message -->
        <h1 class="mb-4 text-3xl font-bold md:text-4xl">Benvenuto su SaChat</h1>
        <p class="mb-8 max-w-3xl leading-7 text-neutral-300 md:leading-8">
          SaChat è una WebApp creata da Salvatore Giaquinto per poter interagire con LLM (Large
          Language Model) forniti da OpenAI.
        </p>

        <!-- Action Buttons -->
        <div class="flex gap-4 font-medium">
          <button
            @click="openForm('login')"
            class="w-32 cursor-pointer rounded-xl bg-indigo-800 p-4 transition-colors hover:bg-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            type="button"
          >
            Accedi
          </button>
          <button
            @click="openForm('register')"
            class="w-32 cursor-pointer rounded-xl bg-neutral-700 p-4 transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            type="button"
          >
            Registrati
          </button>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-neutral-800 px-4 py-4 md:px-8">
      <div class="mx-auto flex w-full max-w-5xl justify-between text-neutral-400">
        <small>&copy; 2025 Salvatore Giaquinto. Tutti i diritti riservati.</small>
        <nav class="flex gap-4 text-sm">
          <a
            href="#"
            class="transition-colors hover:text-neutral-300"
            target="_blank"
            rel="noopener"
          >
            Codice sorgente
          </a>
        </nav>
      </div>
    </footer>
  </div>
</template>