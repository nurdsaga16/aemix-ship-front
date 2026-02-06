<script setup>
defineProps({
  /** Нижний отступ: mb-2 или mb-3 */
  margin: {
    type: String,
    default: 'mb-2',
    validator: (v) => ['mb-2', 'mb-3'].includes(v)
  }
})
</script>

<template>
  <label
    class="block text-caps text-xs text-muted-foreground"
    :class="margin"
  >
    <slot />
  </label>
</template>
