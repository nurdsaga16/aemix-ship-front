<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Mail, Send } from 'lucide-vue-next'

import GlassCard from '@/components/GlassCard.vue'
import Header from '@/components/Header.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const isSubmitting = ref(false)
const error = ref('')
const successMessage = ref('')

const handleSubmit = async () => {
  error.value = ''
  successMessage.value = ''

  if (!email.value.trim()) {
    error.value = 'Введите email.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.forgotPassword(email.value.trim())
    successMessage.value = 'Ссылка для сброса пароля отправлена на почту.'
  } catch (e) {
    error.value = 'Не удалось отправить письмо. Проверьте email и попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/login')
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
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Mail class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 class="text-caps text-lg">СБРОС ПАРОЛЯ</h1>
                <p class="text-muted-foreground text-xs">
                  Введите email, мы отправим ссылку для сброса пароля.
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
                  class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-4 text-sm md:text-base outline-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <p v-if="error" class="text-xs text-destructive mb-3">
                {{ error }}
              </p>
              <p v-if="successMessage" class="text-xs text-emerald-400 mb-3">
                {{ successMessage }}
              </p>

              <div class="pt-2">
                <button
                  class="w-full mb-3 py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="isSubmitting"
                  @click="handleSubmit"
                >
                  <Send class="w-4 h-4" />
                  <span v-if="!isSubmitting">ОТПРАВИТЬ ССЫЛКУ</span>
                  <div
                    v-else
                    class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                  />
                </button>

                <button
                  type="button"
                  class="w-full text-center text-xs text-muted-foreground"
                  @click="goBack"
                >
                  Вернуться к
                  <span class="text-accent-italic">входу</span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  </div>
</template>
