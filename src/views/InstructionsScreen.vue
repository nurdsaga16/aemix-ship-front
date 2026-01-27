<script setup>
import { ArrowLeft, Smartphone, Play, BookOpen, ExternalLink } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'

defineProps({
  onBack: {
    type: Function,
    required: true
  }
})

const guides = [
  {
    id: 'pinduoduo',
    title: 'PINDUODUO',
    subtitle: 'Как заказать через приложение',
    icon: Smartphone,
    link: '#',
  },
  {
    id: 'alipay',
    title: 'ALIPAY',
    subtitle: 'Настройка оплаты',
    icon: Play,
    link: '#',
  },
  {
    id: 'tracking',
    title: 'ОТСЛЕЖИВАНИЕ',
    subtitle: 'Как добавить трек-номер',
    icon: BookOpen,
    link: '#',
  },
]
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
      <h1 class="text-caps text-lg">ИНСТРУКЦИИ</h1>
    </header>

    <main class="px-5 pb-8">
      <!-- Introduction -->
      <GlassCard class="mb-6" :delay="0.1">
        <p class="text-muted-foreground text-sm leading-relaxed">
          Полезные видео и гайды для работы с китайскими площадками.
          <span class="text-accent-italic">Смотрите, учитесь, заказывайте!</span>
        </p>
      </GlassCard>

      <!-- Guides List -->
      <div class="space-y-3">
        <GlassCard
          v-for="(guide, index) in guides"
          :key="guide.id"
          @click="() => window.open(guide.link, '_blank')"
          :delay="0.2 + index * 0.1"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <component :is="guide.icon" class="w-6 h-6 text-primary" />
              </div>
              <div>
                <p class="text-caps text-sm mb-0.5">{{ guide.title }}</p>
                <p class="text-muted-foreground text-xs">{{ guide.subtitle }}</p>
              </div>
            </div>
            <ExternalLink class="w-5 h-5 text-muted-foreground" />
          </div>
        </GlassCard>
      </div>

      <!-- Video Section -->
      <div class="mt-8">
        <h2 class="text-caps text-sm text-muted-foreground mb-4">ВИДЕО-ИНСТРУКЦИИ</h2>
        
        <GlassCard :delay="0.5">
          <div class="aspect-video rounded-2xl bg-glass/40 flex items-center justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Play class="w-8 h-8 text-primary ml-1" />
            </div>
          </div>
          <p class="text-caps text-sm">КАК ЗАКАЗАТЬ НА PINDUODUO</p>
          <p class="text-muted-foreground text-xs">Полный гайд • 12 мин</p>
        </GlassCard>
      </div>
    </main>
  </div>
</template>
