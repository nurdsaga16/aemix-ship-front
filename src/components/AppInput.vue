<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /** Дополнительные классы для input */
  inputClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const baseClass =
  'w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed'
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="[baseClass, inputClass]"
    v-bind="$attrs"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
