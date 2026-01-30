<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import OrdersView from '@/views/user/OrdersView.vue'
import OrderDetailsView from '@/views/user/OrderDetailsView.vue'
import InstructionsView from '@/views/InstructionsView.vue'
import AddOrderView from '@/views/user/AddOrderView.vue'
import AboutView from '@/views/AboutView.vue'
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
  MapPin,
  ScanLine,
  QrCode,
} from 'lucide-vue-next'

const currentScreen = ref('home')
const selectedOrderId = ref(null)
const router = useRouter()
const authStore = useAuthStore()

const userRole = computed(() => getRoleFromToken(authStore.authData?.token))

const orders = ref([
  {
    id: 'AEMIX-1234',
    trackNumber: 'SF1234567890123',
    status: 'shipped',
    updatedAt: '22 янв 2026, 14:30',
  },
  {
    id: 'AEMIX-1235',
    trackNumber: 'YT9876543210987',
    status: 'arrived',
    updatedAt: '21 янв 2026, 09:15',
  },
  {
    id: 'AEMIX-1236',
    trackNumber: 'JD5555666677778',
    status: 'ready',
    updatedAt: '20 янв 2026, 18:45',
  },
])

const handleNavigate = (screen) => {
  if (screen === 'orders' || screen === 'add' || screen === 'orderDetails') {
    if (userRole.value !== 'USER') {
      return
    }
  }
  if (screen.startsWith('admin-') || screen === 'all-orders') {
    if (userRole.value !== 'ADMIN') {
      return
    }
  }
  if (screen === 'all-orders') {
    router.push('/all-orders')
    return
  }
  if (screen === 'admin-upload') {
    router.push('/upload-orders')
    return
  }
  if (screen === 'admin-users') {
    router.push('/users')
    return
  }
  if (screen === 'admin-points') {
    router.push('/points')
    return
  }
  if (screen === 'admin-scan-logs') {
    router.push('/scan-logs')
    return
  }
  if (screen === 'admin-scan') {
    router.push('/scan')
    return
  }
  currentScreen.value = screen
}

const handleOrderClick = (orderId) => {
  selectedOrderId.value = orderId
  currentScreen.value = 'orderDetails'
}

const handleAddOrder = (trackNumber) => {
  const newOrder = {
    id: `AEMIX-${1237 + orders.value.length}`,
    trackNumber,
    status: 'pending',
    updatedAt: new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
  orders.value = [newOrder, ...orders.value]
}

const handleBack = () => {
  if (currentScreen.value === 'orderDetails') {
    currentScreen.value = 'orders'
    selectedOrderId.value = null
  } else {
    currentScreen.value = 'home'
  }
}

const selectedOrder = computed(() => {
  return orders.value.find((o) => o.id === selectedOrderId.value)
})

const activeOrdersCount = computed(() => {
  return orders.value.filter((o) => o.status !== 'ready').length
})

const menuItems = computed(() => {
  const common = [
    { id: 'instructions', label: 'ИНСТРУКЦИИ', icon: BookOpen },
    { id: 'about', label: 'О КОМПАНИИ', icon: Building2 },
  ]

  if (userRole.value === 'ADMIN') {
    return [
      { id: 'all-orders', label: 'ВСЕ ЗАКАЗЫ', icon: Layers },
      { id: 'admin-upload', label: 'ИМПОРТ ЗАКАЗОВ', icon: UploadCloud },
      { id: 'admin-users', label: 'ВСЕ ПОЛЬЗОВАТЕЛИ', icon: Users },
      { id: 'admin-points', label: 'ПУНКТЫ ВЫДАЧИ', icon: MapPin },
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
      v-if="currentScreen === 'home'"
      :active-orders-count="activeOrdersCount"
      :on-navigate="handleNavigate"
      :menu-items="menuItems"
      :show-active-orders="userRole === 'USER'"
    />

    <OrdersView
      v-else-if="currentScreen === 'orders' && userRole === 'USER'"
      :orders="orders"
      :on-back="handleBack"
      :on-order-click="handleOrderClick"
    />

    <OrderDetailsView
      v-else-if="currentScreen === 'orderDetails' && selectedOrder && userRole === 'USER'"
      :order="selectedOrder"
      :on-back="handleBack"
    />

    <InstructionsView
      v-else-if="currentScreen === 'instructions'"
      :on-back="handleBack"
    />

    <AddOrderView
      v-else-if="currentScreen === 'add' && userRole === 'USER'"
      :on-back="handleBack"
      :on-add-order="handleAddOrder"
    />

    <AboutView
      v-else-if="currentScreen === 'about'"
      :on-back="handleBack"
    />

    <SupportButton v-if="currentScreen === 'home'" />
  </div>
</template>

