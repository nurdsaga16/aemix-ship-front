<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { FileSpreadsheet, UploadCloud, ClipboardCheck } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import FormLabel from '@/components/FormLabel.vue'
import AppSelect from '@/components/AppSelect.vue'
import Loader from '@/components/Loader.vue'
import { useOrdersStore } from '@/stores/useOrdersStore'

const router = useRouter()
const ordersStore = useOrdersStore()
const selectedFile = ref(null)
const parsedOrders = ref([])
const isParsing = ref(false)
const parseError = ref('')
const cityId = ref('')
const cities = ref([])
const isLoadingCities = ref(false)
const citiesError = ref('')
const isUploading = ref(false)
const uploadError = ref('')
const uploadResult = ref(null)

const canUpload = computed(() => {
  return (
    parsedOrders.value.length > 0 &&
    !isParsing.value &&
    !isUploading.value &&
    String(cityId.value || '').trim().length > 0
  )
})

const loadCities = async () => {
  isLoadingCities.value = true
  citiesError.value = ''
  try {
    const data = await ordersStore.fetchCities()
    cities.value = data
  } catch (error) {
    citiesError.value = 'Не удалось загрузить города'
  } finally {
    isLoadingCities.value = false
  }
}

onMounted(() => {
  loadCities()
})

const handleFileChange = async (event) => {
  const file = event.target.files?.[0] || null
  selectedFile.value = file
  parsedOrders.value = []
  parseError.value = ''
  uploadError.value = ''
  uploadResult.value = null

  if (!file) return

  isParsing.value = true
  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, range: 1 })
    const codes = rows
      .map((row) => String(row?.[0] ?? '').trim())
      .filter((value) => value.length > 0)

    parsedOrders.value = codes.map((trackCode, index) => ({
      id: `${index + 1}-${trackCode}`,
      trackCode,
    }))

    if (parsedOrders.value.length === 0) {
      parseError.value = 'В файле не найдено трек-кодов.'
    }
  } catch (error) {
    parseError.value = 'Не удалось прочитать файл. Проверьте формат.'
  } finally {
    isParsing.value = false
  }
}

const resetForm = () => {
  selectedFile.value = null
  parsedOrders.value = []
  parseError.value = ''
  uploadError.value = ''
  cityId.value = ''
}

const handleUpload = async () => {
  uploadError.value = ''
  uploadResult.value = null

  if (!canUpload.value) {
    if (!parsedOrders.value.length) {
      uploadError.value = 'Сначала загрузите файл с трек-кодами.'
    } else if (!String(cityId.value || '').trim()) {
      uploadError.value = 'Выберите город (ID города обязателен).'
    }
    return
  }

  isUploading.value = true
  try {
    const data = await ordersStore.uploadOrders({
      cityId: cityId.value,
      orders: parsedOrders.value,
    })
    uploadResult.value = data
    resetForm()
  } catch (error) {
    uploadError.value =
      error?.response?.data?.message || 'Не удалось загрузить заказы. Попробуйте позже.'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <PageLayout>
    <PageHeader title="ЗАГРУЗКА ЗАКАЗОВ" :on-back="() => router.push('/')" />

    <PageMain contentClass="space-y-6">
      <GlassCard :delay="0.05">
        <h2 class="text-caps text-sm mb-3">КАК РАБОТАЕТ</h2>
        <div class="space-y-2 text-sm text-muted-foreground">
          <p>1. Загрузите Excel с трек-кодами (по одному в строке, начиная с A2).</p>
          <p>2. Выберите город, к которому будут привязаны все заказы из файла.</p>
          <p>3. Система проверит каждый трек-код в базе.</p>
          <p>4. Новые заказы создаются со статусом <span class="text-accent-italic">INTERNATIONAL_SHIPPING</span>.</p>
          <p>5. Существующие заказы не дублируются, а доп. поля обновляются.</p>
        </div>
      </GlassCard>

      <GlassCard :delay="0.1">
        <FormLabel margin="mb-3">EXCEL ФАЙЛ</FormLabel>

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
                Каждая строка, начиная с A2 — один track code (колонка A)
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

      <GlassCard v-if="selectedFile" :delay="0.12">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-sm">Найдено трек-кодов</span>
          <span class="text-lg font-semibold">{{ parsedOrders.length }}</span>
        </div>
        <p v-if="isParsing" class="text-xs text-muted-foreground mt-2">
          Читаем файл и подготавливаем список...
        </p>
      </GlassCard>

      <GlassCard v-if="parsedOrders.length" :delay="0.13">
        <FormLabel margin="mb-2">ГОРОД ДЛЯ ВСЕХ ЗАКАЗОВ</FormLabel>
        <AppSelect v-model="cityId" class="w-full">
          <option value="" disabled>Выберите город</option>
          <option
            v-for="city in cities"
            :key="city.id"
            :value="city.id"
          >
            {{ city.name }} (ID: {{ city.id }})
          </option>
        </AppSelect>
        <p class="text-xs text-muted-foreground mt-1">
          Этот город будет применён ко всем трек-кодам из файла.
        </p>
        <div v-if="isLoadingCities" class="flex items-center gap-2 mt-1">
          <Loader size="sm" />
          <span class="text-xs text-muted-foreground">Загружаем список городов...</span>
        </div>
        <p v-else-if="citiesError" class="text-xs text-destructive mt-1">
          {{ citiesError }}
        </p>
      </GlassCard>

      <GlassCard v-if="parseError" :delay="0.15" class="bg-red-500/10 border-red-500/30">
        <p class="text-sm text-foreground">{{ parseError }}</p>
      </GlassCard>

      <div v-else-if="parsedOrders.length" class="space-y-3">
        <GlassCard
          v-for="(row, index) in parsedOrders"
          :key="row.id"
          :delay="0.15 + index * 0.02"
        >
          <div>
            <FormLabel margin="mb-2">TRACK CODE</FormLabel>
            <input
              :value="row.trackCode"
              readonly
              class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-3 text-foreground text-sm font-mono"
            />
          </div>
        </GlassCard>
      </div>

      <button
        type="button"
        @click="handleUpload"
        :disabled="!canUpload"
        :class="[
          'w-full py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
          canUpload
            ? 'bg-primary text-primary-foreground hover:brightness-110'
            : 'bg-glass/40 text-muted-foreground cursor-not-allowed'
        ]"
      >
        <UploadCloud class="w-5 h-5" />
        <span>
          {{ isParsing || isUploading ? 'ОБРАБОТКА ФАЙЛА' : 'НАЧАТЬ ЗАГРУЗКУ' }}
        </span>
      </button>

      <GlassCard
        v-if="uploadError"
        :delay="0.2"
        class="bg-red-500/10 border-red-500/30"
      >
        <p class="text-sm text-foreground">
          {{ uploadError }}
        </p>
      </GlassCard>

      <GlassCard
        v-if="uploadResult"
        :delay="0.22"
        class="bg-emerald-500/10 border-emerald-500/30"
      >
        <p class="text-sm text-foreground mb-1">
          Загрузка завершена.
        </p>
        <p class="text-xs text-muted-foreground">
          Всего: {{ uploadResult.total }}, создано: {{ uploadResult.created }}, пропущено:
          {{ uploadResult.skipped }}.
        </p>
        <p v-if="uploadResult.errors?.length" class="text-xs text-muted-foreground mt-1">
          Ошибки:
          <span class="break-all">
            {{ uploadResult.errors.join(', ') }}
          </span>
        </p>
      </GlassCard>

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
    </PageMain>
  </PageLayout>
</template>
