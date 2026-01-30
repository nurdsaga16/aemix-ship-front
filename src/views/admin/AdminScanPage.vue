<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, QrCode } from 'lucide-vue-next'
import { StreamBarcodeReader } from '@teckel/vue-barcode-reader'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()
const trackCode = ref('')
const lastResult = ref(null)
const isCameraActive = ref(false)
const isCameraLoading = ref(false)
const cameraError = ref('')
const lastScannedValue = ref('')
const lastScannedAt = ref(0)
const cameraKey = ref(0)
const cameraStream = ref(null)
const scansHistory = ref([
  {
    id: 1,
    trackCode: 'SF1234567890123',
    statusName: 'INTERNATIONAL_SHIPPING',
    time: '2026-01-22 14:30',
    result: 'success',
  },
  {
    id: 2,
    trackCode: 'YT9876543210987',
    statusName: 'READY',
    time: '2026-01-22 14:12',
    result: 'error',
  },
])

const lastResultClasses = computed(() => {
  if (!lastResult.value) return ''
  return lastResult.value.type === 'success'
    ? 'bg-green-500/15 border-green-500/30 text-green-100'
    : 'bg-red-500/15 border-red-500/30 text-red-100'
})

const handleSubmit = () => {
  const value = trackCode.value.trim()
  if (!value) {
    lastResult.value = { type: 'error', message: 'Введите трек‑код' }
    return
  }

  lastResult.value = {
    type: 'success',
    message: `ОК, заказ ${value} теперь на этапе INTERNATIONAL_SHIPPING`,
  }
  scansHistory.value = [
    {
      id: Date.now(),
      trackCode: value,
      statusName: 'INTERNATIONAL_SHIPPING',
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
  ]
  trackCode.value = ''
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
  if (value === lastScannedValue.value && now - lastScannedAt.value < 1500) {
    return
  }
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
      <div>
        <h1 class="text-caps text-lg">СКАНИРОВАНИЕ</h1>
      </div>
    </header>

    <main class="px-5 pb-8 space-y-6 md:max-w-3xl md:mx-auto">
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
                class="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground bg-black/30"
              >
                Инициализация камеры...
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
          <input
            v-model="trackCode"
            type="text"
            autofocus
            placeholder="TRACK CODE"
            class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-4 text-foreground font-mono text-lg tracking-wider placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                  {{ scan.statusName }}
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
    </main>
  </div>
</template>
