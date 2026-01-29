<script setup>
import { ArrowLeft, Plus, Check } from 'lucide-vue-next'
import { ref } from 'vue'
import GlassCard from '@/components/GlassCard.vue'

const props = defineProps({
  onBack: {
    type: Function,
    required: true
  },
  onAddOrder: {
    type: Function,
    required: true
  }
})

const trackNumber = ref('')
const isSubmitting = ref(false)
const showSuccess = ref(false)

const handleSubmit = () => {
  if (!trackNumber.value.trim()) return
  
  isSubmitting.value = true
  
  // Simulate API call
  setTimeout(() => {
    props.onAddOrder(trackNumber.value)
    isSubmitting.value = false
    showSuccess.value = true
    
    setTimeout(() => {
      showSuccess.value = false
      trackNumber.value = ''
      props.onBack()
    }, 1500)
  }, 800)
}
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
      <h1 class="text-caps text-lg">ДОБАВИТЬ ЗАКАЗ</h1>
    </header>

    <main class="px-5 pb-8 md:max-w-3xl md:mx-auto">
      <GlassCard class="mb-6" :delay="0.1">
        <p class="text-muted-foreground text-sm leading-relaxed mb-1">
          Введите трек-номер вашего заказа из Китая.
        </p>
        <p class="text-accent-italic text-sm">
          Мы начнём отслеживание автоматически.
        </p>
      </GlassCard>

      <!-- Input Card -->
      <GlassCard :delay="0.2">
        <label class="block text-caps text-xs text-muted-foreground mb-3">
          ТРЕК-НОМЕР
        </label>
        
        <input
          type="text"
          :value="trackNumber"
          @input="(e) => trackNumber = e.target.value.toUpperCase()"
          placeholder="SF1234567890123"
          class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-4 text-foreground font-mono text-lg tracking-wider placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />

        <button
          @click="handleSubmit"
          :disabled="!trackNumber.trim() || isSubmitting"
          :class="[
            'w-full mt-4 py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
            showSuccess
              ? 'bg-green-500 text-white'
              : trackNumber.trim()
              ? 'bg-primary text-primary-foreground hover:brightness-110'
              : 'bg-glass/40 text-muted-foreground cursor-not-allowed'
          ]"
        >
          <Check v-if="showSuccess" class="w-5 h-5" />
          <span v-if="showSuccess">ДОБАВЛЕНО</span>
          <div v-else-if="isSubmitting" class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          <template v-else>
            <Plus class="w-5 h-5" />
            <span>ДОБАВИТЬ</span>
          </template>
        </button>
      </GlassCard>

      <!-- Tips -->
      <div class="mt-8">
        <h2 class="text-caps text-xs text-muted-foreground mb-3">ПОДСКАЗКА</h2>
        <GlassCard :delay="0.3" class="bg-primary/5 border-primary/20">
          <p class="text-sm text-muted-foreground">
            Трек-номер обычно начинается с <span class="font-mono text-foreground">SF</span>, <span class="font-mono text-foreground">YT</span> или <span class="font-mono text-foreground">JD</span>
          </p>
        </GlassCard>
      </div>
    </main>
  </div>
</template>
