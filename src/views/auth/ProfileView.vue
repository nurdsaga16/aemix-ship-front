<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, Lock, User, CheckCircle2 } from 'lucide-vue-next'

import GlassCard from '@/components/GlassCard.vue'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const isAccordionOpen = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

const identifier = computed(() => {
  const data = authStore.authData
  if (!data) return ''
  if (data.identifier) return data.identifier
  if (data.emailOrTelegramId) return data.emailOrTelegramId
  if (data.telegramId != null) return String(data.telegramId)
  return ''
})

const toggleAccordion = () => {
  isAccordionOpen.value = !isAccordionOpen.value
}

const handleChangePassword = async () => {
  error.value = ''
  success.value = ''

  if (!currentPassword.value.trim() || !newPassword.value.trim() || !confirmNewPassword.value.trim()) {
    error.value = 'Заполните все поля.'
    return
  }

  if (newPassword.value !== confirmNewPassword.value) {
    error.value = 'Новый пароль и подтверждение не совпадают.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.changePassword(
      currentPassword.value.trim(),
      newPassword.value.trim(),
      confirmNewPassword.value.trim(),
    )
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    success.value = 'Пароль успешно изменён.'
  } catch (e) {
    error.value = 'Не удалось изменить пароль. Проверьте данные и попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen relative z-10 flex flex-col">
    <Header />

    <main class="flex-1 px-5 pb-10 flex flex-col relative">
      <button
        class="absolute left-5 top-4 w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        @click="goBack"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="flex justify-center items-start mt-20 md:mt-24">
        <div class="max-w-md w-full space-y-4">
          <GlassCard :delay="0.1">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 class="text-caps text-lg">ПРОФИЛЬ</h1>
              </div>
            </div>

            <div class="mt-4 space-y-2">
              <p class="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                ИДЕНТИФИКАТОР
              </p>
              <p class="text-sm md:text-base font-medium text-foreground break-all">
                {{ identifier }}
              </p>
            </div>
          </GlassCard>

          <GlassCard :delay="0.15">
            <button
              type="button"
              class="w-full flex items-center justify-between gap-2 text-left"
              @click="toggleAccordion"
            >
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Lock class="w-4 h-4 text-primary" />
                </div>
                <span class="text-sm font-medium">Изменить пароль</span>
              </div>
              <ChevronDown
                class="w-4 h-4 transition-transform duration-200"
                :class="isAccordionOpen ? 'rotate-180' : ''"
              />
            </button>

            <div
              v-if="isAccordionOpen"
              class="mt-4 space-y-5"
            >
              <div>
                <label class="block text-caps text-xs text-muted-foreground mb-1">
                  ТЕКУЩИЙ ПАРОЛЬ
                </label>
                <input
                  v-model="currentPassword"
                  type="password"
                  class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-3 text-sm md:text-base outline-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Текущий пароль"
                />
              </div>

              <div>
                <label class="block text-caps text-xs text-muted-foreground mb-1">
                  НОВЫЙ ПАРОЛЬ
                </label>
                <input
                  v-model="newPassword"
                  type="password"
                  class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-3 text-sm md:text-base outline-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Новый пароль"
                />
              </div>

              <div>
                <label class="block text-caps text-xs text-muted-foreground mb-1">
                  ПОВТОРИТЕ НОВЫЙ ПАРОЛЬ
                </label>
                <input
                  v-model="confirmNewPassword"
                  type="password"
                  class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-3 text-sm md:text-base outline-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Повторите новый пароль"
                />
              </div>

              <p v-if="error" class="text-xs text-destructive">
                {{ error }}
              </p>
              <p v-if="success" class="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 class="w-3 h-3" />
                <span>{{ success }}</span>
              </p>

              <button
                type="button"
                class="mt-2 w-full py-3 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
                @click="handleChangePassword"
              >
                <span v-if="!isSubmitting">ИЗМЕНИТЬ ПАРОЛЬ</span>
                <div
                  v-else
                  class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  </div>
</template>

