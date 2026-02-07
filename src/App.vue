<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import StarField from '@/components/StarField.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/api'
import { TELEGRAM_MINI_APP_LINK } from '@/constants/telegram'

const authStore = useAuthStore()

function redirectToMiniApp() {
  const tg = window.Telegram?.WebApp
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(TELEGRAM_MINI_APP_LINK)
    tg.close?.()
  } else {
    window.location.href = TELEGRAM_MINI_APP_LINK
  }
}

onMounted(() => {
  const hash = window.location.hash
  const authTokenMatch = hash?.match(/#auth_token=([^&]+)/)
  if (authTokenMatch?.[1]) {
    const token = decodeURIComponent(authTokenMatch[1])
    if (authStore.loginWithToken(token)) {
      redirectToMiniApp()
      return
    }
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
