<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, MapPin, Pencil, Check, X, ChevronDown } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()

const points = ref([
  {
    id: 'MSK-01',
    city: 'Москва',
    address: 'ул. Тверская, 12',
    isEditing: false,
    draftCity: 'Москва',
    draftAddress: 'ул. Тверская, 12',
  },
  {
    id: 'KRD-01',
    city: 'Краснодар',
    address: 'ул. Красная, 88',
    isEditing: false,
    draftCity: 'Краснодар',
    draftAddress: 'ул. Красная, 88',
  },
  {
    id: 'SPB-02',
    city: 'Санкт-Петербург',
    address: 'Невский пр-т, 45',
    isEditing: false,
    draftCity: 'Санкт-Петербург',
    draftAddress: 'Невский пр-т, 45',
  },
])

const cityFilter = ref('all')

const cityOptions = computed(() => {
  const cities = points.value.map((point) => point.city)
  return Array.from(new Set(cities))
})

const filteredPoints = computed(() => {
  if (cityFilter.value === 'all') {
    return points.value
  }
  return points.value.filter((point) => point.city === cityFilter.value)
})

const handleBack = () => {
  router.push('/')
}

const startEdit = (point) => {
  point.isEditing = true
  point.draftCity = point.city
  point.draftAddress = point.address
}

const cancelEdit = (point) => {
  point.isEditing = false
  point.draftCity = point.city
  point.draftAddress = point.address
}

const saveEdit = (point) => {
  point.city = point.draftCity.trim() || point.city
  point.address = point.draftAddress.trim() || point.address
  point.isEditing = false
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
      <h1 class="text-caps text-lg">ПУНКТЫ ВЫДАЧИ</h1>
    </header>

    <main class="px-5 pb-8 space-y-4 md:max-w-3xl md:mx-auto">
      <GlassCard :delay="0.05">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-caps text-sm">УПРАВЛЕНИЕ ПУНКТАМИ</p>
            <p class="text-xs text-muted-foreground">
              Редактирование адресов для актуальной информации
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard :delay="0.08">
        <label class="block text-caps text-[11px] text-muted-foreground mb-2">
          ГОРОД
        </label>
        <div class="relative">
          <select
            v-model="cityFilter"
            class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          >
            <option value="all">Все города</option>
            <option v-for="city in cityOptions" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
          <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <ChevronDown class="w-4 h-4" />
          </div>
        </div>
      </GlassCard>

      <div class="space-y-3">
        <GlassCard
          v-for="(point, index) in filteredPoints"
          :key="point.id"
          :delay="0.1 + index * 0.04"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-caps text-sm mb-2">ID {{ point.id }}</p>
              <div v-if="!point.isEditing">
                <p class="text-foreground text-sm">{{ point.city }}</p>
                <p class="text-muted-foreground text-xs mt-1">{{ point.address }}</p>
              </div>
              <div v-else class="space-y-2">
                <div class="relative">
                  <select
                    v-model="point.draftCity"
                    class="w-full appearance-none bg-glass/40 border border-glass-border rounded-xl pl-3 pr-9 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  >
                    <option v-for="city in cityOptions" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ChevronDown class="w-4 h-4" />
                  </div>
                </div>
                <input
                  v-model="point.draftAddress"
                  type="text"
                  placeholder="Адрес"
                  class="w-full bg-glass/40 border border-glass-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <template v-if="point.isEditing">
                <button
                  type="button"
                  class="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center hover:bg-primary/25 transition-all active:scale-[0.98]"
                  title="Сохранить"
                  @click="saveEdit(point)"
                >
                  <Check class="w-4 h-4 text-primary" />
                </button>
                <button
                  type="button"
                  class="w-10 h-10 rounded-2xl bg-glass/60 border border-glass-border/70 flex items-center justify-center hover:bg-glass/80 transition-all active:scale-[0.98]"
                  title="Отменить"
                  @click="cancelEdit(point)"
                >
                  <X class="w-4 h-4 text-muted-foreground" />
                </button>
              </template>
              <button
                v-else
                type="button"
                class="w-10 h-10 rounded-2xl bg-glass/60 border border-glass-border/70 flex items-center justify-center hover:bg-glass/80 transition-all active:scale-[0.98]"
                title="Редактировать"
                @click="startEdit(point)"
              >
                <Pencil class="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  </div>
</template>
