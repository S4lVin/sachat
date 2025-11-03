<script setup>
import { RouterView } from 'vue-router'

function setViewportHeight() {
  const height = window.visualViewport ? window.visualViewport.height : window.innerHeight
  document.documentElement.style.setProperty('--real-vh', `${height * 0.01}px`)
}

setViewportHeight()
window.addEventListener('resize', setViewportHeight)
window.addEventListener('orientationchange', setViewportHeight)
window.visualViewport?.addEventListener('resize', setViewportHeight)
</script>

<template>
  <RouterView />
</template>
