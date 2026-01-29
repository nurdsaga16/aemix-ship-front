<script setup>
import { ArrowLeft, Package } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'

defineProps({
  orders: {
    type: Array,
    required: true
  },
  onBack: {
    type: Function,
    required: true
  },
  onOrderClick: {
    type: Function,
    required: true
  }
})
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
      <h1 class="text-caps text-lg">МОИ ЗАКАЗЫ</h1>
    </header>

    <main class="px-5 pb-8 md:max-w-3xl md:mx-auto">
      <div v-if="orders.length === 0" class="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
        <!-- Empty State -->
        <div class="w-24 h-24 rounded-3xl bg-glass/40 flex items-center justify-center mb-6">
          <Package class="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 class="text-caps text-lg mb-2">НЕТ ЗАКАЗОВ</h2>
        <p class="text-muted-foreground text-sm text-center">
          Добавьте первый заказ<br />
          <span class="text-accent-italic">для отслеживания</span>
        </p>
      </div>
      <div v-else class="space-y-3">
        <!-- Orders List -->
        <GlassCard
          v-for="(order, index) in orders"
          :key="order.id"
          @click="onOrderClick(order.id)"
          :delay="0.1 + index * 0.08"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="text-caps text-base mb-1">{{ order.id }}</p>
              <p class="text-muted-foreground text-xs font-mono">
                {{ order.trackNumber }}
              </p>
            </div>
            <StatusBadge :status="order.status" />
          </div>
          <p class="text-muted-foreground text-xs">
            Обновлено: {{ order.updatedAt }}
          </p>
        </GlassCard>
      </div>
    </main>
  </div>
</template>
