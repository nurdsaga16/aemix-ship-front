import { createRouter, createWebHistory } from 'vue-router'

import MainApp from '@/views/MainApp.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import VerifyView from '@/views/auth/VerifyView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import ProfileView from '@/views/auth/ProfileView.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { getRoleFromToken } from '@/lib/auth'
import AllOrdersView from '@/views/admin/AllOrdersView.vue'
import AllOrderDetailsView from '@/views/admin/AllOrderDetailsView.vue'
import AdminUploadOrdersView from '@/views/admin/AdminUploadOrdersView.vue'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'
import AdminPointsView from '@/views/admin/AdminPointsView.vue'
import AdminScanLogsView from '@/views/admin/AdminScanLogsView.vue'
import ScanPage from '@/views/admin/ScanPage.vue'

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
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/all-orders/:orderId',
      name: 'all-order-details',
      component: AllOrderDetailsView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/upload-orders',
      name: 'upload-orders',
      component: AdminUploadOrdersView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/users',
      name: 'users',
      component: AdminUsersView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/points',
      name: 'points',
      component: AdminPointsView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/scan-logs',
      name: 'scan-logs',
      component: AdminScanLogsView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/scan',
      name: 'scan',
      component: ScanPage,
      meta: { requiresAuth: true, role: 'ADMIN' },
    }
  ],
})

function isAuthenticated() {
  const authStore = useAuthStore()
  return !!authStore.authData?.token
}

function getUserRole() {
  const authStore = useAuthStore()
  return getRoleFromToken(authStore.authData?.token)
}

router.beforeEach((to, from, next) => {
  const loggedIn = isAuthenticated()
  const requiredRole = to.meta?.role

  if (to.meta.requiresAuth && !loggedIn) {
    next('/login')
  } else if (to.meta.guestOnly && loggedIn) {
    next('/')
  } else if (requiredRole && getUserRole() !== requiredRole) {
    next('/')
  } else {
    next()
  }
})

export default router
