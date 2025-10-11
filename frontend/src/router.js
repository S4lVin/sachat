import { createWebHistory, createRouter } from 'vue-router'
import ChatView from './views/ChatView.vue'
import AuthView from './views/AuthView.vue'
import { useAuthStore } from './stores/authStore'

const routes = [
  { path: '/chat/:chatId', name: 'Chat', component: ChatView },
  { path: '/', name: 'Auth', component: AuthView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.hasValidTokenLocal()

  const requiresAuth = to.path.startsWith('/chat')

  if (requiresAuth && !isAuthenticated) return next('/')
  if (to.path === '/' && isAuthenticated) return next('/chat/new')

  return next()
})
