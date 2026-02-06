<script setup>
import { Plus, Check } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GlassCard from '@/components/GlassCard.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import FormLabel from '@/components/FormLabel.vue'
import AppInput from '@/components/AppInput.vue'
import Loader from '@/components/Loader.vue'
import { useOrdersStore } from '@/stores/useOrdersStore'

const router = useRouter()
const ordersStore = useOrdersStore()

const trackNumber = ref('')
const title = ref('')
const isSubmitting = ref(false)
const showSuccess = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!trackNumber.value.trim()) return
  
  isSubmitting.value = true
  error.value = ''
  showSuccess.value = false
  
  try {
    await ordersStore.addOrderToUser(
      trackNumber.value.trim(),
      title.value.trim() || null
    )
    // Обновляем список заказов после добавления
    await ordersStore.fetchMyOrders({ page: 0, size: 500 }).catch(() => {})
    showSuccess.value = true
    
    setTimeout(() => {
      showSuccess.value = false
      trackNumber.value = ''
      title.value = ''
      router.push('/orders')
    }, 1500)
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось добавить заказ'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <PageLayout>
    <PageHeader title="ДОБАВИТЬ ЗАКАЗ" />

    <PageMain contentClass="flex flex-col justify-center min-h-[calc(100vh-140px)]">
      <GlassCard class="mb-6" :delay="0.1">
        <p class="text-muted-foreground text-sm leading-relaxed mb-1">
          Введите трек-номер вашего заказа из Китая.
        </p>
        <p class="text-accent-italic text-sm">
          Мы начнём отслеживание автоматически.
        </p>
      </GlassCard>

      <GlassCard :delay="0.2">
        <FormLabel margin="mb-3">ТРЕК-НОМЕР</FormLabel>
        <AppInput
          v-model="trackNumber"
          type="text"
          placeholder="SF1234567890123"
          input-class="font-mono text-lg tracking-wider py-4"
          @keyup.enter="handleSubmit"
        />

        <div class="mt-4">
          <FormLabel margin="mb-3">НАЗВАНИЕ (необязательно)</FormLabel>
        <AppInput
          v-model="title"
          type="text"
          placeholder="Например: Заказ из Pinduoduo"
        />
        </div>

        <button
          @click="handleSubmit"
          :disabled="!trackNumber.trim() || isSubmitting"
          :class="[
            'w-full mt-4 py-4 rounded-2xl text-caps text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
            showSuccess
              ? 'bg-green-500 text-white'
              : trackNumber.trim()
              ? 'bg-primary text-primary-foreground hover:brightness-110'
              : 'bg-glass/40 text-muted-foreground cursor-not-allowed'
          ]"
        >
          <Check v-if="showSuccess" class="w-5 h-5" />
          <span v-if="showSuccess">ДОБАВЛЕНО</span>
          <Loader v-else-if="isSubmitting" size="md" variant="foreground" />
          <template v-else>
            <Plus class="w-5 h-5" />
            <span>ДОБАВИТЬ</span>
          </template>
        </button>

        <div v-if="error" class="mt-4">
          <div class="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {{ error }}
          </div>
        </div>
      </GlassCard>
    </PageMain>
  </PageLayout>
</template>
