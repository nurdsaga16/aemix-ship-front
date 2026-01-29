<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, FileSpreadsheet, UploadCloud, ClipboardCheck, ChevronDown } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()
const selectedFile = ref(null)
const pickupPointId = ref('none')
const note = ref('')

const pickupOptions = [
  { id: 'none', label: 'Не указан' },
  { id: 'MSK-01', label: 'Москва (MSK-01)' },
  { id: 'KRD-01', label: 'Краснодар (KRD-01)' },
]

const handleBack = () => {
  router.push('/')
}

const handleFileChange = (event) => {
  const file = event.target.files?.[0] || null
  selectedFile.value = file
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
      <h1 class="text-caps text-lg">ИМПОРТ ЗАКАЗОВ</h1>
    </header>

    <main class="px-5 pb-8 space-y-6 md:max-w-3xl md:mx-auto">
      <GlassCard :delay="0.05">
        <h2 class="text-caps text-sm mb-3">КАК РАБОТАЕТ</h2>
        <div class="space-y-2 text-sm text-muted-foreground">
          <p>1. Загрузите Excel с трек-кодами (по одному в строке).</p>
          <p>2. Система проверит каждый трек-код в базе.</p>
          <p>3. Новые заказы создаются со статусом <span class="text-accent-italic">INTERNATIONAL_SHIPPING</span>.</p>
          <p>4. Существующие заказы не дублируются, а доп. поля обновляются.</p>
        </div>
      </GlassCard>

      <GlassCard :delay="0.1">
        <label class="block text-caps text-xs text-muted-foreground mb-3">
          EXCEL ФАЙЛ
        </label>

        <label
          class="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-glass-border bg-glass/30 px-4 py-5 cursor-pointer transition-all hover:border-primary/60 hover:bg-glass/50"
        >
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-foreground">
                {{ selectedFile ? selectedFile.name : 'Загрузить Excel (.xlsx, .xls)' }}
              </p>
              <p class="text-xs text-muted-foreground">
                Каждая строка — один track code
              </p>
            </div>
          </div>
          <UploadCloud class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            class="hidden"
            @change="handleFileChange"
          />
        </label>
      </GlassCard>

      <GlassCard :delay="0.15">
        <label class="block text-caps text-xs text-muted-foreground mb-2">
          ПУНКТ ВЫДАЧИ
        </label>
        <div class="relative">
          <select
            v-model="pickupPointId"
            class="w-full appearance-none bg-glass/40 border border-glass-border rounded-2xl pl-4 pr-12 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option v-for="option in pickupOptions" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <ChevronDown class="w-4 h-4" />
          </div>
        </div>
        <p class="text-muted-foreground text-xs mt-2">
          Можно оставить пустым — поле заполнится позже.
        </p>
      </GlassCard>

      <button
        :disabled="!selectedFile"
        :class="[
          'w-full py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
          selectedFile
            ? 'bg-primary text-primary-foreground hover:brightness-110'
            : 'bg-glass/40 text-muted-foreground cursor-not-allowed'
        ]"
      >
        <UploadCloud class="w-5 h-5" />
        <span>НАЧАТЬ ИМПОРТ</span>
      </button>

      <GlassCard :delay="0.25" class="bg-primary/5 border-primary/20">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <ClipboardCheck class="w-4 h-4 text-primary" />
          </div>
          <div>
            <p class="text-sm text-foreground mb-1">После загрузки</p>
            <p class="text-xs text-muted-foreground">
              Новые заказы появятся в разделе «Все заказы» сразу после обработки файла.
            </p>
          </div>
        </div>
      </GlassCard>
    </main>
  </div>
</template>
