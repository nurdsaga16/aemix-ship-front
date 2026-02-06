<script setup>
import { Globe, Mail, MapPin } from 'lucide-vue-next'
import GlassCard from '@/components/GlassCard.vue'
import Logo from '@/components/Logo.vue'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
</script>

<template>
  <PageLayout>
    <PageHeader title="О КОМПАНИИ" />

    <PageMain>
      <GlassCard class="mb-6 text-center" :delay="0.1">
        <div class="flex justify-center mb-4">
          <Logo size="large" />
        </div>
        <h2 class="text-caps text-2xl tracking-widest mb-2">AEMIX</h2>
        <p class="text-accent-italic text-sm">Galaxy Delivery</p>
      </GlassCard>

      <GlassCard :delay="0.2">
        <p class="text-muted-foreground text-sm leading-relaxed mb-4">
          AEMIX Galaxy — ваш надёжный партнёр в доставке товаров из Китая. 
          Мы соединяем миры, доставляя посылки быстро и безопасно.
        </p>
        <p class="text-sm leading-relaxed">
          Работаем с <span class="text-accent-italic">Pinduoduo</span>, <span class="text-accent-italic">Taobao</span>, <span class="text-accent-italic">1688</span> и другими площадками.
        </p>
      </GlassCard>

      <div class="mt-8">
        <h2 class="text-caps text-xs text-muted-foreground mb-3">КОНТАКТЫ</h2>
        
        <div class="space-y-3">
          <GlassCard :delay="0.3">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe class="w-5 h-5 text-primary" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Сайт</p>
                <p class="text-sm">aemix-galaxy.com</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard :delay="0.4">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail class="w-5 h-5 text-primary" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Email</p>
                <p class="text-sm">support@aemix.com</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard :delay="0.5">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin class="w-5 h-5 text-primary" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Офис</p>
                <p class="text-sm">Москва, Россия</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <p class="text-center text-muted-foreground text-xs mt-8">
        Версия 1.0.0 • © 2026 AEMIX Galaxy
      </p>
    </PageMain>
  </PageLayout>
</template>
