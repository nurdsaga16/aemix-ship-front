<script setup>
import { ArrowLeft } from 'lucide-vue-next'
import { useBackHandler } from '@/composables/useBackHandler'

const props = defineProps({
  /** Заголовок страницы */
  title: {
    type: String,
    default: ''
  },
  /** Показывать кнопку "Назад" */
  showBack: {
    type: Boolean,
    default: true
  },
  /** Куда переходить по кнопке "Назад" (игнорируется если передан onBack) */
  backTo: {
    type: String,
    default: '/'
  },
  /** Кастомный обработчик кнопки "Назад" */
  onBack: {
    type: Function,
    default: null
  }
})

const { handleBack } = useBackHandler({
  defaultTo: props.backTo,
  onBack: props.onBack
})
</script>

<template>
  <header class="flex items-center gap-4 py-4 px-5">
    <button
      v-if="showBack"
      type="button"
      @click="handleBack"
      class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      aria-label="Назад"
    >
      <ArrowLeft class="w-5 h-5" />
    </button>
    <h1 v-if="title" class="text-caps text-lg">{{ title }}</h1>
    <slot v-else />
  </header>
</template>
