import { createRouter, createWebHistory } from 'vue-router'

import MainApp from '@/views/MainApp.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import VerifyView from '@/views/auth/VerifyView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import ProfileView from '@/views/auth/ProfileView.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import AllOrdersView from '@/views/AllOrdersView.vue'
import AllOrderDetailsView from '@/views/AllOrderDetailsView.vue'
import AdminUploadOrdersView from '@/views/AdminUploadOrdersView.vue'

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
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true },
    },
    {
      path: '/verify',
      name: 'verify',
      component: VerifyView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { guestOnly: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/all-orders',
      name: 'all-orders',
      component: AllOrdersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/all-orders/:orderId',
      name: 'all-order-details',
      component: AllOrderDetailsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/upload-orders',
      name: 'admin-upload-orders',
      component: AdminUploadOrdersView,
      meta: { requiresAuth: true },
    }
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
  } else if (to.meta.guestOnly && loggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
