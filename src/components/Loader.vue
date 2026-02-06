<script setup>
defineProps({
  /** Размер: sm (4), md (5), lg (6) */
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  /** Вариант цвета: primary (оранжевый) или foreground (белый на кнопках) */
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'foreground'].includes(v)
  }
})
</script>

<template>
  <div
    class="rounded-full animate-spin border-2 flex-shrink-0"
    :class="[
      size === 'sm' && 'w-4 h-4',
      size === 'md' && 'w-5 h-5',
      size === 'lg' && 'w-6 h-6',
      variant === 'primary' && 'border-primary/30 border-t-primary',
      variant === 'foreground' && 'border-primary-foreground/30 border-t-primary-foreground'
    ]"
    role="status"
    aria-label="Загрузка"
  />
</template>
