<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import StarField from '@/components/StarField.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/api'

const authStore = useAuthStore()

onMounted(() => {
  // Токен из hash после редиректа с Telegram callback (разные контексты storage)
  const hash = window.location.hash
  const authMatch = hash.match(/auth_token=([^&]+)/)
  if (authMatch) {
    const token = decodeURIComponent(authMatch[1])
    authStore.restoreToken(token)
    window.history.replaceState(null, '', window.location.pathname || '/')
  }

  if (authStore.authData?.token) {
    api.get('/auth/me').catch(() => {})
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground overflow-x-hidden relative">
    <StarField />
    <RouterView v-show="!authStore.isLoggingOut" />
    <Transition name="fade">
      <div
        v-if="authStore.isLoggingOut"
        class="fixed inset-0 z-[100] bg-background flex items-center justify-center"
        aria-hidden="true"
      >
        <div class="h-8 w-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped></style>
