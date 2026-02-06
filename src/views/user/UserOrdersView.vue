<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Package, Search, SlidersHorizontal } from 'lucide-vue-next'
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

const router = useRouter()
const ordersStore = useOrdersStore()

const searchQuery = ref('')
const statusFilter = ref('all')
const cityFilter = ref('all')
const sortOption = ref('newest')
const pageSize = ref(20)

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

const goToPage = (page) => {
  if (page < 0 || page >= ordersStore.totalPages || ordersStore.loading) return
  loadOrders(page)
}

const handleOrderClick = (trackCode) => {
  router.push(`/orders/${trackCode}`)
}

const loadOrders = (page = 0) => {
  const sort =
    sortOption.value === 'oldest'
      ? 'CREATED_ASC'
      : 'CREATED_DESC'

  const statusMap = {
    from_china: 'UNKNOWN',
    shipped: 'INTERNATIONAL_SHIPPING',
    arrived: 'ARRIVED',
    ready: 'READY',
  }

  return ordersStore
    .fetchMyOrders({
      page,
      size: pageSize.value,
      text: searchQuery.value.trim() || null,
      status: statusFilter.value !== 'all' ? statusMap[statusFilter.value] : null,
      cityId: cityFilter.value === 'all' ? null : Number(cityFilter.value),
      sort,
    })
    .catch(() => {})
}

const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize
  loadOrders(0)
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
    <PageHeader title="МОИ ЗАКАЗЫ" />

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
        <GlassCard
          v-for="(order, index) in ordersStore.orders"
          :key="order.trackCode"
          @click="handleOrderClick(order.trackCode)"
          :delay="0.1 + index * 0.06"
          class="cursor-pointer"
        >
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
        </GlassCard>
      </div>
    </PageMain>
  </PageLayout>
</template>
