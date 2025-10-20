import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { storeToRefs } from 'pinia'
import AuthView from './views/AuthView.vue'
import ChatView from './views/ChatView.vue'

const routes = [
  {
    path: '/',
    name: 'Auth',
    component: AuthView
  },
  {
    path: '/chat/:chatId',
    name: 'Chat',
    component: ChatView,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  const { user } = storeToRefs(auth)

  const requiresAuth = to.matched.some((route) => route.meta?.requiresAuth)
  const isAuthenticated = auth.hasValidTokenLocal()

  if (requiresAuth) {
    if (isAuthenticated && !user.value) {
      await auth.fetchUser()
    }

    if (!isAuthenticated || !user.value) {
      return next({ name: 'Auth' })
    }
  }

  if (to.name === 'Auth' && isAuthenticated) {
    return next({ name: 'Chat', params: { chatId: 'new' } })
  }

  next()
})
