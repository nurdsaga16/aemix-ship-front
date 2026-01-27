import { createRouter, createWebHistory } from 'vue-router'

import MainApp from '@/views/MainApp.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import VerifyView from '@/views/auth/VerifyView.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainApp,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/verify',
      name: 'verify',
      component: VerifyView,
    },
  ],
})

function isAuthenticated() {
  const authStore = useAuthStore()
  return !!authStore.authData?.token
}

router.beforeEach((to, from, next) => {
  const loggedIn = isAuthenticated()

  if (to.meta.requiresAuth && !loggedIn) {
    next('/login')
  } else if (!to.meta.requiresAuth && loggedIn && (to.name === 'LoginView')) {
    next('/')
  } else {
    next()
  }
})

export default router
