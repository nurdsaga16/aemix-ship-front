<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, Pencil, Trash2, Check, X } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import Pagination from '@/components/Pagination.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import AppSelect from '@/components/AppSelect.vue'
import FormLabel from '@/components/FormLabel.vue'
import AppInput from '@/components/AppInput.vue'
import { useFilterDebounce } from '@/composables/useFilterDebounce'
import { PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import { useUserStore } from '@/stores/useUserStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { getRoleFromToken } from '@/lib/auth'

const userStore = useUserStore()
const authStore = useAuthStore()

const currentUserIdentifier = computed(() => {
  const data = authStore.authData
  if (!data) return null
  if (data.emailOrTelegramId) return data.emailOrTelegramId
  if (data.telegramId != null) return String(data.telegramId)
  return null
})

const currentUserRole = computed(() => getRoleFromToken(authStore.authData?.token))

const canEditOrDeleteUser = (user) => {
  if (currentUserRole.value !== 'SUPER_ADMIN') return false
  return user.emailOrTelegramId !== currentUserIdentifier.value
}

const searchQuery = ref('')
const roleFilter = ref('all')
const verificationFilter = ref('all')
const confirmDelete = ref(null)
const saveError = ref(null)
const pageSize = ref(20)

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

const isVerifiedParam = computed(() => {
  if (verificationFilter.value === 'verified') return true
  if (verificationFilter.value === 'unverified') return false
  return null
})

const loadUsers = (page = 0) => {
  return userStore
    .fetchUsers({
      page,
      size: pageSize.value,
      text: searchQuery.value.trim() || null,
      role: roleFilter.value === 'all' ? null : roleFilter.value,
      isVerified: isVerifiedParam.value,
    })
    .catch(() => {})
}

const goToPage = (page) => {
  if (page < 0 || page >= userStore.totalPages) return
  loadUsers(page)
}

const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize
  loadUsers(0)
}

useFilterDebounce(
  [searchQuery, roleFilter, verificationFilter, pageSize],
  () => loadUsers(0),
  400
)

onMounted(() => {
  loadUsers(0)
})

const startEdit = (user) => {
  if (!canEditOrDeleteUser(user)) return
  user.isEditing = true
  user.draftRole = user.role
}

const cancelEdit = (user) => {
  user.isEditing = false
  user.draftRole = user.role
}

const saveEdit = async (user) => {
  saveError.value = null
  try {
    await userStore.updateUser(user.emailOrTelegramId, { role: user.draftRole })
    user.role = user.draftRole
    user.isEditing = false
  } catch (e) {
    saveError.value = userStore.error || 'Не удалось сохранить'
  }
}

const handleDelete = (user) => {
  if (!canEditOrDeleteUser(user)) return
  confirmDelete.value = user
}

const closeDelete = () => {
  confirmDelete.value = null
  saveError.value = null
}

const confirmDeleteUser = async () => {
  if (!confirmDelete.value) return
  const user = confirmDelete.value
  try {
    await userStore.deleteUser(user.emailOrTelegramId)
    confirmDelete.value = null
  } catch (e) {
    saveError.value = userStore.error || 'Не удалось удалить'
  }
}
</script>

<template>
  <PageLayout>
    <PageHeader title="ВСЕ ПОЛЬЗОВАТЕЛИ" />

    <PageMain contentClass="space-y-5">
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
        <FormLabel margin="mb-3">ПОИСК</FormLabel>
        <AppInput
          v-model="searchQuery"
          placeholder="ID или email/telegram"
        />
      </GlassCard>

      <GlassCard :delay="0.1">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <FormLabel>РОЛЬ</FormLabel>
            <AppSelect v-model="roleFilter">
              <option v-for="option in roleOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </AppSelect>
          </div>
          <div>
            <FormLabel>ВЕРИФИКАЦИЯ</FormLabel>
            <AppSelect v-model="verificationFilter">
              <option v-for="option in verificationOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </AppSelect>
          </div>
        </div>
      </GlassCard>

      <p v-if="userStore.error || saveError" class="text-xs text-destructive">
        {{ userStore.error || saveError }}
      </p>

      <GlassCard :delay="0.12">
        <Pagination
          :page="userStore.page"
          :total-pages="userStore.totalPages"
          :total-elements="userStore.totalElements"
          :size="userStore.size || pageSize"
          :loading="userStore.loading"
          :show-page-size="true"
          :page-size-options="PAGE_SIZE_OPTIONS"
          item-label="пользователей"
          @page-change="goToPage"
          @page-size-change="handlePageSizeChange"
        />
      </GlassCard>

      <div class="space-y-3">
        <GlassCard
          v-for="(user, index) in userStore.users"
          :key="user.emailOrTelegramId"
          :delay="0.15 + index * 0.03"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-caps text-sm mb-1 text-muted-foreground">Идентификатор</p>
              <p class="text-foreground text-sm break-all">
                {{ user.emailOrTelegramId }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase',
                    user.role === 'SUPER_ADMIN'
                      ? 'bg-amber-500/20 text-amber-400'
                      : user.role === 'ADMIN'
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
              <div v-if="user.isEditing" class="mt-4">
                <label class="block text-caps text-[11px] text-muted-foreground mb-2">
                  РОЛЬ
                </label>
                <div class="relative">
                    <select
                      v-model="user.draftRole"
                      class="w-full appearance-none bg-glass/40 border border-glass-border rounded-xl pl-3 pr-9 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="USER">USER</option>
                    </select>
                  <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ChevronDown class="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <template v-if="user.isEditing">
                <template v-if="canEditOrDeleteUser(user)">
                  <button
                    type="button"
                    class="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center hover:bg-primary/25 transition-all active:scale-[0.98]"
                    title="Сохранить"
                    @click="saveEdit(user)"
                  >
                    <Check class="w-4 h-4 text-primary" />
                  </button>
                  <button
                    type="button"
                    class="w-10 h-10 rounded-2xl bg-glass/60 border border-glass-border/70 flex items-center justify-center hover:bg-glass/80 transition-all active:scale-[0.98]"
                    title="Отменить"
                    @click="cancelEdit(user)"
                  >
                    <X class="w-4 h-4 text-muted-foreground" />
                  </button>
                </template>
              </template>
              <template v-else>
                <template v-if="canEditOrDeleteUser(user)">
                  <button
                    type="button"
                    class="w-10 h-10 rounded-2xl bg-glass/60 border border-glass-border/70 flex items-center justify-center hover:bg-glass/80 transition-all active:scale-[0.98]"
                    title="Редактировать"
                    @click="startEdit(user)"
                  >
                    <Pencil class="w-4 h-4 text-foreground" />
                  </button>
                  <button
                    type="button"
                    class="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center hover:bg-destructive/20 transition-all active:scale-[0.98]"
                    title="Удалить"
                    @click="handleDelete(user)"
                  >
                    <Trash2 class="w-4 h-4 text-destructive" />
                  </button>
                </template>
              </template>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageMain>

    <div
      v-if="confirmDelete"
      class="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-5 sm:items-center"
      @click.self="closeDelete"
    >
      <GlassCard class="w-full max-w-md">
        <p class="text-caps text-sm mb-2">УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ</p>
        <p class="text-muted-foreground text-sm mb-4">
          {{ confirmDelete.emailOrTelegramId }}
        </p>
        <div class="flex items-center gap-3">
          <button
            class="flex-1 py-3 rounded-2xl text-caps text-xs font-bold bg-glass/50 border border-glass-border/70 hover:bg-glass/70 transition-all"
            @click="closeDelete"
          >
            ОТМЕНА
          </button>
          <button
            class="flex-1 py-3 rounded-2xl text-caps text-xs font-bold bg-destructive text-destructive-foreground hover:brightness-110 transition-all"
            @click="confirmDeleteUser"
          >
            УДАЛИТЬ
          </button>
        </div>
      </GlassCard>
    </div>
  </PageLayout>
</template>
