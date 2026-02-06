<script setup>
defineProps({
  /** Дополнительные классы для обёртки */
  contentClass: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div
    class="min-h-screen relative z-10"
    :class="contentClass"
  >
    <slot />
  </div>
</template>
