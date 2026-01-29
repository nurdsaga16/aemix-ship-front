<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, PackageX } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import OrderDetailsView from '@/views/OrderDetailsView.vue'

const route = useRoute()
const router = useRouter()

const orders = [
  {
    id: 'AEMIX-9012',
    trackNumber: 'SF1234567890123',
    status: 'shipped',
    updatedAt: '22 янв 2026, 14:30',
  },
  {
    id: 'AEMIX-9013',
    trackNumber: 'YT9876543210987',
    status: 'arrived',
    updatedAt: '21 янв 2026, 09:15',
  },
  {
    id: 'AEMIX-9014',
    trackNumber: 'JD5555666677778',
    status: 'ready',
    updatedAt: '20 янв 2026, 18:45',
  },
  {
    id: 'AEMIX-9015',
    trackNumber: 'SF1111222233334',
    status: 'pending',
    updatedAt: '20 янв 2026, 10:05',
  },
  {
    id: 'AEMIX-9016',
    trackNumber: 'YT4444555566667',
    status: 'shipped',
    updatedAt: '19 янв 2026, 16:20',
  },
  {
    id: 'AEMIX-9017',
    trackNumber: 'JD8888999900001',
    status: 'arrived',
    updatedAt: '18 янв 2026, 11:40',
  },
]

const order = computed(() => {
  const orderId = String(route.params.orderId || '')
  return orders.find((item) => item.id === orderId)
})

const handleBack = () => {
  router.push('/all-orders')
}
</script>

<template>
  <OrderDetailsView v-if="order" :order="order" :on-back="handleBack" />

  <div v-else class="min-h-screen relative z-10">
    <header class="flex items-center gap-4 py-4 px-5">
      <button
        @click="handleBack"
        class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-caps text-lg">ЗАКАЗ НЕ НАЙДЕН</h1>
    </header>

    <main class="px-5 pb-8">
      <GlassCard class="text-center" :delay="0.1">
        <div class="w-16 h-16 rounded-2xl bg-glass/40 flex items-center justify-center mx-auto mb-4">
          <PackageX class="w-8 h-8 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground text-sm">
          Проверьте ID заказа и попробуйте снова.
        </p>
      </GlassCard>
    </main>
  </div>
</template>
