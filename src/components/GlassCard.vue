<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  className: {
    type: String,
    default: ''
  },
  onClick: {
    type: Function,
    default: null
  },
  animate: {
    type: Boolean,
    default: true
  },
  delay: {
    type: Number,
    default: 0
  }
})

const cardClasses = computed(() => {
  return cn(
    'glass-card p-5',
    props.onClick && 'cursor-pointer hover:bg-glass/80 active:scale-[0.98] transition-all duration-200',
    props.animate && 'opacity-0 animate-slide-up',
    props.className
  )
})

const cardStyle = computed(() => {
  return props.animate ? { animationDelay: `${props.delay}s` } : undefined
})
</script>

<template>
  <div
    :class="cardClasses"
    :style="cardStyle"
    @click="onClick"
  >
    <slot />
  </div>
</template>
