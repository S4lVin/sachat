<script setup>
import FeatherIcons from '@/components/FeatherIcon.vue'
import { router } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { ref, computed } from 'vue'

const emit = defineEmits(['close'])
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['login', 'register'].includes(value),
  },
})

// Stores
const authStore = useAuthStore()

// State
const errorMessage = ref('')
const formData = ref({
  name: { value: '', error: '' },
  email: { value: '', error: '' },
  password: { value: '', error: '' },
})

// Computed
const isRegister = computed(() => props.type === 'register')
const title = computed(() => (isRegister.value ? 'Registrati' : 'Accedi'))
const fields = computed(() => [
  ...(isRegister.value
    ? [{ key: 'name', type: 'text', placeholder: 'Nome', autocomplete: 'name' }]
    : []),
  { key: 'email', type: 'email', placeholder: 'Email', autocomplete: 'email' },
  { key: 'password', type: 'password', placeholder: 'Password', autocomplete: 'current-password' },
])

// Helpers
const fieldKeys = computed(() => fields.value.map((f) => f.key))

const resetFieldErrors = () => {
  errorMessage.value = ''
  fieldKeys.value.forEach((key) => {
    if (formData.value[key]) formData.value[key].error = ''
  })
}

const buildPayload = () => {
  // Solo i campi visibili, trim sulle stringhe
  return fieldKeys.value.reduce((acc, key) => {
    const v = formData.value[key]?.value
    acc[key] = typeof v === 'string' ? v.trim() : v
    return acc
  }, {})
}

const applyApiErrors = (err) => {
  if (err?.details && Array.isArray(err.details)) {
    err.details.forEach((detail) => {
      if (detail.field && formData.value[detail.field]) {
        formData.value[detail.field].error = detail.message
      }
    })
  } else {
    errorMessage.value = err?.message || 'Si è verificato un errore. Riprova.'
  }
}

// Actions
const submit = async () => {
  resetFieldErrors()
  const authMethod = isRegister.value ? 'register' : 'login'

  try {
    const success = await authStore[authMethod](buildPayload())
    if (success) {
      emit('close')
      router.push('/chat/new')
    }
  } catch (err) {
    applyApiErrors(err)
  }
}

const closeModal = () => emit('close')
</script>

<template>
  <div @click="closeModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
  <div
    class="absolute top-1/2 left-1/2 w-112 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-800 p-8"
  >
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div class="text-2xl">{{ title }}</div>
      <feather-icons @click="closeModal" name="x" class="cursor-pointer hover:text-neutral-300" />
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-2 text-red-500">
      {{ errorMessage }}
    </div>

    <!-- Form -->
    <form @submit.prevent="submit" class="mb-6 flex flex-col gap-4">
      <div v-for="field in fields" :key="field.key">
        <div v-if="formData[field.key].error" class="mb-1 text-sm text-red-500">
          {{ formData[field.key].error }}
        </div>
        <input
          v-model="formData[field.key].value"
          :type="field.type"
          :placeholder="field.placeholder"
          :autocomplete="field.autocomplete"
          :class="[
            'w-full rounded-xl bg-neutral-700 p-2',
            formData[field.key].error && 'border border-red-500',
          ]"
          required
        />
      </div>

      <button
        type="submit"
        class="w-full cursor-pointer rounded-xl bg-indigo-800 p-2 transition-colors hover:bg-indigo-900"
      >
        Continua
      </button>
    </form>
  </div>
</template>
