<script setup>
import { computed, ref } from 'vue'
import { ArrowLeft, Package, ChevronDown } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  onBack: {
    type: Function,
    required: true
  },
  onOrderClick: {
    type: Function,
    required: true
  }
})

const sortOption = ref('newest')
const statusFilter = ref('all')

const sortOptions = [
  { id: 'status', label: 'От ожидание до готов' },
  { id: 'newest', label: 'Сначала новые' },
  { id: 'oldest', label: 'Сначала старые' },
]

const statusOptions = [
  { id: 'all', label: 'Все статусы' },
  { id: 'pending', label: 'Ожидает' },
  { id: 'shipped', label: 'В пути' },
  { id: 'arrived', label: 'Прибыл' },
  { id: 'ready', label: 'Готов' },
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
  if (statusFilter.value === 'all') {
    return props.orders
  }
  return props.orders.filter((order) => order.status === statusFilter.value)
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
</script>

<template>
  <div class="min-h-screen relative z-10">
    <!-- Header -->
    <header class="flex items-center gap-4 py-4 px-5">
      <button
        @click="onBack"
        class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-caps text-lg">МОИ ЗАКАЗЫ</h1>
    </header>

    <main class="px-5 pb-8 md:max-w-3xl md:mx-auto">
      <GlassCard class="mb-4" :delay="0.05">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              СТАТУС
            </label>
            <div class="relative">
              <select
                v-model="statusFilter"
                class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option v-for="option in statusOptions" :key="option.id" :value="option.id">
                  {{ option.label }}
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

      <div v-if="sortedOrders.length === 0" class="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
        <!-- Empty State -->
        <div class="w-24 h-24 rounded-3xl bg-glass/40 flex items-center justify-center mb-6">
          <Package class="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 class="text-caps text-lg mb-2">НЕТ ЗАКАЗОВ</h2>
        <p class="text-muted-foreground text-sm text-center">
          Добавьте первый заказ<br />
          <span class="text-accent-italic">для отслеживания</span>
        </p>
      </div>
      <div v-else class="space-y-3">
        <!-- Orders List -->
        <GlassCard
          v-for="(order, index) in sortedOrders"
          :key="order.id"
          @click="onOrderClick(order.id)"
          :delay="0.1 + index * 0.08"
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
            Обновлено: {{ order.updatedAt }}
          </p>
        </GlassCard>
      </div>
    </main>
  </div>
</template>
