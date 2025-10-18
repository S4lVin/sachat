import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import AuthView from './views/AuthView.vue'
import ChatView from './views/ChatView.vue'

const routes = [
  { path: '/', name: 'Auth', component: AuthView },
  {
    path: '/chat/:chatId',
    name: 'Chat',
    component: ChatView,
    meta: { requiresAuth: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.hasValidTokenLocal()

  const requiresAuth = to.matched.some((route) => route.meta?.requiresAuth)

  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'Auth' })
  }

  if (to.name === 'Auth' && isAuthenticated) {
    return next({ name: 'Chat', params: { chatId: 'new' } })
  }

  return next()
})
