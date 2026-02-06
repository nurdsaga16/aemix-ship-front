<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['shipped', 'arrived', 'ready'].includes(value)
  },
  className: {
    type: String,
    default: ''
  }
})

const statusConfig = {
  shipped: {
    label: 'В ПУТИ',
    emoji: '🟡',
    bgClass: 'bg-orange-500/20',
    textClass: 'text-orange-400',
  },
  arrived: {
    label: 'ПРИБЫЛ',
    emoji: '🟢',
    bgClass: 'bg-green-500/20',
    textClass: 'text-green-400',
  },
  ready: {
    label: 'ГОТОВ',
    emoji: '✅',
    bgClass: 'bg-emerald-500/20',
    textClass: 'text-emerald-400',
  },
}

const config = computed(() => statusConfig[props.status])

const badgeClasses = computed(() => {
  return cn(
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide',
    config.value.bgClass,
    config.value.textClass,
    props.className
  )
})
</script>

<template>
  <div :class="badgeClasses">
    <span>{{ config.emoji }}</span>
    <span>{{ config.label }}</span>
  </div>
</template>
