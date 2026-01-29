<script setup>
import { Package, Layers, Plus, BookOpen, Building2, ChevronRight, UploadCloud } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import Header from '@/components/Header.vue'

defineProps({
  activeOrdersCount: {
    type: Number,
    required: true
  },
  onNavigate: {
    type: Function,
    required: true
  }
})

const menuItems = [
  { id: 'orders', label: 'МОИ ЗАКАЗЫ', icon: Package },
  { id: 'all-orders', label: 'ВСЕ ЗАКАЗЫ', icon: Layers },
  { id: 'admin-upload', label: 'ИМПОРТ ЗАКАЗОВ', icon: UploadCloud },
  { id: 'add', label: 'ДОБАВИТЬ ЗАКАЗ', icon: Plus },
  { id: 'instructions', label: 'ИНСТРУКЦИИ', icon: BookOpen },
  { id: 'about', label: 'О КОМПАНИИ', icon: Building2 },
]
</script>

<template>
  <div class="min-h-screen relative z-10">
    <Header />
    
    <main class="px-5 pb-28 md:max-w-3xl md:mx-auto">
      <!-- Status Bar -->
      <GlassCard class="mb-6" :delay="0.1">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-sm">Активных заказов</span>
          <span class="text-2xl font-black text-primary">{{ activeOrdersCount }}</span>
        </div>
      </GlassCard>

      <!-- Navigation Menu -->
      <div class="space-y-3">
        <GlassCard
          v-for="(item, index) in menuItems"
          :key="item.id"
          @click="onNavigate(item.id)"
          :delay="0.2 + index * 0.1"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <component :is="item.icon" class="w-6 h-6 text-primary" />
              </div>
              <span class="text-caps text-sm">{{ item.label }}</span>
            </div>
            <ChevronRight class="w-5 h-5 text-muted-foreground" />
          </div>
        </GlassCard>
      </div>
    </main>
  </div>
</template>
