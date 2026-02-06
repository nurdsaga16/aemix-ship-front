<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const stars = ref([])
const fallingStars = ref([])
let starIdCounter = 0
let createStarInterval = null
const activeTimeouts = []

onMounted(() => {
  const generatedStars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }))
  stars.value = generatedStars

  // Функция для создания одной падающей звезды
  const createFallingStar = (delay = 0) => {
    const newStar = {
      id: starIdCounter++,
      // Случайная начальная позиция слева (от -10% до 20%)
      startX: -10 + Math.random() * 30,
      // Случайная начальная позиция сверху (от 0% до 30%)
      startY: Math.random() * 30,
      delay: delay,
    }
    
    fallingStars.value.push(newStar)
    
    // Удаляем звезду после завершения анимации (4 секунды)
    setTimeout(() => {
      const index = fallingStars.value.findIndex(s => s.id === newStar.id)
      if (index !== -1) {
        fallingStars.value.splice(index, 1)
      }
    }, 4000)
  }

  // Функция для создания группы звезд одновременно
  const createStarGroup = () => {
    const groupSize = 3 + Math.floor(Math.random() * 3) // 3-5 звезд в группе
    
    for (let i = 0; i < groupSize; i++) {
      // Небольшая случайная задержка между звездами в группе (0-0.4 секунды)
      const delay = i * 0.1 + Math.random() * 0.3
      const timeoutId = setTimeout(() => {
        createFallingStar(0)
      }, delay * 1000)
      activeTimeouts.push(timeoutId)
    }
  }

  // Создаем первую группу звезд сразу
  createStarGroup()

  // Создаем новые группы звезд с интервалом 7-10 секунд
  const scheduleNextStarGroup = () => {
    const delay = 7000 + Math.random() * 3000 // 7-10 секунд
    createStarInterval = setTimeout(() => {
      createStarGroup()
      scheduleNextStarGroup() // Планируем следующую группу
    }, delay)
  }

  scheduleNextStarGroup()
})

onUnmounted(() => {
  if (createStarInterval) {
    clearTimeout(createStarInterval)
  }
  activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId))
  activeTimeouts.length = 0
})
</script>

<template>
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div class="absolute inset-0 gradient-space" />
    
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

    <div
      v-for="star in fallingStars"
      :key="star.id"
      class="absolute animate-falling-star"
      :style="{
        left: `${star.startX}%`,
        top: `${star.startY}%`,
        animationDelay: `${star.delay}s`,
      }"
    >
      <div class="relative">
        <div
          class="absolute w-1 h-1 rounded-full bg-meteor shadow-lg z-10"
          :style="{ boxShadow: '0 0 10px hsl(24, 95%, 53%), 0 0 20px hsl(24, 95%, 53%, 0.5)' }"
        />
        <div 
          class="absolute w-40 h-[2px] bg-gradient-to-r from-transparent via-meteor/60 to-meteor"
          style="transform: rotate(45deg); transform-origin: left center; left: -20px; top: -1px;"
        />
      </div>
    </div>

    <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
    <div class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
  </div>
</template>
