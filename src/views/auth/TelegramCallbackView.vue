<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const route = useRoute()
const authStore = useAuthStore()

const error = ref('')
const loading = ref(true)

onMounted(async () => {
  const params = route.query
  const hash = params.hash
  if (!hash || !params.id) {
    error.value = 'Неверная ссылка авторизации'
    loading.value = false
    return
  }

  const payload = {
    id: Number(params.id),
    first_name: params.first_name || null,
    last_name: params.last_name || null,
    username: params.username || null,
    photo_url: params.photo_url || null,
    auth_date: Number(params.auth_date),
    hash,
  }

  try {
    await authStore.loginWithTelegram(payload)
    // Передаём токен в hash — Mini App и callback в разных контекстах (разный localStorage)
    const token = authStore.authData?.token
    const url = token
      ? `${window.location.origin}/#auth_token=${encodeURIComponent(token)}`
      : window.location.origin + '/'
    window.location.href = url
  } catch (e) {
    error.value = 'Ошибка входа через Telegram'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-5">
    <div v-if="loading" class="flex flex-col items-center gap-4">
      <div class="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p class="text-muted-foreground text-sm">Вход через Telegram...</p>
    </div>
    <div v-else-if="error" class="text-center">
      <p class="text-destructive mb-4">{{ error }}</p>
      <router-link
        to="/login"
        class="text-primary text-sm font-bold hover:underline"
      >
        Вернуться на страницу входа
      </router-link>
    </div>
  </div>
</template>
