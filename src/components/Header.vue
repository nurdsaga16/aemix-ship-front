<script setup>
import Logo from './Logo.vue'
import { User } from 'lucide-vue-next'

defineProps({
  onProfileClick: {
    type: Function,
    default: null
  }
})
</script>

<template>
  <header class="flex items-center justify-between py-4 px-5 relative z-10">
    <div class="flex items-center gap-3">
      <Logo />
      <span class="text-caps text-xl tracking-widest">AEMIX</span>
    </div>
    
    <button
      @click="onProfileClick"
      class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
    >
      <User class="w-5 h-5 text-foreground" />
    </button>
  </header>
</template>
