import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/useAuthStore'
import { getRoleFromToken } from '@/lib/auth'

const MainApp = () => import('@/views/MainApp.vue')
const LoginView = () => import('@/views/auth/LoginView.vue')
const TelegramCallbackView = () => import('@/views/auth/TelegramCallbackView.vue')
const RegisterView = () => import('@/views/auth/RegisterView.vue')
const VerifyView = () => import('@/views/auth/VerifyView.vue')
const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue')
const ProfileView = () => import('@/views/auth/ProfileView.vue')
const AdminOrdersView = () => import('@/views/admin/AdminOrdersView.vue')
const AdminOrderDetailsView = () => import('@/views/admin/AdminOrderDetailsView.vue')
const AdminUploadOrdersView = () => import('@/views/admin/AdminUploadOrdersView.vue')
const AdminUsersView = () => import('@/views/admin/AdminUsersView.vue')
const AdminScanLogsView = () => import('@/views/admin/AdminScanLogsView.vue')
const AdminScanView = () => import('@/views/admin/AdminScanView.vue')
const AdminInstructionsView = () => import('@/views/admin/AdminInstructionsView.vue')
const UserOrdersView = () => import('@/views/user/UserOrdersView.vue')
const UserOrderDetailsView = () => import('@/views/user/UserOrderDetailsView.vue')
const UserAddOrderView = () => import('@/views/user/UserAddOrderView.vue')
const InstructionsView = () => import('@/views/InstructionsView.vue')
const AboutView = () => import('@/views/AboutView.vue')

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
      path: '/telegram/callback',
      name: 'telegram-callback',
      component: TelegramCallbackView,
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
      path: '/orders',
      name: 'orders',
      component: UserOrdersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/add',
      name: 'add-order',
      component: UserAddOrderView,
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:trackCode',
      name: 'order-details',
      component: UserOrderDetailsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/orders',
      name: 'all-orders',
      component: AdminOrdersView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/orders/:orderId',
      name: 'all-order-details',
      component: AdminOrderDetailsView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/orders/upload',
      name: 'upload-orders',
      component: AdminUploadOrdersView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users',
      name: 'users',
      component: AdminUsersView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/scan-logs',
      name: 'scan-logs',
      component: AdminScanLogsView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/scan',
      name: 'scan',
      component: AdminScanView,
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/instructions',
      name: 'admin-instructions',
      component: AdminInstructionsView,
      meta: { requiresAuth: true, role: 'SUPER_ADMIN' },
    },
    {
      path: '/instructions',
      name: 'instructions',
      component: InstructionsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true },
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
  } else if (requiredRole) {
    const role = getUserRole()
    const allowed =
      requiredRole === 'ADMIN'
        ? role === 'ADMIN' || role === 'SUPER_ADMIN'
        : requiredRole === 'SUPER_ADMIN'
          ? role === 'SUPER_ADMIN'
          : role === requiredRole
    if (!allowed) next('/')
    else next()
  } else {
    next()
  }
})

export default router
