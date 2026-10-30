<template>
    <div class="airline">
        <a href="#airline-main" class="airline__skip">{{ t('onair.skip') }}</a>
        <ClientOnly>
            <header class="airline__header">
                <NuxtLink to="/" class="airline__brand" aria-label="ON AIR 홈">
                    <svg viewBox="0 0 36 36" aria-hidden="true"><path d="M3 22 32 4 22 32l-5-12-14 2Z" fill="currentColor" /></svg>
                    <span>
                        ON AIR
                        <span class="airline__brand-dot">.</span>
                    </span>
                </NuxtLink>
                <nav class="airline__nav" :aria-label="t('onair.journey')">
                    <NuxtLink to="/" :class="{ 'is-current': bookingPaths.includes(routePath) }">{{ t('onair.search') }}</NuxtLink>
                    <NuxtLink to="/my-booking">{{ t('onair.myBooking') }}</NuxtLink>
                    <NuxtLink to="/check-in">{{ t('onair.checkin') }}</NuxtLink>
                </nav>
                <div class="airline__header-tools">
                    <span class="airline__demo-badge">PORTFOLIO / DEMO</span>
                    <ClientOnly><OnairDemoTools /></ClientOnly>
                </div>
            </header>
        </ClientOnly>
        <main id="airline-main" class="airline__main" tabindex="-1">
            <ClientOnly>
                <template v-if="store.ready">
                    <AppSteps v-if="step >= 0" class="airline__steps" :model-value="step" :items="steps" size="sm" />
                    <p v-if="store.storageError" class="airline__error" role="alert">{{ t('onair.restoreWarning') }}</p>
                    <slot />
                </template>
                <template #fallback>
                    <p class="airline__loading" role="status">{{ t('onair.loading') }}</p>
                </template>
            </ClientOnly>
        </main>
        <ClientOnly>
            <footer class="airline__footer">
                <NuxtLink to="/" class="airline__footer-brand">ON AIR.</NuxtLink>
                <p>{{ t('onair.footerNote') }}</p>
                <span>© {{ new Date().getFullYear() }} ON AIR</span>
            </footer>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';

const route = useRoute();
const store = useOnairStore();
const { t } = useI18nText();
const routePath = computed(() => route.path.replace(/\/+$/, '') || '/');
const bookingPaths = ['/', '/flights', '/passengers', '/payment', '/confirmation'];
const step = computed(() => bookingPaths.indexOf(routePath.value) - 1);
const steps = computed(() => ['flightSelect', 'passengers', 'payment', 'complete'].map((key) => ({ title: t(`onair.${key}`) })));
</script>
