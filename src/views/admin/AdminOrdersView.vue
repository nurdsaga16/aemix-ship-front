<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Package, Search, SlidersHorizontal, CheckSquare, Check } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import AppSelect from '@/components/AppSelect.vue'
import FormLabel from '@/components/FormLabel.vue'
import { useFilterDebounce } from '@/composables/useFilterDebounce'
import { PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import { useOrdersStore } from '@/stores/useOrdersStore'

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
const ordersStore = useOrdersStore()

const searchQuery = ref('')
const statusFilter = ref('all')
const cityFilter = ref('all')
const sortOption = ref('newest')
const pageSize = ref(20)
const selectedTrackCodes = ref(new Set())
const isBulkReadyLoading = ref(false)

const filters = [
  { id: 'all', label: 'ВСЕ' },
  { id: 'from_china', label: 'ИЗ КИТАЯ' },
  { id: 'shipped', label: 'В ПУТИ' },
  { id: 'arrived', label: 'ПРИБЫЛ' },
  { id: 'ready', label: 'ГОТОВ' },
]

const cityOptions = ref([])
const sortOptions = [
  { id: 'newest', label: 'Сначала новые' },
  { id: 'oldest', label: 'Сначала старые' },
]

const statusMap = {
  all: null,
  from_china: 'UNKNOWN',
  shipped: 'INTERNATIONAL_SHIPPING',
  arrived: 'ARRIVED',
  ready: 'READY',
}

const allSelected = computed(() => {
  const list = ordersStore.orders
  return list.length > 0 && list.every((o) => selectedTrackCodes.value.has(o.trackCode))
})

const someSelected = computed(() => selectedTrackCodes.value.size > 0)

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedTrackCodes.value = new Set()
    return
  }
  selectedTrackCodes.value = new Set(ordersStore.orders.map((o) => o.trackCode))
}

const toggleSelect = (trackCode) => {
  const next = new Set(selectedTrackCodes.value)
  if (next.has(trackCode)) next.delete(trackCode)
  else next.add(trackCode)
  selectedTrackCodes.value = next
}

const isSelected = (trackCode) => selectedTrackCodes.value.has(trackCode)

const setBulkReady = async () => {
  if (!someSelected.value || isBulkReadyLoading.value) return
  isBulkReadyLoading.value = true
  try {
    await ordersStore.bulkReady(Array.from(selectedTrackCodes.value))
    selectedTrackCodes.value = new Set()
    await loadOrders(ordersStore.page)
  } catch (e) {
    ordersStore.error = e.response?.data?.message || 'Не удалось обновить статус'
  } finally {
    isBulkReadyLoading.value = false
  }
}

const selectAllCheckboxRef = ref(null)
watch([someSelected, allSelected], () => {
  const el = selectAllCheckboxRef.value
  if (el) el.indeterminate = someSelected.value && !allSelected.value
}, { immediate: true })

const goToPage = (page) => {
  loadOrders(page)
}

const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize
  loadOrders(0)
}

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
  router.push(`/admin/orders/${orderId}`)
}

const loadOrders = (page = 0) => {
  const sort =
    sortOption.value === 'oldest'
      ? 'CREATED_ASC'
      : 'CREATED_DESC'

  return ordersStore
    .fetchOrders({
      page,
      size: pageSize.value,
      trackCode: searchQuery.value.trim() || null,
      status: statusMap[statusFilter.value] ?? null,
      cityId: cityFilter.value === 'all' ? null : Number(cityFilter.value),
      sort,
    })
    .catch(() => {})
}


useFilterDebounce(
  [searchQuery, statusFilter, cityFilter, sortOption, pageSize],
  () => loadOrders(0),
  400
)

onMounted(async () => {
  cityOptions.value = await ordersStore.fetchCities()
  loadOrders(0)
})
</script>

<template>
  <PageLayout>
    <PageHeader title="ВСЕ ЗАКАЗЫ" :on-back="handleBack" />

    <PageMain contentClass="space-y-5">
      <GlassCard :delay="0.05">
        <FormLabel margin="mb-3">ПОИСК</FormLabel>
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
              <FormLabel>ГОРОД</FormLabel>
              <AppSelect v-model="cityFilter">
                <option value="all">Все города</option>
                <option v-for="city in cityOptions" :key="city.id" :value="city.id">
                  {{ city.name }}
                </option>
              </AppSelect>
            </div>
            <div>
              <FormLabel>СОРТИРОВКА</FormLabel>
              <AppSelect v-model="sortOption">
                <option v-for="option in sortOptions" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </AppSelect>
            </div>
          </div>
        </GlassCard>
      </div>

      <div
        v-if="someSelected"
        class="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3"
      >
        <span class="text-sm text-foreground">
          Выбрано: <strong>{{ selectedTrackCodes.size }}</strong>
        </span>
        <button
          type="button"
          :disabled="isBulkReadyLoading"
          @click="setBulkReady"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckSquare class="w-4 h-4" />
          Сделать READY
        </button>
      </div>

      <GlassCard :delay="0.11">
        <Pagination
          :page="ordersStore.page"
          :total-pages="ordersStore.totalPages"
          :total-elements="ordersStore.totalElements"
          :size="ordersStore.size || pageSize"
          :loading="ordersStore.loading"
          :show-page-size="true"
          :page-size-options="PAGE_SIZE_OPTIONS"
          item-label="заказов"
          @page-change="goToPage"
          @page-size-change="handlePageSizeChange"
        />
      </GlassCard>

      <div v-if="ordersStore.orders.length === 0" class="flex flex-col items-center justify-center min-h-[45vh] animate-slide-up">
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
        <div class="flex items-center gap-3 mb-2">
          <label class="flex items-center gap-3 cursor-pointer select-none text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <span class="app-checkbox-wrapper">
              <input
                ref="selectAllCheckboxRef"
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="app-checkbox"
              />
              <span class="app-checkbox-box">
                <span class="app-checkbox-check">
                  <Check class="w-3.5 h-3.5" stroke-width="2.5" />
                </span>
                <span class="app-checkbox-indeterminate" />
              </span>
            </span>
            <span>Выбрать все</span>
          </label>
        </div>
        <GlassCard
          v-for="(order, index) in ordersStore.orders"
          :key="order.trackCode"
          @click="handleOrderClick(order.trackCode)"
          :delay="0.1 + index * 0.06"
          class="cursor-pointer"
        >
          <div class="flex items-start gap-3">
            <span class="app-checkbox-wrapper mt-0.5 shrink-0" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(order.trackCode)"
                @change="toggleSelect(order.trackCode)"
                class="app-checkbox"
              />
              <span class="app-checkbox-box">
                <span class="app-checkbox-check">
                  <Check class="w-3.5 h-3.5" stroke-width="2.5" />
                </span>
              </span>
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-caps text-base mb-1">{{ order.title }}</p>
                  <p class="text-muted-foreground text-xs font-mono">
                    {{ order.trackCode }}
                  </p>
                </div>
                <StatusBadge :status="order.status" />
              </div>
              <p class="text-muted-foreground text-xs">
                Город: {{ order.cityName || '—' }}
              </p>
              <p class="text-muted-foreground text-xs">
                Обновлено: {{ order.updatedAtLabel }}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageMain>
  </PageLayout>
</template>

<style scoped>
.app-checkbox-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.app-checkbox {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  z-index: 1;
}

.app-checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  border: 1.5px solid hsl(var(--glass-border));
  background: hsl(222 47% 11% / 0.5);
  transition: all 0.2s ease;
  transform-origin: center;
}

.app-checkbox-wrapper:hover .app-checkbox-box {
  border-color: hsl(var(--primary) / 0.6);
  background: hsl(222 47% 11% / 0.7);
}

.app-checkbox:active + .app-checkbox-box {
  transform: scale(0.92);
}

.app-checkbox:focus-visible + .app-checkbox-box {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.4);
}

.app-checkbox-check {
  display: none;
  color: hsl(var(--primary-foreground));
}

.app-checkbox:checked + .app-checkbox-box .app-checkbox-check {
  display: flex;
}

.app-checkbox:checked + .app-checkbox-box {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.app-checkbox-indeterminate {
  display: none;
  width: 0.625rem;
  height: 2px;
  background: hsl(var(--primary-foreground));
  border-radius: 1px;
}

.app-checkbox:indeterminate + .app-checkbox-box .app-checkbox-indeterminate {
  display: block;
}

.app-checkbox:indeterminate + .app-checkbox-box .app-checkbox-check {
  display: none;
}

.app-checkbox:indeterminate + .app-checkbox-box {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}
</style>
