<script setup>
import { ref, computed, onMounted } from 'vue'
import { ScanLine } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import Pagination from '@/components/Pagination.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import AppSelect from '@/components/AppSelect.vue'
import FormLabel from '@/components/FormLabel.vue'
import { PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import { useScanLogsStore } from '@/stores/useScanLogsStore'

const scanLogsStore = useScanLogsStore()

const operatorFilter = ref('all')
const cityFilter = ref('all')
const statusFilter = ref('all')
const fromDate = ref('')
const toDate = ref('')
const pageSize = ref(20)

const pageSizeOptions = [10, 20, 50, 100]

const operatorOptions = computed(() => {
  const operators = scanLogsStore.logs.map((log) => log.operator).filter(Boolean)
  return Array.from(new Set(operators))
})

const cityOptions = computed(() => {
  const cities = scanLogsStore.logs.map((log) => log.cityName).filter(Boolean)
  return Array.from(new Set(cities))
})

const statusOptions = [
  { id: 'all', label: 'Все статусы' },
  { id: 'INTERNATIONAL_SHIPPING', label: 'INTERNATIONAL_SHIPPING' },
  { id: 'ARRIVED', label: 'ARRIVED' },
  { id: 'READY', label: 'READY' },
]

const parseDate = (value) => {
  const normalized = String(value || '').replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDateTime = (value) => {
  const date = parseDate(value)
  if (!date) return value || '—'
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
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

  return scanLogsStore.logs.filter((log) => {
    const matchesOperator = operatorFilter.value === 'all' || log.operator === operatorFilter.value
    const matchesCity = cityFilter.value === 'all' || log.cityName === cityFilter.value
    const matchesStatus =
      statusFilter.value === 'all' || log.newStatus === statusFilter.value

    const scannedDate = parseDate(log.scannedAt)
    const matchesFrom = !from || (scannedDate && scannedDate >= from)
    const matchesTo = !to || (scannedDate && scannedDate <= to)

    return matchesOperator && matchesCity && matchesStatus && matchesFrom && matchesTo
  })
})

const loadLogs = (page = 0) => {
  const operator = operatorFilter.value === 'all' ? undefined : operatorFilter.value
  const status = statusFilter.value === 'all' ? undefined : statusFilter.value

  const from =
    fromDate.value && fromDate.value !== ''
      ? `${fromDate.value}T00:00:00`
      : undefined
  const to =
    toDate.value && toDate.value !== ''
      ? `${toDate.value}T23:59:59`
      : undefined

  return scanLogsStore
    .fetchLogs({
      page,
      size: pageSize.value,
      operator,
      status,
      fromDate: from,
      toDate: to,
    })
    .catch(() => {})
}

const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize
  loadLogs(0)
}

const goToPage = (page) => {
  if (page < 0 || page >= scanLogsStore.totalPages || scanLogsStore.loading) return
  loadLogs(page)
}

onMounted(() => {
  loadLogs(0)
})
</script>

<template>
  <PageLayout>
    <PageHeader title="ЛОГИ СКАНИРОВАНИЯ" />

    <PageMain contentClass="space-y-4">
      <GlassCard :delay="0.05">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ScanLine class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-caps text-sm">ИСТОРИЯ СКАНИРОВАНИЙ</p>
            <p class="text-xs text-muted-foreground">
              Track code, статус, город, оператор
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard :delay="0.08">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <FormLabel>ОПЕРАТОР</FormLabel>
            <AppSelect v-model="operatorFilter">
              <option value="all">Все операторы</option>
              <option v-for="operator in operatorOptions" :key="operator" :value="operator">
                {{ operator }}
              </option>
            </AppSelect>
          </div>

          <div>
            <FormLabel>ГОРОД</FormLabel>
            <AppSelect v-model="cityFilter">
              <option value="all">Все города</option>
              <option v-for="city in cityOptions" :key="city" :value="city">
                {{ city }}
              </option>
            </AppSelect>
          </div>

          <div>
            <FormLabel>СТАТУС</FormLabel>
            <AppSelect v-model="statusFilter">
              <option v-for="status in statusOptions" :key="status.id" :value="status.id">
                {{ status.label }}
              </option>
            </AppSelect>
          </div>

          <div>
            <FormLabel>ДАТА ОТ</FormLabel>
            <input
              v-model="fromDate"
              type="date"
              class="date-input w-full bg-glass/50 border border-glass-border/80 rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <div>
            <FormLabel>ДАТА ДО</FormLabel>
            <input
              v-model="toDate"
              type="date"
              class="date-input w-full bg-glass/50 border border-glass-border/80 rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard :delay="0.1">
        <Pagination
          :page="scanLogsStore.page"
          :total-pages="scanLogsStore.totalPages"
          :total-elements="scanLogsStore.totalElements"
          :size="scanLogsStore.size || pageSize"
          :loading="scanLogsStore.loading"
          :show-page-size="true"
          :page-size-options="PAGE_SIZE_OPTIONS"
          item-label="записей"
          @page-change="goToPage"
          @page-size-change="handlePageSizeChange"
        />
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
                {{ log.cityName || '—' }}
              </p>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{{ formatDateTime(log.scannedAt) }}</span>
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
            </div>
          </div>
        </GlassCard>
      </div>
    </PageMain>
  </PageLayout>
</template>

<style scoped>
.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.9;
}
</style>
