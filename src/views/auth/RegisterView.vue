<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Mail, Lock, UserPlus } from 'lucide-vue-next'

import GlassCard from '@/components/GlassCard.vue'
import Header from '@/components/Header.vue'
import TelegramIcon from '@/components/TelegramIcon.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
const telegramWidgetId = 'telegram-register-widget'

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  if (!email.value.trim() || !password.value.trim()) return

  isSubmitting.value = true

  try {
    const identifier = email.value.trim()
    await authStore.register(identifier, password.value.trim())
    // помечаем, что пользователь только что прошёл регистрацию
    sessionStorage.setItem('pendingVerificationIdentifier', identifier)
    router.push({ path: '/verify', query: { identifier } })
  } catch (e) {
    error.value = 'Произошла ошибка. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

const handleTelegramLogin = () => {
  const widget = document.getElementById(telegramWidgetId)
  if (widget) {
    widget.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const injectTelegramWidget = () => {
  if (document.getElementById(telegramWidgetId)) return

  window.onTelegramRegister = async (user) => {
    try {
      await authStore.loginWithTelegram(user)
      router.push('/')
    } catch (e) {
      error.value = 'Ошибка входа через Telegram'
    }
  }

  const script = document.createElement('script')
  script.id = telegramWidgetId
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', 'aemixshipbot')
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-userpic', 'false')
  script.setAttribute(
    'data-auth-url',
    'https://aemix-ship-front.vercel.app/login',
  )
  script.setAttribute('data-request-access', 'write')

  document.getElementById('telegram-register-container')?.appendChild(script)
}

onMounted(() => {
  injectTelegramWidget()
})

onBeforeUnmount(() => {
  if (window.onTelegramRegister) {
    delete window.onTelegramRegister
  }
})

const goBack = () => {
  router.push('/')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen relative z-10 flex flex-col">
    <Header />

    <main class="flex-1 px-5 pb-10 flex">
      <div class="w-full flex justify-center items-start pt-4 md:pt-12">
        <div class="max-w-sm">
          <GlassCard class="mb-4" :delay="0.1">
            <div class="flex items-center gap-3">
              <div class="w-20 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UserPlus class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 class="text-caps text-xl">РЕГИСТРАЦИЯ</h1>
                <p class="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  Создайте аккаунт AEMIX Galaxy, чтобы отслеживать заказы и управлять доставкой.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard :delay="0.2">
            <div>
              <div class="mb-4">
                <label class="block text-caps text-xs text-muted-foreground mb-2">
                  EMAIL
                </label>
                <input
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-4 text-sm md:text-base bg-transparent outline-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div class="mb-4">
                <label class="block text-caps text-xs text-muted-foreground mb-2">
                  ПАРОЛЬ
                </label>
                <input
                  v-model="password"
                  type="password"
                  placeholder="Минимум 8 символов"
                  class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-4 text-sm md:text-base bg-transparent outline-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <p v-if="error" class="text-xs text-destructive mb-3">
                {{ error }}
              </p>

              <div class="pt-2">
                <button
                  class="w-full mb-3 py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all"
                  @click="handleSubmit"
                >
                  <span v-if="!isSubmitting">ЗАРЕГИСТРИРОВАТЬСЯ</span>
                  <div
                    v-else
                    class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                  />
                </button>

                <div class="relative w-full mb-4">
                  <button
                    class="w-full py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    style="background-color: #229ED9; color: white;"
                    @click="handleTelegramLogin"
                  >
                    <TelegramIcon />
                    <span>ВОЙТИ С TELEGRAM</span>
                  </button>

                  <div
                    id="telegram-register-container"
                    class="absolute inset-0 w-full h-full opacity-0 pointer-events-auto"
                  />
                </div>

                <button
                  type="button"
                  class="w-full text-center text-xs text-muted-foreground"
                  @click="goToLogin"
                >
                  Уже есть аккаунт?
                  <span class="text-accent-italic">Войти</span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  </div>
</template>

