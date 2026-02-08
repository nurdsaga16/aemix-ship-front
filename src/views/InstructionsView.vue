<script setup>
import { computed, onMounted } from 'vue'
import { Smartphone, Play, BookOpen, ExternalLink, Settings, Film } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import Loader from '@/components/Loader.vue'
import { useInstructionLinksStore } from '@/stores/useInstructionLinksStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { getRoleFromToken } from '@/lib/auth'
import { getVideoEmbedUrl } from '@/composables/useVideoEmbed'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => getRoleFromToken(authStore.authData?.token) === 'SUPER_ADMIN')

const iconMap = {
  pinduoduo: Smartphone,
  alipay: Play,
  tracking: BookOpen,
  video: Film,
}

const linksStore = useInstructionLinksStore()
const guides = computed(() =>
  linksStore.links
    .filter((g) => g.linkKey !== 'video')
    .map((g) => ({
      ...g,
      icon: iconMap[g.linkKey] || BookOpen,
    })),
)

const videoLink = computed(() =>
  linksStore.links.find((g) => g.linkKey === 'video'),
)

const videoEmbedUrl = computed(() =>
  videoLink.value?.link ? getVideoEmbedUrl(videoLink.value.link) : null,
)

onMounted(() => {
  linksStore.fetchLinks().catch(() => {})
})
</script>

<template>
  <PageLayout>
    <PageHeader title="ИНСТРУКЦИИ">
      <template v-if="isSuperAdmin" #trailing>
        <router-link
          to="/admin/instructions"
          class="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-3 py-2.5 sm:min-w-0 sm:min-h-0 sm:py-1.5 rounded-xl bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 active:scale-95 transition-all"
          aria-label="Редактировать ссылки"
        >
          <Settings class="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
          <span class="hidden sm:inline">Редактировать ссылки</span>
        </router-link>
      </template>
    </PageHeader>

    <PageMain>
      <GlassCard class="mb-6" :delay="0.1">
        <p class="text-muted-foreground text-sm leading-relaxed">
          Полезные видео и гайды для работы с китайскими площадками.
          <span class="text-accent-italic">Смотрите, учитесь, заказывайте!</span>
        </p>
      </GlassCard>

      <div v-if="linksStore.loading" class="flex justify-center py-12">
        <Loader size="lg" />
      </div>
      <div v-else class="space-y-3">
        <GlassCard
          v-for="(guide, index) in guides"
          :key="guide.id"
          :delay="0.2 + index * 0.1"
          :class="{ 'cursor-pointer hover:border-primary/30': guide.link && guide.link !== '#' }"
        >
          <a
            v-if="guide.link && guide.link !== '#'"
            :href="guide.link"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 w-full text-inherit no-underline hover:opacity-90 transition-opacity"
          >
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <component :is="guide.icon" class="w-6 h-6 text-primary" />
              </div>
              <div class="min-w-0">
                <p class="text-caps text-sm mb-0.5">{{ guide.title }}</p>
                <p class="text-muted-foreground text-xs">{{ guide.subtitle }}</p>
              </div>
            </div>
            <ExternalLink class="w-5 h-5 text-muted-foreground shrink-0" />
          </a>
          <div
            v-else
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <component :is="guide.icon" class="w-6 h-6 text-primary" />
              </div>
              <div>
                <p class="text-caps text-sm mb-0.5">{{ guide.title }}</p>
                <p class="text-muted-foreground text-xs">{{ guide.subtitle }}</p>
              </div>
            </div>
            <ExternalLink class="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        </GlassCard>
      </div>

      <div v-if="videoLink" class="mt-8">
        <h2 class="text-caps text-sm text-muted-foreground mb-4">ВИДЕО-ИНСТРУКЦИИ</h2>

        <GlassCard :delay="0.5">
          <div
            class="aspect-video rounded-2xl overflow-hidden bg-black/40 mb-4"
          >
            <iframe
              v-if="videoEmbedUrl"
              :src="videoEmbedUrl"
              class="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              title="Видео-инструкция"
            />
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground"
            >
              <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Film class="w-8 h-8 text-primary" />
              </div>
              <p class="text-xs text-center px-4">
                <template v-if="isSuperAdmin">
                  Добавьте ссылку на YouTube или Vimeo в разделе
                  <router-link to="/admin/instructions" class="text-primary hover:underline">
                    «Редактировать ссылки»
                  </router-link>
                </template>
                <template v-else>
                  Видео будет добавлено позже
                </template>
              </p>
            </div>
          </div>
          <p class="text-caps text-sm">{{ videoLink.title }}</p>
          <p class="text-muted-foreground text-xs">{{ videoLink.subtitle }}</p>
        </GlassCard>
      </div>
    </PageMain>
  </PageLayout>
</template>
