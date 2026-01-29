<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ScanLine, ChevronDown } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()

const logs = ref([
  {
    id: 1,
    trackCode: 'SF1234567890123',
    pickup: 'Москва, ул. Тверская, 12',
    operator: 'admin@aemix.com',
    oldStatus: 'INTERNATIONAL_SHIPPING',
    newStatus: 'ARRIVED',
    source: 'customs',
    scannedAt: '2026-01-22 14:30',
  },
  {
    id: 2,
    trackCode: 'YT9876543210987',
    pickup: 'Краснодар, ул. Красная, 88',
    operator: 'operator@aemix.com',
    oldStatus: 'ARRIVED',
    newStatus: 'READY',
    source: 'pickup',
    scannedAt: '2026-01-22 18:12',
  },
  {
    id: 3,
    trackCode: 'JD5555666677778',
    pickup: 'Москва, ул. Тверская, 12',
    operator: 'admin@aemix.com',
    oldStatus: 'INTERNATIONAL_SHIPPING',
    newStatus: 'ARRIVED',
    source: 'customs',
    scannedAt: '2026-01-21 09:05',
  },
  {
    id: 4,
    trackCode: 'SF1111222233334',
    pickup: 'Санкт-Петербург, Невский пр-т, 45',
    operator: 'operator@aemix.com',
    oldStatus: 'ARRIVED',
    newStatus: 'READY',
    source: 'pickup',
    scannedAt: '2026-01-20 16:48',
  },
])

const operatorFilter = ref('all')
const pickupFilter = ref('all')
const statusFilter = ref('all')
const sourceFilter = ref('all')
const fromDate = ref('')
const toDate = ref('')

const operatorOptions = computed(() => {
  const operators = logs.value.map((log) => log.operator)
  return Array.from(new Set(operators))
})

const pickupOptions = computed(() => {
  const pickups = logs.value.map((log) => log.pickup)
  return Array.from(new Set(pickups))
})

const statusOptions = [
  { id: 'all', label: 'Все статусы' },
  { id: 'INTERNATIONAL_SHIPPING', label: 'INTERNATIONAL_SHIPPING' },
  { id: 'ARRIVED', label: 'ARRIVED' },
  { id: 'READY', label: 'READY' },
]

const sourceOptions = [
  { id: 'all', label: 'Все источники' },
  { id: 'customs', label: 'Таможня' },
  { id: 'pickup', label: 'Пункт выдачи' },
]

const parseDate = (value) => {
  const normalized = String(value || '').replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

const statusClass = (status) => {
  const base = 'px-2.5 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase'
  switch (status) {
    case 'INTERNATIONAL_SHIPPING':
      return `${base} bg-yellow-500/20 text-yellow-300`
    case 'ARRIVED':
      return `${base} bg-blue-500/20 text-blue-300`
    case 'READY':
      return `${base} bg-green-500/20 text-green-400`
    case 'PENDING':
      return `${base} bg-glass/60 text-muted-foreground`
    default:
      return `${base} bg-glass/60 text-muted-foreground`
  }
}

const filteredLogs = computed(() => {
  const from = fromDate.value ? new Date(`${fromDate.value}T00:00:00`) : null
  const to = toDate.value ? new Date(`${toDate.value}T23:59:59`) : null

  return logs.value.filter((log) => {
    const matchesOperator = operatorFilter.value === 'all' || log.operator === operatorFilter.value
    const matchesPickup = pickupFilter.value === 'all' || log.pickup === pickupFilter.value
    const matchesStatus =
      statusFilter.value === 'all' ||
      log.oldStatus === statusFilter.value ||
      log.newStatus === statusFilter.value
    const matchesSource = sourceFilter.value === 'all' || log.source === sourceFilter.value

    const scannedDate = parseDate(log.scannedAt)
    const matchesFrom = !from || (scannedDate && scannedDate >= from)
    const matchesTo = !to || (scannedDate && scannedDate <= to)

    return matchesOperator && matchesPickup && matchesStatus && matchesSource && matchesFrom && matchesTo
  })
})

const handleBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen relative z-10">
    <header class="flex items-center gap-4 py-4 px-5">
      <button
        @click="handleBack"
        class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-caps text-lg">ЛОГИ СКАНИРОВАНИЯ</h1>
    </header>

    <main class="px-5 pb-8 space-y-4 md:max-w-3xl md:mx-auto">
      <GlassCard :delay="0.05">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ScanLine class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-caps text-sm">ИСТОРИЯ СКАНИРОВАНИЙ</p>
            <p class="text-xs text-muted-foreground">
              Track code, статус, пункт, оператор
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard :delay="0.08">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              ОПЕРАТОР
            </label>
            <div class="relative">
              <select
                v-model="operatorFilter"
                class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option value="all">Все операторы</option>
                <option v-for="operator in operatorOptions" :key="operator" :value="operator">
                  {{ operator }}
                </option>
              </select>
              <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              ПУНКТ
            </label>
            <div class="relative">
              <select
                v-model="pickupFilter"
                class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option value="all">Все пункты</option>
                <option v-for="pickup in pickupOptions" :key="pickup" :value="pickup">
                  {{ pickup }}
                </option>
              </select>
              <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              СТАТУС
            </label>
            <div class="relative">
              <select
                v-model="statusFilter"
                class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option v-for="status in statusOptions" :key="status.id" :value="status.id">
                  {{ status.label }}
                </option>
              </select>
              <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              ИСТОЧНИК
            </label>
            <div class="relative">
              <select
                v-model="sourceFilter"
                class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option v-for="source in sourceOptions" :key="source.id" :value="source.id">
                  {{ source.label }}
                </option>
              </select>
              <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              ДАТА ОТ
            </label>
            <input
              v-model="fromDate"
              type="date"
              class="date-input w-full bg-glass/50 border border-glass-border/80 rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              ДАТА ДО
            </label>
            <input
              v-model="toDate"
              type="date"
              class="date-input w-full bg-glass/50 border border-glass-border/80 rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard :delay="0.1">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Найдено записей</span>
          <span class="text-foreground font-semibold">{{ filteredLogs.length }}</span>
        </div>
      </GlassCard>

      <div class="space-y-3">
        <GlassCard
          v-for="(log, index) in filteredLogs"
          :key="log.id"
          :delay="0.12 + index * 0.03"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <p class="text-caps text-sm mb-1">{{ log.trackCode }}</p>
              <p class="text-muted-foreground text-xs">
                {{ log.pickup }}
              </p>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{{ log.scannedAt }}</span>
                <span class="opacity-60">•</span>
                <span>{{ log.operator }}</span>
              </div>
            </div>
            <div class="md:text-right">
              <div class="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Статус
              </div>
              <div class="flex flex-wrap items-center gap-2 md:justify-end">
                <span :class="statusClass(log.oldStatus)">
                  {{ log.oldStatus }}
                </span>
                <span class="text-xs text-muted-foreground">→</span>
                <span :class="statusClass(log.newStatus)">
                  {{ log.newStatus }}
                </span>
              </div>
              <div class="mt-3">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase bg-glass/60 text-muted-foreground"
                >
                  {{ log.source === 'customs' ? 'Таможня' : 'Пункт выдачи' }}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  </div>
</template>

<style scoped>
.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.9;
}
</style>
