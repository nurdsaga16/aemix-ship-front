<script setup>
import { onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import StarField from '@/components/StarField.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/api'
import { getStartAppToken } from '@/lib/telegramStartApp'
import { TELEGRAM_MINI_APP_LINK } from '@/constants/telegram'

const router = useRouter()
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

onMounted(async () => {
  const hash = window.location.hash?.slice(1) || ''
  const params = new URLSearchParams(hash)

  // 1. Mini App: initData — всегда есть при открытии из Telegram
  const initData = window.Telegram?.WebApp?.initData
  if (initData) {
    try {
      const res = (await api.post('/auth/telegram/init', { initData })).data
      if (res.token) {
        authStore.loginWithToken(res.token)
        window.history.replaceState(null, '', window.location.pathname)
        router.replace('/')
        return
      }
    } catch {
      // initData невалидна
    }
  }
  // 2. Fallback: startapp токен — из ссылки бота
  const startAppToken = getStartAppToken()
  if (startAppToken) {
    try {
      const res = (await api.post('/auth/telegram/startapp', { token: startAppToken })).data
      if (res.token) {
        authStore.loginWithToken(res.token)
        window.history.replaceState(null, '', window.location.pathname)
        router.replace('/')
      }
    } catch {
      // токен просрочен или недействителен — игнорируем
    }
  }

  // 3. Прямая ссылка: #auth_token=JWT (fallback для старого формата)
  const authToken = params.get('auth_token')
  if (authToken && !authStore.authData?.token) {
    const token = decodeURIComponent(authToken)
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
