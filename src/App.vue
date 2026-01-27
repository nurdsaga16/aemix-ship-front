<script setup>
import { RouterView } from 'vue-router'
import StarField from '@/components/StarField.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground overflow-x-hidden">
    <StarField />
    <RouterView />
  </div>
</template>

<style scoped></style>
