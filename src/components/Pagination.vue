<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { PAGE_SIZE_OPTIONS, PAGE_SIZE_ALL } from '@/constants/pagination'

const props = defineProps({
  // Текущая страница (начиная с 0)
  page: {
    type: Number,
    required: true
  },
  // Общее количество страниц
  totalPages: {
    type: Number,
    required: true
  },
  // Общее количество элементов
  totalElements: {
    type: Number,
    required: true
  },
  // Размер страницы
  size: {
    type: Number,
    default: 20
  },
  // Загрузка
  loading: {
    type: Boolean,
    default: false
  },
  // Показывать выбор размера страницы
  showPageSize: {
    type: Boolean,
    default: false
  },
  // Опции размера страницы
  pageSizeOptions: {
    type: Array,
    default: () => PAGE_SIZE_OPTIONS
  },
  // Метка для элементов (например, "заказов", "пользователей")
  itemLabel: {
    type: String,
    default: 'элементов'
  }
})

const emit = defineEmits(['page-change', 'page-size-change'])

const computedPageInfo = computed(() => {
  const currentPage = props.page
  const total = props.totalElements
  const size = props.size

  const start = currentPage * size + 1
  const end = size >= total ? total : Math.min((currentPage + 1) * size, total)

  return {
    start: total > 0 ? start : 0,
    end: total > 0 ? end : 0,
    total
  }
})

const displaySizeOption = (value) => {
  return value === PAGE_SIZE_ALL ? 'Все' : value
}

const visiblePages = computed(() => {
  const current = props.page
  const total = props.totalPages
  const pages = []
  
  if (total <= 7) {
    // Если страниц мало, показываем все
    for (let i = 0; i < total; i++) {
      pages.push(i)
    }
  } else {
    // Показываем первую страницу
    pages.push(0)
    
    if (current > 3) {
      pages.push(-1) // Разделитель
    }
    
    // Показываем страницы вокруг текущей
    const start = Math.max(1, current - 1)
    const end = Math.min(total - 2, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 4) {
      pages.push(-1) // Разделитель
    }
    
    // Показываем последнюю страницу
    pages.push(total - 1)
  }
  
  return pages
})

const handlePageChange = (page) => {
  if (page < 0 || page >= props.totalPages || props.loading) return
  emit('page-change', page)
}

const handlePageSizeChange = (event) => {
  const newSize = Number(event.target.value)
  emit('page-size-change', newSize)
}

const isFirstPage = computed(() => props.page === 0)
const isLastPage = computed(() => props.page === props.totalPages - 1)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Информация о количестве и диапазоне -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <div class="flex items-center gap-3 sm:gap-4">
        <span class="text-muted-foreground text-sm">Найдено {{ itemLabel }}</span>
        <div v-if="loading" class="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span v-else class="text-foreground font-semibold text-sm sm:text-base">{{ totalElements }}</span>
      </div>
      
      <!-- Выбор размера страницы -->
      <div v-if="showPageSize" class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground hidden sm:inline">На странице:</span>
        <span class="text-xs text-muted-foreground sm:hidden">Страница:</span>
        <select
          :value="size"
          @change="handlePageSizeChange"
          :disabled="loading"
          class="appearance-none bg-glass/50 border border-glass-border/80 rounded-lg px-2.5 sm:px-3 py-2 sm:py-1.5 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option v-for="sizeOption in pageSizeOptions" :key="sizeOption" :value="sizeOption">
            {{ displaySizeOption(sizeOption) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Информация о текущем диапазоне -->
    <div v-if="totalElements > 0" class="text-xs text-muted-foreground">
      Показано {{ computedPageInfo.start }}-{{ computedPageInfo.end }} из {{ computedPageInfo.total }}
    </div>

    <!-- Пагинация -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between gap-1 sm:gap-2 pt-2 border-t border-glass-border"
    >
      <!-- Кнопка "Первая страница" - скрыта на мобильных -->
      <button
        type="button"
        :disabled="isFirstPage || loading"
        class="hidden sm:flex p-2 rounded-lg glass-button hover:bg-primary/10 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        @click="handlePageChange(0)"
        title="Первая страница"
      >
        <ChevronsLeft class="w-4 h-4" />
      </button>

      <!-- Кнопка "Предыдущая страница" -->
      <button
        type="button"
        :disabled="isFirstPage || loading"
        class="p-2.5 sm:p-2 rounded-lg glass-button hover:bg-primary/10 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        @click="handlePageChange(page - 1)"
        title="Предыдущая страница"
      >
        <ChevronLeft class="w-5 h-5 sm:w-4 sm:h-4" />
      </button>

      <!-- Номера страниц - упрощенная версия на мобильных -->
      <div class="flex items-center gap-1 flex-1 justify-center">
        <!-- Мобильная версия: только текущая страница и общее количество -->
        <div class="sm:hidden flex items-center gap-2">
          <span class="text-sm text-muted-foreground">
            Страница
          </span>
          <span class="text-sm font-semibold text-foreground">
            {{ page + 1 }}
          </span>
          <span class="text-sm text-muted-foreground">
            из {{ totalPages }}
          </span>
        </div>
        
        <!-- Десктопная версия: полная пагинация -->
        <div class="hidden sm:flex items-center gap-1">
          <template v-for="pageNum in visiblePages" :key="pageNum">
            <button
              v-if="pageNum !== -1"
              type="button"
              :disabled="loading"
              @click="handlePageChange(pageNum)"
              :class="[
                'min-w-[2.5rem] px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                pageNum === page
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'glass-button hover:bg-primary/10 hover:border-primary/30'
              ]"
            >
              {{ pageNum + 1 }}
            </button>
            <span
              v-else
              class="px-2 text-muted-foreground"
            >
              ...
            </span>
          </template>
        </div>
      </div>

      <!-- Кнопка "Следующая страница" -->
      <button
        type="button"
        :disabled="isLastPage || loading"
        class="p-2.5 sm:p-2 rounded-lg glass-button hover:bg-primary/10 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        @click="handlePageChange(page + 1)"
        title="Следующая страница"
      >
        <ChevronRight class="w-5 h-5 sm:w-4 sm:h-4" />
      </button>

      <!-- Кнопка "Последняя страница" - скрыта на мобильных -->
      <button
        type="button"
        :disabled="isLastPage || loading"
        class="hidden sm:flex p-2 rounded-lg glass-button hover:bg-primary/10 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        @click="handlePageChange(totalPages - 1)"
        title="Последняя страница"
      >
        <ChevronsRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
