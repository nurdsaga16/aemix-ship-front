<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import OrdersView from '@/views/OrdersView.vue'
import OrderDetailsView from '@/views/OrderDetailsView.vue'
import InstructionsView from '@/views/InstructionsView.vue'
import AddOrderView from '@/views/AddOrderView.vue'
import AboutView from '@/views/AboutView.vue'
import SupportButton from '@/components/SupportButton.vue'

const currentScreen = ref('home')
const selectedOrderId = ref(null)
const router = useRouter()

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
  if (screen === 'all-orders') {
    router.push('/all-orders')
    return
  }
  if (screen === 'admin-upload') {
    router.push('/admin/upload-orders')
    return
  }
  if (screen === 'admin-users') {
    router.push('/admin/users')
    return
  }
  if (screen === 'admin-points') {
    router.push('/admin/points')
    return
  }
  if (screen === 'admin-scan-logs') {
    router.push('/admin/scan-logs')
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
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <HomeView
      v-if="currentScreen === 'home'"
      :active-orders-count="activeOrdersCount"
      :on-navigate="handleNavigate"
    />

    <OrdersView
      v-else-if="currentScreen === 'orders'"
      :orders="orders"
      :on-back="handleBack"
      :on-order-click="handleOrderClick"
    />

    <OrderDetailsView
      v-else-if="currentScreen === 'orderDetails' && selectedOrder"
      :order="selectedOrder"
      :on-back="handleBack"
    />

    <InstructionsView
      v-else-if="currentScreen === 'instructions'"
      :on-back="handleBack"
    />

    <AddOrderView
      v-else-if="currentScreen === 'add'"
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

