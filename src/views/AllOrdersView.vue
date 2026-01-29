<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Package, Search, SlidersHorizontal, ChevronDown } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const props = defineProps({
  onBack: {
    type: Function,
    required: false
  },
  onOrderClick: {
    type: Function,
    required: false
  }
})

const router = useRouter()

const orders = ref([
  {
    id: 'AEMIX-9012',
    trackNumber: 'SF1234567890123',
    status: 'shipped',
    pickupPoint: 'Алматы, ТРЦ Mega Center',
    updatedAt: '22 янв 2026, 14:30',
  },
  {
    id: 'AEMIX-9013',
    trackNumber: 'YT9876543210987',
    status: 'arrived',
    pickupPoint: 'Астана, пр-т Кабанбай батыра 10',
    updatedAt: '21 янв 2026, 09:15',
  },
  {
    id: 'AEMIX-9014',
    trackNumber: 'JD5555666677778',
    status: 'ready',
    pickupPoint: 'Алматы, ул. Абая 150',
    updatedAt: '20 янв 2026, 18:45',
  },
  {
    id: 'AEMIX-9015',
    trackNumber: 'SF1111222233334',
    status: 'pending',
    pickupPoint: 'Шымкент, ул. Тауке хана 32',
    updatedAt: '20 янв 2026, 10:05',
  },
  {
    id: 'AEMIX-9016',
    trackNumber: 'YT4444555566667',
    status: 'shipped',
    pickupPoint: 'Алматы, ТРЦ Mega Center',
    updatedAt: '19 янв 2026, 16:20',
  },
  {
    id: 'AEMIX-9017',
    trackNumber: 'JD8888999900001',
    status: 'arrived',
    pickupPoint: 'Астана, пр-т Кабанбай батыра 10',
    updatedAt: '18 янв 2026, 11:40',
  },
])

const searchQuery = ref('')
const statusFilter = ref('all')
const pickupFilter = ref('all')
const sortOption = ref('newest')

const filters = [
  { id: 'all', label: 'ВСЕ' },
  { id: 'pending', label: 'ОЖИДАЕТ' },
  { id: 'shipped', label: 'В ПУТИ' },
  { id: 'arrived', label: 'ПРИБЫЛ' },
  { id: 'ready', label: 'ГОТОВ' },
]

const pickupOptions = computed(() => {
  const points = orders.value.map((order) => order.pickupPoint)
  return Array.from(new Set(points))
})

const sortOptions = [
  { id: 'status', label: 'От ожидание до готов' },
  { id: 'newest', label: 'Сначала новые' },
  { id: 'oldest', label: 'Сначала старые' },
]

const statusOrder = ['pending', 'shipped', 'arrived', 'ready']
const monthMap = {
  янв: 0,
  фев: 1,
  мар: 2,
  апр: 3,
  май: 4,
  июн: 5,
  июл: 6,
  авг: 7,
  сен: 8,
  окт: 9,
  ноя: 10,
  дек: 11,
}

const parseRuDate = (value) => {
  const text = String(value || '').trim().toLowerCase()
  const match = text.match(/(\d{1,2})\s([а-я]+)\s(\d{4}),\s(\d{2}):(\d{2})/)
  if (!match) return 0
  const [, day, monthKey, year, hours, minutes] = match
  const monthIndex = monthMap[monthKey]
  if (monthIndex === undefined) return 0
  return new Date(
    Number(year),
    monthIndex,
    Number(day),
    Number(hours),
    Number(minutes),
  ).getTime()
}

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toUpperCase()
  return orders.value.filter((order) => {
    const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value
    const matchesPickup = pickupFilter.value === 'all' || order.pickupPoint === pickupFilter.value
    const matchesQuery =
      !query ||
      order.trackNumber.toUpperCase().includes(query)
    return matchesStatus && matchesPickup && matchesQuery
  })
})

const sortedOrders = computed(() => {
  const items = [...filteredOrders.value]
  if (sortOption.value === 'status') {
    return items.sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
    )
  }
  if (sortOption.value === 'oldest') {
    return items.sort((a, b) => parseRuDate(a.updatedAt) - parseRuDate(b.updatedAt))
  }
  return items.sort((a, b) => parseRuDate(b.updatedAt) - parseRuDate(a.updatedAt))
})

const handleBack = () => {
  if (props.onBack) {
    props.onBack()
    return
  }
  router.push('/')
}

const handleOrderClick = (orderId) => {
  if (props.onOrderClick) {
    props.onOrderClick(orderId)
    return
  }
  router.push(`/all-orders/${orderId}`)
}
</script>

<template>
  <div class="min-h-screen relative z-10">
    <!-- Header -->
    <header class="flex items-center gap-4 py-4 px-5">
      <button
        @click="handleBack"
        class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-caps text-lg">ВСЕ ЗАКАЗЫ</h1>
    </header>

    <main class="px-5 pb-8 space-y-5 md:max-w-3xl md:mx-auto">
      <!-- Search -->
      <GlassCard :delay="0.05">
        <label class="block text-caps text-xs text-muted-foreground mb-3">
          ПОИСК
        </label>
        <div class="relative">
          <Search class="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Трек-код"
            class="w-full bg-glass/40 border border-glass-border rounded-2xl pl-11 pr-4 py-3 text-foreground font-mono text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </GlassCard>

      <!-- Filters -->
      <div>
        <div class="flex items-center gap-2 text-caps text-xs text-muted-foreground mb-3">
          <SlidersHorizontal class="w-4 h-4" />
          <span>ФИЛЬТРЫ</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in filters"
            :key="filter.id"
            @click="statusFilter = filter.id"
            :class="[
              'px-4 py-2 rounded-full text-caps text-xs transition-all',
              statusFilter === filter.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-glass/40 text-muted-foreground hover:text-foreground'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
        <GlassCard class="mt-4" :delay="0.12">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="block text-caps text-[11px] text-muted-foreground mb-2">
                ПУНКТ ВЫДАЧИ
              </label>
              <div class="relative">
                <select
                  v-model="pickupFilter"
                  class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                >
                  <option value="all">Все пункты</option>
                  <option v-for="point in pickupOptions" :key="point" :value="point">
                    {{ point }}
                  </option>
                </select>
                <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <ChevronDown class="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <label class="block text-caps text-[11px] text-muted-foreground mb-2">
                СОРТИРОВКА
              </label>
              <div class="relative">
                <select
                  v-model="sortOption"
                  class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                >
                  <option v-for="option in sortOptions" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
                <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <ChevronDown class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div v-if="sortedOrders.length === 0" class="flex flex-col items-center justify-center min-h-[45vh] animate-slide-up">
        <!-- Empty State -->
        <div class="w-24 h-24 rounded-3xl bg-glass/40 flex items-center justify-center mb-6">
          <Package class="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 class="text-caps text-lg mb-2">НЕТ ЗАКАЗОВ</h2>
        <p class="text-muted-foreground text-sm text-center">
          Проверьте фильтры или запрос<br />
          <span class="text-accent-italic">и попробуйте снова</span>
        </p>
      </div>

      <div v-else class="space-y-3">
        <!-- Orders List -->
        <GlassCard
          v-for="(order, index) in sortedOrders"
          :key="order.id"
          @click="handleOrderClick(order.id)"
          :delay="0.1 + index * 0.06"
          class="cursor-pointer"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="text-caps text-base mb-1">{{ order.id }}</p>
              <p class="text-muted-foreground text-xs font-mono">
                {{ order.trackNumber }}
              </p>
            </div>
            <StatusBadge :status="order.status" />
          </div>
          <p class="text-muted-foreground text-xs">
            Пункт выдачи: {{ order.pickupPoint }}
          </p>
          <p class="text-muted-foreground text-xs">
            Обновлено: {{ order.updatedAt }}
          </p>
        </GlassCard>
      </div>
    </main>
  </div>
</template>
