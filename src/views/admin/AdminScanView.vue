<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QrCode } from 'lucide-vue-next'
import { StreamBarcodeReader } from '@teckel/vue-barcode-reader'
import GlassCard from '@/components/GlassCard.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import AppInput from '@/components/AppInput.vue'
import Loader from '@/components/Loader.vue'
import { useOrdersStore } from '@/stores/useOrdersStore'
import { useScanLogsStore } from '@/stores/useScanLogsStore'

const router = useRouter()
const ordersStore = useOrdersStore()
const scanLogsStore = useScanLogsStore()
const trackCode = ref('')
const lastResult = ref(null)
const isCameraActive = ref(false)
const isCameraLoading = ref(false)
const cameraError = ref('')
const lastScannedValue = ref('')
const lastScannedAt = ref(0)
const cameraKey = ref(0)
const cameraStream = ref(null)
const isSubmitting = ref(false)
const DECODE_COOLDOWN_MS = 1500
const scansHistory = ref([])

const statusLabels = {
  UNKNOWN: 'Из Китая',
  INTERNATIONAL_SHIPPING: 'В пути',
  ARRIVED: 'Прибыл',
  READY: 'Готов',
}
const formatStatusName = (name) => statusLabels[name] ?? name ?? '—'

onMounted(async () => {
  try {
    await scanLogsStore.fetchLogs({ page: 0, size: 20 })

    scansHistory.value = scanLogsStore.logs.map((log) => ({
      id: log.id,
      trackCode: log.trackCode,
      statusName: log.newStatus,
      time: log.scannedAt,
      result: 'success',
    }))
  } catch {
  }
})

const lastResultClasses = computed(() => {
  if (!lastResult.value) return ''
  return lastResult.value.type === 'success'
    ? 'bg-green-500/15 border-green-500/30 text-green-100'
    : 'bg-red-500/15 border-red-500/30 text-red-100'
})

const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  const value = trackCode.value.trim()
  if (!value) {
    lastResult.value = { type: 'error', message: 'Введите трек‑код' }
    isSubmitting.value = false
    return
  }

  try {
    const data = await ordersStore.scanArrived(value)

    lastResult.value = {
      type: 'success',
      message: `ОК, заказ ${data.trackCode} теперь на этапе ${data.status}`,
    }
    scansHistory.value = [
      {
        id: Date.now(),
        trackCode: data.trackCode,
        statusName: data.status,
        time: new Date().toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        result: 'success',
      },
      ...scansHistory.value,
    ].slice(0, 20)
    trackCode.value = ''
  } catch (e) {
    const message =
      e.response?.data?.message ||
      e.response?.data?.error ||
      'Не удалось отсканировать заказ'

    lastResult.value = {
      type: 'error',
      message,
    }

    scansHistory.value = [
      {
        id: Date.now(),
        trackCode: value,
        statusName: 'ERROR',
        time: new Date().toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        result: 'error',
      },
      ...scansHistory.value,
    ].slice(0, 20)
  } finally {
    isSubmitting.value = false
  }
}

const handleToggleCamera = async () => {
  if (isCameraActive.value) {
    isCameraActive.value = false
    isCameraLoading.value = false
    if (cameraStream.value) {
      cameraStream.value.getTracks().forEach((track) => track.stop())
      cameraStream.value = null
    }
    return
  }
  cameraError.value = ''
  isCameraLoading.value = true
  cameraKey.value += 1
  if (!window.isSecureContext) {
    cameraError.value = 'Камера работает только по HTTPS. Откройте страницу по защищенному протоколу.'
    isCameraLoading.value = false
    return
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Браузер не поддерживает доступ к камере.'
    isCameraLoading.value = false
    return
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    cameraStream.value = stream
    isCameraActive.value = true
    setTimeout(() => {
      if (isCameraLoading.value) isCameraLoading.value = false
    }, 2000)
  } catch (error) {
    handleCameraError()
  }
}

const handleDecode = (value) => {
  if (!value) return
  const now = Date.now()
  if (now - lastScannedAt.value < DECODE_COOLDOWN_MS) return
  if (value === lastScannedValue.value) return

  lastScannedValue.value = value
  lastScannedAt.value = now
  isCameraLoading.value = false
  trackCode.value = value
  handleSubmit()
}

const handleCameraError = () => {
  cameraError.value = 'Не удалось получить доступ к камере. Проверьте разрешения.'
  isCameraLoading.value = false
  isCameraActive.value = false
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop())
    cameraStream.value = null
  }
}

</script>

<template>
  <PageLayout>
    <PageHeader title="СКАНИРОВАНИЕ" :on-back="() => router.push('/')" />

    <PageMain contentClass="space-y-6">
      <div class="mx-auto w-full max-w-md space-y-4">
        <GlassCard :delay="0.06">
          <div class="flex items-center justify-between mb-3">
            <p class="text-caps text-sm">СКАНИРОВАТЬ КАМЕРОЙ</p>
            <button
              class="px-4 py-2 rounded-full text-caps text-xs transition-all border border-glass-border/70 bg-glass/50 hover:bg-glass/70"
              @click="handleToggleCamera"
            >
              {{ isCameraActive ? 'ВЫКЛЮЧИТЬ' : 'ВКЛЮЧИТЬ' }}
            </button>
          </div>
          <div class="rounded-2xl overflow-hidden border border-glass-border/70 bg-glass/30">
            <div v-if="isCameraActive" class="relative">
              <StreamBarcodeReader
                :key="cameraKey"
                class="w-full h-56 object-cover"
                @decode="handleDecode"
                @error="handleCameraError"
              />
              <div
                v-if="isCameraLoading"
                class="absolute inset-0 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-black/30"
              >
                <Loader size="sm" />
                <span>Инициализация камеры...</span>
              </div>
            </div>
            <div v-else class="flex items-center justify-center h-56 text-xs text-muted-foreground">
              Камера выключена
            </div>
          </div>
          <p v-if="cameraError" class="text-xs text-red-300 mt-3">
            {{ cameraError }}
          </p>
        </GlassCard>

        <GlassCard :delay="0.08">
          <p class="text-muted-foreground text-xs mb-3">
            Можно также ввести трек‑код вручную
          </p>
          <AppInput
            v-model="trackCode"
            type="text"
            placeholder="TRACK CODE"
            input-class="font-mono text-lg tracking-wider py-4"
            @keyup.enter="handleSubmit"
          />
          <button
            class="w-full mt-4 py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-primary text-primary-foreground hover:brightness-110"
            @click="handleSubmit"
          >
            ОТПРАВИТЬ
          </button>

          <div v-if="lastResult" class="mt-4">
            <div :class="['w-full rounded-2xl border px-4 py-3 text-sm', lastResultClasses]">
              {{ lastResult.message }}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard :delay="0.1">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">История сканирований</span>
          <span class="text-foreground font-semibold">{{ scansHistory.length }}</span>
        </div>
      </GlassCard>

      <GlassCard :delay="0.12">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-muted-foreground text-[11px] uppercase tracking-[0.18em]">
              <tr>
                <th class="text-left py-3 pr-4">Track code</th>
                <th class="text-left py-3 pr-4">Статус</th>
                <th class="text-left py-3 pr-4">Время</th>
                <th class="text-left py-3">Результат</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="scan in scansHistory"
                :key="scan.id"
                class="border-t border-glass-border/60"
              >
                <td class="py-3 pr-4 font-mono text-xs text-foreground">
                  {{ scan.trackCode }}
                </td>
                <td class="py-3 pr-4 text-xs text-foreground">
                  {{ formatStatusName(scan.statusName) }}
                </td>
                <td class="py-3 pr-4 text-xs text-muted-foreground">
                  {{ scan.time }}
                </td>
                <td class="py-3 text-xs">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase',
                      scan.result === 'success'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    ]"
                  >
                    {{ scan.result === 'success' ? 'OK' : 'ERROR' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageMain>
  </PageLayout>
</template>