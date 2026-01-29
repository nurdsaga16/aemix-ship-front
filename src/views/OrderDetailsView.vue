<script setup>
import { ArrowLeft, MapPin } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import { computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  onBack: {
    type: Function,
    required: true
  }
})

const statusInfo = {
  pending: { emoji: '⏳', label: 'ОЖИДАНИЕ', step: 0 },
  shipped: { emoji: '🟡', label: 'ОТПРАВЛЕН', step: 1 },
  arrived: { emoji: '🟢', label: 'ПРИБЫЛ В РФ', step: 2 },
  ready: { emoji: '✅', label: 'ГОТОВ К ВЫДАЧЕ', step: 3 },
}

const timelineSteps = [
  { label: 'КИТАЙ', sublabel: 'Склад отправки' },
  { label: 'В ПУТИ', sublabel: 'Международная доставка' },
  { label: 'РОССИЯ', sublabel: 'Таможня и сортировка' },
  { label: 'ВЫДАЧА', sublabel: 'Пункт получения' },
]

const info = computed(() => statusInfo[props.order.status])
</script>

<template>
  <div class="min-h-screen relative z-10">
    <!-- Header -->
    <header class="flex items-center gap-4 py-4 px-5">
      <button
        @click="onBack"
        class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-caps text-lg">{{ order.id }}</h1>
    </header>

    <main class="px-5 pb-8 md:max-w-3xl md:mx-auto">
      <!-- Status Card -->
      <GlassCard class="mb-6 text-center" :delay="0.1">
        <div class="text-5xl mb-4">{{ info.emoji }}</div>
        <h2 class="text-caps text-xl mb-2">{{ info.label }}</h2>
        <p class="text-muted-foreground text-sm font-mono">{{ order.trackNumber }}</p>
      </GlassCard>

      <!-- Timeline -->
      <GlassCard :delay="0.2">
        <h3 class="text-caps text-sm mb-6 text-muted-foreground">МАРШРУТ ДОСТАВКИ</h3>
        
        <div class="relative pl-8">
          <!-- Vertical Line -->
          <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-glass-border rounded-full" />
          
          <!-- Active Line -->
          <div
            class="absolute left-3 top-2 w-0.5 bg-primary rounded-full transition-all duration-500"
            :style="{ height: `${(info.step / (timelineSteps.length - 1)) * 100}%` }"
          />

          <!-- Steps -->
          <div class="space-y-8">
            <div
              v-for="(step, index) in timelineSteps"
              :key="index"
              class="relative"
            >
              <!-- Dot -->
              <div
                :class="[
                  'absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all',
                  index <= info.step ? 'bg-primary' : 'bg-glass-border',
                  index === info.step ? 'animate-pulse-glow' : ''
                ]"
              >
                <MapPin :class="['w-3 h-3', index <= info.step ? 'text-primary-foreground' : 'text-muted-foreground']" />
              </div>

              <!-- Content -->
              <div :class="index === info.step ? 'opacity-100' : 'opacity-60'">
                <p class="text-caps text-sm">{{ step.label }}</p>
                <p class="text-muted-foreground text-xs">{{ step.sublabel }}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <!-- Update Info -->
      <p class="text-center text-muted-foreground text-xs mt-6">
        Последнее обновление: {{ order.updatedAt }}
      </p>
    </main>
  </div>
</template>
