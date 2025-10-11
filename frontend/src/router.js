import { createWebHistory, createRouter } from 'vue-router'
import ChatView from './views/ChatView.vue'
import AuthView from './views/AuthView.vue'

const routes = [
  { path: '/:pathMatch(.*)*', redirect: '/' },
  { path: '/app', component: ChatView },
  { path: '/', component: AuthView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
