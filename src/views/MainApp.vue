<script setup>
import { computed, onMounted, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SupportButton from '@/components/SupportButton.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { getRoleFromToken } from '@/lib/auth'
import {
  Package,
  Plus,
  BookOpen,
  Building2,
  Layers,
  UploadCloud,
  Users,
  ScanLine,
  QrCode,
  Link2,
} from 'lucide-vue-next'
import { useOrdersStore } from '@/stores/useOrdersStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()

const userRole = computed(() => getRoleFromToken(authStore.authData?.token))

const activeOrdersCount = computed(() => ordersStore.activeOrdersCount)

const loadUserOrders = async () => {
  if (userRole.value === 'USER') {
    await ordersStore.fetchActiveOrdersCount().catch(() => {})
  }
}

onMounted(() => {
  loadUserOrders()
})

// Обновляем заказы при возврате на главную страницу
watch(() => route.path, (newPath) => {
  if (newPath === '/' && userRole.value === 'USER') {
    loadUserOrders()
  }
})

// Обновляем при активации компонента (если используется keep-alive)
onActivated(() => {
  if (userRole.value === 'USER') {
    loadUserOrders()
  }
})

const handleNavigate = (screen) => {
  if (screen === 'orders' || screen === 'add') {
    if (userRole.value !== 'USER') {
      return
    }
  }
  if (screen.startsWith('admin-') || screen === 'all-orders') {
    if (screen === 'admin-instructions') {
      if (userRole.value !== 'SUPER_ADMIN') return
    } else if (userRole.value !== 'ADMIN' && userRole.value !== 'SUPER_ADMIN') {
      return
    }
  }
  
  const routes = {
    'all-orders': '/admin/orders',
    'admin-upload': '/admin/orders/upload',
    'admin-users': '/admin/users',
    'admin-scan-logs': '/admin/scan-logs',
    'admin-scan': '/admin/scan',
    'admin-instructions': '/admin/instructions',
    'orders': '/orders',
    'add': '/orders/add',
    'instructions': '/instructions',
    'about': '/about',
  }
  
  if (routes[screen]) {
    router.push(routes[screen])
  }
}

const menuItems = computed(() => {
  const common = [
    { id: 'instructions', label: 'ИНСТРУКЦИИ', icon: BookOpen },
    { id: 'about', label: 'О КОМПАНИИ', icon: Building2 },
  ]

  if (userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN') {
    const adminItems = [
      { id: 'all-orders', label: 'ВСЕ ЗАКАЗЫ', icon: Layers },
      { id: 'admin-upload', label: 'ИМПОРТ ЗАКАЗОВ', icon: UploadCloud },
      { id: 'admin-users', label: 'ВСЕ ПОЛЬЗОВАТЕЛИ', icon: Users },
      { id: 'admin-scan-logs', label: 'ЛОГИ СКАНИРОВАНИЯ', icon: ScanLine },
      {
        id: 'admin-scan',
        label: 'СКАНИРОВАНИЕ',
        icon: QrCode,
        subtitle: 'Камера или ручной ввод',
        featured: true,
      },
      ...common,
    ]
    if (userRole.value === 'SUPER_ADMIN') {
      adminItems.splice(adminItems.length - common.length, 0, {
        id: 'admin-instructions',
        label: 'ССЫЛКИ ИНСТРУКЦИЙ',
        icon: Link2,
      })
    }
    return adminItems
  }

  if (userRole.value === 'USER') {
    return [
      { id: 'orders', label: 'МОИ ЗАКАЗЫ', icon: Package },
      { id: 'add', label: 'ДОБАВИТЬ ЗАКАЗ', icon: Plus },
      ...common,
    ]
  }

  return common
})
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <HomeView
      :active-orders-count="activeOrdersCount"
      :on-navigate="handleNavigate"
      :menu-items="menuItems"
      :show-active-orders="userRole === 'USER'"
    />
    <SupportButton />
  </div>
</template>
