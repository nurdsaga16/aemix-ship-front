<script setup>
defineProps({
  /** Дополнительные классы для main (например space-y-5, space-y-4) */
  contentClass: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <main
    class="px-5 pb-8 md:max-w-3xl md:mx-auto"
    :class="contentClass"
  >
    <slot />
  </main>
</template>
