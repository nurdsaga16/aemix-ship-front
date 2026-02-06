<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Save } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import FormLabel from '@/components/FormLabel.vue'
import AppInput from '@/components/AppInput.vue'
import Loader from '@/components/Loader.vue'
import { useInstructionLinksStore } from '@/stores/useInstructionLinksStore'

const router = useRouter()
const linksStore = useInstructionLinksStore()

const editingId = ref(null)
const editLink = ref('')
const editSubtitle = ref('')
const saveError = ref('')
const isSaving = ref(false)

const handleBack = () => router.push('/')

const startEdit = (item) => {
  editingId.value = item.id
  editLink.value = item.link || ''
  editSubtitle.value = item.subtitle || ''
  saveError.value = ''
}

const cancelEdit = () => {
  editingId.value = null
  editLink.value = ''
  editSubtitle.value = ''
  saveError.value = ''
}

const saveEdit = async () => {
  if (editingId.value == null) return
  isSaving.value = true
  saveError.value = ''
  try {
    await linksStore.updateLink(editingId.value, {
      link: editLink.value.trim() || '#',
      subtitle: editSubtitle.value.trim() || '',
    })
    cancelEdit()
  } catch (e) {
    saveError.value = e.response?.data?.message || 'Не удалось сохранить'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  linksStore.fetchLinks().catch(() => {})
})
</script>

<template>
  <PageLayout>
    <PageHeader title="РЕДАКТИРОВАНИЕ ССЫЛОК" :on-back="handleBack" />

    <PageMain contentClass="space-y-5">
      <GlassCard :delay="0.05">
        <p class="text-muted-foreground text-sm">
          Здесь можно изменить ссылки на инструкции, отображаемые на странице «Инструкции».
        </p>
      </GlassCard>

      <div v-if="linksStore.loading" class="flex justify-center py-12">
        <Loader size="lg" />
      </div>

      <div v-else class="space-y-4">
        <GlassCard
          v-for="(item, index) in linksStore.links"
          :key="item.id"
          :delay="0.1 + index * 0.05"
        >
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen class="w-5 h-5 text-primary" />
              </div>
              <div>
                <p class="text-caps text-sm">{{ item.title }}</p>
                <p class="text-muted-foreground text-xs">{{ item.linkKey }}</p>
              </div>
            </div>

            <template v-if="editingId === item.id">
              <div>
                <FormLabel margin="mb-2">Ссылка</FormLabel>
                <AppInput
                  v-model="editLink"
                  type="url"
                  placeholder="https://..."
                  @keyup.enter="saveEdit"
                />
              </div>
              <div>
                <FormLabel margin="mb-2">Подзаголовок (необязательно)</FormLabel>
                <AppInput
                  v-model="editSubtitle"
                  placeholder="Например: Как заказать через приложение"
                />
              </div>
              <div v-if="saveError" class="text-sm text-red-400">
                {{ saveError }}
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="saveEdit"
                  :disabled="isSaving"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Save class="w-4 h-4" />
                  {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
                </button>
                <button
                  type="button"
                  @click="cancelEdit"
                  :disabled="isSaving"
                  class="px-4 py-2 rounded-xl bg-glass/40 text-muted-foreground text-sm hover:text-foreground transition-all disabled:opacity-50"
                >
                  Отмена
                </button>
              </div>
            </template>

            <template v-else>
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-muted-foreground text-xs truncate">{{ item.link || '—' }}</p>
                  <p v-if="item.subtitle" class="text-muted-foreground/70 text-xs mt-0.5">
                    {{ item.subtitle }}
                  </p>
                </div>
                <button
                  type="button"
                  @click="startEdit(item)"
                  class="shrink-0 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition-all"
                >
                  Изменить
                </button>
              </div>
            </template>
          </div>
        </GlassCard>
      </div>
    </PageMain>
  </PageLayout>
</template>
