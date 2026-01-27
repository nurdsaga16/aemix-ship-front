<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next'

import GlassCard from '@/components/GlassCard.vue'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const code = ref('')
const isSubmitting = ref(false)
const error = ref('')
const identifier = computed(() => (route.query.identifier || '').toString().trim())

const handleSubmit = async () => {
  error.value = ''
  if (!identifier.value) {
    error.value = 'Не указан email или Telegram ID.'
    return
  }
  if (code.value.trim().length !== 6) {
    error.value = 'Введите 6-значный код из письма.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.verify(identifier.value, code.value.trim())
    router.push('/login')
  } catch (e) {
    error.value = 'Неверный код. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

const handleResend = async () => {
  error.value = ''
  if (!identifier.value) {
    error.value = 'Не указан email или Telegram ID.'
    return
  }
  try {
    await authStore.resendVerificationCode(identifier.value)
  } catch (e) {
    error.value = 'Не удалось отправить код повторно.'
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen relative z-10 flex flex-col">
    <Header />

    <main class="flex-1 px-5 pb-10 flex flex-col">
      <button
        class="mt-2 mb-4 w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <div class="flex justify-center items-start pt-0 md:pt-6">
        <div class="max-w-sm">
          <GlassCard class="mb-4" :delay="0.1">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 class="text-caps text-lg">ПОДТВЕРЖДЕНИЕ</h1>
                <p class="text-muted-foreground text-xs">
                  Мы отправили 6-значный код на вашу почту.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard :delay="0.2">
            <div>
              <div class="mb-4">
                <label class="block text-caps text-xs text-muted-foreground mb-2">
                  КОД ПОДТВЕРЖДЕНИЯ
                </label>
                <input
                  v-model="code"
                  type="text"
                  maxlength="6"
                  inputmode="numeric"
                  placeholder="••••••"
                  class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-4 text-center text-2xl tracking-[0.4em] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <p v-if="error" class="text-xs text-destructive mt-2">
                  {{ error }}
                </p>
              </div>

              <div class="pt-2">
                <button
                  class="w-full mb-3 py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="code.trim().length !== 6 || isSubmitting"
                  @click="handleSubmit"
                >
                  <span v-if="!isSubmitting">ПОДТВЕРДИТЬ</span>
                  <div
                    v-else
                    class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                  />
                </button>

                <p class="text-xs text-muted-foreground text-center">
                  Не пришёл код?
                  <button
                    type="button"
                    class="text-accent-italic"
                    @click="handleResend"
                  >
                    Отправить ещё раз
                  </button>
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  </div>
</template>

