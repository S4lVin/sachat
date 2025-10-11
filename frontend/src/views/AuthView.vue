<script setup>
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.hasValidTokenLocal()) {
    router.push('/app')
  }
})
</script>

<template>
  <div>
    Auth Page
  </div>
</template>
