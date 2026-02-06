<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PackageX } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import Loader from '@/components/Loader.vue'
import UserOrderDetailsView from '@/views/user/UserOrderDetailsView.vue'
import { useOrdersStore } from '@/stores/useOrdersStore'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

const isLoadingLocal = ref(false)
const loadError = ref(null)

const order = computed(() => {
  const trackCode = String(route.params.orderId || '')
  const found = ordersStore.orders.find((item) => item.trackCode === trackCode)
  if (!found) return null

  return {
    id: found.title || found.trackCode,
    trackNumber: found.trackCode,
    status: found.status,
    updatedAt: found.updatedAtLabel,
  }
})

const handleBack = () => {
  router.push('/admin/orders')
}

const ensureOrderLoaded = async () => {
  const trackCode = String(route.params.orderId || '')
  if (!trackCode) return

  const exists = ordersStore.orders.some((item) => item.trackCode === trackCode)
  if (exists) return

  isLoadingLocal.value = true
  loadError.value = null
  try {
    await ordersStore.fetchOrders({
      page: 0,
      size: 1,
      trackCode,
    })
  } catch (e) {
    loadError.value = ordersStore.error || 'Не удалось загрузить заказ'
  } finally {
    isLoadingLocal.value = false
  }
}

onMounted(() => {
  ensureOrderLoaded()
})
</script>

<template>
  <UserOrderDetailsView v-if="order" :order="order" :on-back="handleBack" />

  <PageLayout v-else>
    <PageHeader title="ЗАКАЗ НЕ НАЙДЕН" :on-back="handleBack" />

    <PageMain>
      <GlassCard class="text-center" :delay="0.1">
        <div class="w-16 h-16 rounded-2xl bg-glass/40 flex items-center justify-center mx-auto mb-4">
          <PackageX class="w-8 h-8 text-muted-foreground" />
        </div>
        <div v-if="isLoadingLocal || ordersStore.loading" class="flex items-center justify-center">
          <Loader size="lg" />
        </div>
        <p v-else-if="loadError || ordersStore.error" class="text-destructive text-sm">
          {{ loadError || ordersStore.error }}
        </p>
        <p v-else class="text-muted-foreground text-sm">
          Проверьте ID заказа и попробуйте снова.
        </p>
      </GlassCard>
    </PageMain>
  </PageLayout>
</template>
