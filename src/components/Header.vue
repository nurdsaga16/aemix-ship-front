<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, User, UserCircle2 } from 'lucide-vue-next'

import Logo from './Logo.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const isMenuOpen = ref(false)

const isAuthenticated = computed(() => !!authStore.authData?.token)

const displayIdentifier = computed(() => {
  const data = authStore.authData
  if (!data) return ''
  if (data.identifier) return data.identifier
  if (data.telegramId) return `Telegram ID: ${data.telegramId}`
  return ''
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const goToProfile = () => {
  router.push('/profile')
  isMenuOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  isMenuOpen.value = false
}
</script>

<template>
  <header class="flex items-center justify-between py-4 px-5 relative z-10">
    <div class="flex items-center gap-3">
      <Logo />
      <span class="text-caps text-xl tracking-widest">AEMIX</span>
    </div>

    <div v-if="isAuthenticated" class="relative">
      <button
        type="button"
        class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        @click="toggleMenu"
      >
        <User class="w-5 h-5 text-foreground" />
      </button>

      <div
        v-if="isMenuOpen"
        class="absolute right-0 mt-2 w-64 rounded-2xl bg-glass/90 border border-glass-border shadow-xl backdrop-blur-xl py-2 z-20"
      >
        <div
          v-if="displayIdentifier"
          class="px-4 pb-3 border-b border-glass-border"
        >
          <p class="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
            Аккаунт
          </p>
          <p class="text-sm font-medium text-foreground truncate">
            {{ displayIdentifier }}
          </p>
        </div>

        <button
          type="button"
          class="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-glass/70 transition-colors"
          @click="goToProfile"
        >
          <UserCircle2 class="w-4 h-4" />
          <span>Профиль</span>
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          @click="handleLogout"
        >
          <LogOut class="w-4 h-4" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  </header>
</template>
