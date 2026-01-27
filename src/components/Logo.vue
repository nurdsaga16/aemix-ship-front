<script setup>
defineProps({
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  }
})

const heights = {
  small: [16, 24, 20],
  default: [24, 36, 28],
  large: [32, 48, 40],
}

const widths = {
  small: 4,
  default: 6,
  large: 8,
}

const gaps = {
  small: 3,
  default: 4,
  large: 6,
}
</script>

<template>
  <div class="flex items-end" :style="{ gap: `${gaps[size]}px` }">
    <div
      v-for="(height, index) in heights[size]"
      :key="index"
      class="rounded-full gradient-orange"
      :style="{
        width: `${widths[size]}px`,
        height: `${height}px`,
      }"
    />
  </div>
</template>
