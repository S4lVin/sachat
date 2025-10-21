<script setup>
import { router } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { ref, computed } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'

// Options
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
const fieldKeys = computed(() => fields.value.map((field) => field.key))

// Helpers
const resetFieldErrors = () => {
  errorMessage.value = ''
  fieldKeys.value.forEach((key) => {
    if (formData.value[key]) formData.value[key].error = ''
  })
}

const buildPayload = () => {
  const payload = {}

  for (const key of fieldKeys.value) {
    const rawValue = formData.value[key]?.value
    const cleanValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue

    payload[key] = cleanValue
  }

  return payload
}

const applyApiErrors = (err) => {
  const details = err?.details

  if (Array.isArray(details)) {
    for (const detail of details) {
      const field = detail?.field
      if (!formData.value[field]) continue
      formData.value[detail.field].error = detail.message
    }

    return
  }
  
  errorMessage.value = err?.message
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

</script>

<template>
  <BaseModal @close="emit('close')" class="w-112 p-4" :title="title" :background="true">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div class="text-2xl">{{ title }}</div>
      <BaseButton @click="$emit('close')" variant="ghost" icon="x" :icon-size="24"/>
    </div>

    <!-- General Error Message -->
    <div v-if="errorMessage" class="mb-2 text-red-500">
      {{ errorMessage }}
    </div>

    <!-- Form -->
    <form @submit.prevent="submit" class="mb-4 flex flex-col gap-4">
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

      <BaseButton
        type="submit"
        class="w-full"
        variant="primary"
      >
        Continua
      </BaseButton>
    </form>
  </BaseModal>
</template>
