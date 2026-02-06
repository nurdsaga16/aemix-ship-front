<script setup>
import { ChevronDown } from 'lucide-vue-next'

defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /** Дополнительные классы для select */
  inputClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const baseInputClass =
  'w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed'
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="[baseInputClass, inputClass]"
      v-bind="$attrs"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <slot />
    </select>
    <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      <ChevronDown class="w-4 h-4" />
    </div>
  </div>
</template>
