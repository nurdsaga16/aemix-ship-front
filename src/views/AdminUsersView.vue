<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Users, ChevronDown, Pencil, Trash2 } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()

const users = ref([
  {
    id: 101,
    emailOrTelegramId: 'admin@aemix.com',
    role: 'ADMIN',
    isVerified: true,
  },
  {
    id: 102,
    emailOrTelegramId: 'user01@aemix.com',
    role: 'USER',
    isVerified: true,
  },
  {
    id: 103,
    emailOrTelegramId: 'telegram_234567',
    role: 'USER',
    isVerified: false,
  },
  {
    id: 104,
    emailOrTelegramId: 'user02@aemix.com',
    role: 'USER',
    isVerified: true,
  },
])

const searchQuery = ref('')
const roleFilter = ref('all')
const verificationFilter = ref('all')

const roleOptions = [
  { id: 'all', label: 'Все роли' },
  { id: 'ADMIN', label: 'ADMIN' },
  { id: 'USER', label: 'USER' },
]

const verificationOptions = [
  { id: 'all', label: 'Все статусы' },
  { id: 'verified', label: 'Подтвержден' },
  { id: 'unverified', label: 'Не подтвержден' },
]

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return users.value.filter((user) => {
    const matchesQuery =
      !query || user.emailOrTelegramId.toLowerCase().includes(query) || String(user.id).includes(query)
    const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value
    const matchesVerification =
      verificationFilter.value === 'all' ||
      (verificationFilter.value === 'verified' && user.isVerified) ||
      (verificationFilter.value === 'unverified' && !user.isVerified)
    return matchesQuery && matchesRole && matchesVerification
  })
})

const handleBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen relative z-10">
    <header class="flex items-center gap-4 py-4 px-5">
      <button
        @click="handleBack"
        class="w-11 h-11 rounded-full glass-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-caps text-lg">ВСЕ ПОЛЬЗОВАТЕЛИ</h1>
    </header>

    <main class="px-5 pb-8 space-y-5 md:max-w-3xl md:mx-auto">
      <GlassCard :delay="0.05">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-caps text-sm">УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</p>
            <p class="text-xs text-muted-foreground">
              Управление пользователями и ролями
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard :delay="0.08">
        <label class="block text-caps text-xs text-muted-foreground mb-3">
          ПОИСК
        </label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ID или email/telegram"
          class="w-full bg-glass/40 border border-glass-border rounded-2xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </GlassCard>

      <GlassCard :delay="0.1">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              РОЛЬ
            </label>
            <div class="relative">
              <select
                v-model="roleFilter"
                class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option v-for="option in roleOptions" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
              <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
          </div>
          <div>
            <label class="block text-caps text-[11px] text-muted-foreground mb-2">
              ВЕРИФИКАЦИЯ
            </label>
            <div class="relative">
              <select
                v-model="verificationFilter"
                class="w-full appearance-none bg-glass/50 border border-glass-border/80 rounded-xl pl-4 pr-10 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option v-for="option in verificationOptions" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
              <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ChevronDown class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard :delay="0.12">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Найдено пользователей</span>
          <span class="text-foreground font-semibold">{{ filteredUsers.length }}</span>
        </div>
      </GlassCard>

      <div class="space-y-3">
        <GlassCard
          v-for="(user, index) in filteredUsers"
          :key="user.id"
          :delay="0.15 + index * 0.03"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-caps text-sm mb-1">ID {{ user.id }}</p>
              <p class="text-foreground text-sm break-all">
                {{ user.emailOrTelegramId }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase',
                    user.role === 'ADMIN'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-glass/60 text-muted-foreground'
                  ]"
                >
                  {{ user.role }}
                </span>
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase',
                    user.isVerified
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-300'
                  ]"
                >
                  {{ user.isVerified ? 'VERIFIED' : 'PENDING' }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                class="w-10 h-10 rounded-2xl bg-glass/60 border border-glass-border/70 flex items-center justify-center hover:bg-glass/80 transition-all active:scale-[0.98]"
                title="Редактировать"
              >
                <Pencil class="w-4 h-4 text-foreground" />
              </button>
              <button
                type="button"
                class="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center hover:bg-destructive/20 transition-all active:scale-[0.98]"
                title="Удалить"
              >
                <Trash2 class="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  </div>
</template>
