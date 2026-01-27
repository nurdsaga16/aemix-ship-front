<script setup>
import { ref, onMounted } from 'vue'

const stars = ref([])
const meteors = ref([])

onMounted(() => {
  // Generate stars
  const generatedStars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }))
  stars.value = generatedStars

  // Generate meteors
  const generatedMeteors = Array.from({ length: 3 }, (_, i) => ({
    id: i,
    x: Math.random() * 100 + 50,
    y: Math.random() * 30,
    delay: i * 4 + Math.random() * 2,
  }))
  meteors.value = generatedMeteors
})
</script>

<template>
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <!-- Gradient background -->
    <div class="absolute inset-0 gradient-space" />
    
    <!-- Stars -->
    <div
      v-for="star in stars"
      :key="star.id"
      class="absolute rounded-full bg-star animate-twinkle"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        animationDelay: `${star.delay}s`,
        animationDuration: `${star.duration}s`,
      }"
    />

    <!-- Meteors -->
    <div
      v-for="meteor in meteors"
      :key="meteor.id"
      class="absolute animate-meteor"
      :style="{
        left: `${meteor.x}%`,
        top: `${meteor.y}%`,
        animationDelay: `${meteor.delay}s`,
      }"
    >
      <div
        class="w-1 h-1 rounded-full bg-meteor shadow-lg"
        :style="{ boxShadow: '0 0 10px hsl(24, 95%, 53%), -20px 10px 20px hsl(24, 95%, 53%, 0.3)' }"
      >
        <div class="absolute w-20 h-[1px] -left-20 top-1/2 bg-gradient-to-l from-meteor to-transparent" />
      </div>
    </div>

    <!-- Ambient glow -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
    <div class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
  </div>
</template>
