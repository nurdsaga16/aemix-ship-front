<script setup>
import { MapPin, Edit2, Check, X, Package } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import Loader from '@/components/Loader.vue'
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/useOrdersStore'

const props = defineProps({
  order: {
    type: Object,
    required: false,
    default: null
  },
  onBack: {
    type: Function,
    required: false,
    default: null
  }
})

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

const isEditingTitle = ref(false)
const editedTitle = ref('')
const isSavingTitle = ref(false)
const titleError = ref('')

const order = computed(() => {
  if (props.order) {
    return props.order
  }
  
  const trackCode = String(route.params.trackCode || '')
  const found = ordersStore.orders.find((item) => item.trackCode === trackCode)
  if (!found) return null

  return {
    id: found.title || found.trackCode,
    trackCode: found.trackCode,
    trackNumber: found.trackCode,
    title: found.title,
    status: found.status,
    updatedAt: found.updatedAtLabel,
  }
})

const handleBack = () => {
  if (props.onBack) {
    props.onBack()
  } else {
    router.push('/orders')
  }
}

const startEditingTitle = () => {
  isEditingTitle.value = true
  editedTitle.value = order.value?.title || ''
  titleError.value = ''
}

const cancelEditingTitle = () => {
  isEditingTitle.value = false
  editedTitle.value = ''
  titleError.value = ''
}

const saveTitle = async () => {
  if (!order.value?.trackCode) return
  
  isSavingTitle.value = true
  titleError.value = ''
  
  try {
    const updatedOrder = await ordersStore.updateOrderTitle(
      order.value.trackCode,
      editedTitle.value.trim() || null
    )
    
    const foundIndex = ordersStore.orders.findIndex(
      (item) => item.trackCode === order.value.trackCode
    )
    if (foundIndex !== -1) {
      ordersStore.orders[foundIndex].title = updatedOrder.title
    }
    
    isEditingTitle.value = false
  } catch (e) {
    titleError.value = e.response?.data?.message || 'Не удалось обновить название'
  } finally {
    isSavingTitle.value = false
  }
}

const ensureOrderLoaded = async () => {
  if (props.order) return
  
  const trackCode = String(route.params.trackCode || '')
  if (!trackCode) return

  const exists = ordersStore.orders.some((item) => item.trackCode === trackCode)
  if (exists) return

  try {
    await ordersStore.fetchMyOrders({
      page: 0,
      size: 1,
      text: trackCode,
    })
  } catch (e) {
    console.error('Failed to load order:', e)
  }
}

onMounted(() => {
  ensureOrderLoaded()
})

watch(() => route.params.trackCode, () => {
  ensureOrderLoaded()
})

const statusInfo = {
  pending: { emoji: '⏳', label: 'ОЖИДАНИЕ', step: 0 },
  shipped: { emoji: '🟡', label: 'В ПУТИ', step: 1 },
  arrived: { emoji: '🟢', label: 'ПРИБЫЛ', step: 2 },
  ready: { emoji: '✅', label: 'ВЫДАЧА', step: 3 },
}

const timelineSteps = [
  { label: 'КИТАЙ', sublabel: 'Склад отправки' },
  { label: 'В ПУТИ', sublabel: 'Международная доставка' },
  { label: 'РОССИЯ', sublabel: 'Таможня и сортировка' },
  { label: 'ВЫДАЧА', sublabel: 'Пункт получения' },
]

const info = computed(() => {
  if (!order.value) return null
  return statusInfo[order.value.status]
})
</script>

<template>
  <PageLayout v-if="order && info">
    <PageHeader :title="order.title || order.trackCode" :on-back="handleBack" />

    <PageMain>
      <GlassCard class="mb-6 text-center" :delay="0.1">
        <div class="text-5xl mb-4">{{ info.emoji }}</div>
        <h2 class="text-caps text-xl mb-2">{{ info.label }}</h2>
        <p class="text-muted-foreground text-sm font-mono">{{ order.trackNumber }}</p>
      </GlassCard>

      <GlassCard v-if="!props.order" :delay="0.15" class="mb-6 overflow-hidden">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package class="w-5 h-5 text-primary" />
            </div>
            <div>
              <label class="text-caps text-xs text-muted-foreground block mb-1">НАЗВАНИЕ ЗАКАЗА</label>
              <div v-if="!isEditingTitle" class="flex items-center gap-2">
                <p class="text-foreground text-base font-semibold leading-tight">
                  {{ order.title || '-' }}
                </p>
              </div>
            </div>
          </div>
          <button
            v-if="!isEditingTitle"
            @click="startEditingTitle"
            class="p-2.5 rounded-xl glass-button hover:bg-primary/10 hover:border-primary/30 transition-all group shrink-0"
            title="Редактировать название"
          >
            <Edit2 class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
        
        <div v-if="isEditingTitle" class="space-y-4 pt-4 border-t border-glass-border">
          <div>
            <input
              v-model="editedTitle"
              type="text"
              placeholder="Например: Заказ из Pinduoduo"
              class="w-full bg-glass/60 border-2 border-glass-border rounded-2xl px-4 py-3.5 text-foreground text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              @keyup.enter="saveTitle"
              @keyup.esc="cancelEditingTitle"
              autofocus
            />
            
            <div v-if="titleError" class="mt-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <p class="text-sm text-red-400">{{ titleError }}</p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button
              @click="saveTitle"
              :disabled="isSavingTitle"
              class="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              <Check v-if="!isSavingTitle" class="w-4 h-4" />
              <Loader v-else size="sm" variant="foreground" />
              <span>{{ isSavingTitle ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ' }}</span>
            </button>
            <button
              @click="cancelEditingTitle"
              :disabled="isSavingTitle"
              class="py-3 px-4 rounded-xl glass-button text-foreground text-sm flex items-center justify-center hover:bg-glass/60 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard :delay="0.2">
        <h3 class="text-caps text-sm mb-6 text-muted-foreground">МАРШРУТ ДОСТАВКИ</h3>
        
        <div class="relative pl-8">
          <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-glass-border rounded-full" />
          
          <div
            class="absolute left-3 top-2 w-0.5 bg-primary rounded-full transition-all duration-500 origin-top"
            :style="{ height: `${(info.step / (timelineSteps.length - 1)) * 90}%` }"
          />

          <div class="space-y-8">
            <div
              v-for="(step, index) in timelineSteps"
              :key="index"
              class="relative"
            >
              <div
                :class="[
                  'absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all',
                  index <= info.step ? 'bg-primary' : 'bg-glass-border',
                  index === info.step ? 'animate-pulse-glow' : ''
                ]"
              >
                <MapPin :class="['w-3 h-3', index <= info.step ? 'text-primary-foreground' : 'text-muted-foreground']" />
              </div>

              <div :class="index === info.step ? 'opacity-100' : 'opacity-60'">
                <p class="text-caps text-sm">{{ step.label }}</p>
                <p class="text-muted-foreground text-xs">{{ step.sublabel }}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <p class="text-center text-muted-foreground text-xs mt-6">
        Последнее обновление: {{ order.updatedAt }}
      </p>
    </PageMain>
  </PageLayout>

  <PageLayout v-else>
    <PageHeader title="ЗАКАЗ" :on-back="handleBack" />

    <PageMain>
      <GlassCard class="text-center" :delay="0.1">
        <div class="flex items-center justify-center">
          <Loader size="lg" />
        </div>
      </GlassCard>
    </PageMain>
  </PageLayout>
</template>
