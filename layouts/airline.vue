<template>
    <div class="airline">
        <a href="#airline-main" class="airline__skip">{{ t('onair.skip') }}</a>
        <ClientOnly>
            <header class="airline__header">
                <NuxtLink to="/" class="airline__brand" aria-label="KOREAN AIR 홈">
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="3" />
                        <path d="M9 20c4-8 15-8 20-2-4-2-8-1-10 3-2 4-7 5-10-1Z" fill="#de4b66" />
                        <path d="M31 20c-4 8-15 8-20 2 4 2 8 1 10-3 2-4 7-5 10 1Z" fill="currentColor" />
                    </svg>
                    <span>KOREAN AIR</span>
                </NuxtLink>
                <nav class="airline__nav" :aria-label="t('onair.journey')">
                    <NuxtLink to="/" :class="{ 'is-current': bookingPaths.includes(routePath) }">예약</NuxtLink>
                    <NuxtLink to="/my-booking">여행 준비</NuxtLink>
                    <NuxtLink to="/check-in">스카이패스</NuxtLink>
                </nav>
                <div class="airline__header-tools">
                    <span class="airline__utility">이벤트 · 대한민국 · 한국어</span>
                    <button class="airline__site-search" type="button" @click="goToSearch">
                        공항간 운항 정보 검색 <span aria-hidden="true">⌕</span>
                    </button>
                    <ClientOnly>
                        <OnairDemoTools />
                    </ClientOnly>
                </div>
            </header>
        </ClientOnly>
        <ClientOnly>
            <div v-if="routePath !== '/'" class="airline__route-strip">
                <div class="airline__routebar" role="region" aria-label="현재 항공편 검색 조건">
                    <strong>{{ store.draft.search.from }}</strong>
                    <span class="airline__routebar-swap" aria-hidden="true">⇄</span>
                    <strong>{{ store.draft.search.to }}</strong>
                    <span class="airline__routebar-divider" />
                    <span><span aria-hidden="true">▣</span> <span class="sr-only">출발일</span>{{
                        store.draft.search.departure || '가는 날' }}</span>
                    <template v-if="store.draft.search.trip === 'roundtrip'">
                        <span aria-hidden="true">→</span>
                        <span><span class="sr-only">귀국일</span>{{ store.draft.search.returning || '오는 날' }}</span>
                    </template>
                    <span class="airline__routebar-divider" />
                    <span><span aria-hidden="true">♙</span> 성인 {{ store.draft.search.adults }}명 · 일반석</span>
                    <NuxtLink to="/" class="airline__routebar-button">항공편 검색</NuxtLink>
                </div>
            </div>
        </ClientOnly>
        <main id="airline-main" class="airline__main" tabindex="-1">
            <ClientOnly>
                <template v-if="store.ready">
                    <AppSteps v-if="step >= 0" class="airline__steps" :model-value="step" :items="steps" size="sm"
                        aria-label="예약 진행 단계" />
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
                <NuxtLink to="/" class="airline__footer-brand">KOREAN AIR</NuxtLink>
                <p>{{ t('onair.footerNote') }}</p>
                <span>© {{ new Date().getFullYear() }} KOREAN AIR PRACTICE</span>
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
async function goToSearch() {
    if (routePath.value !== '/') await navigateTo('/');
    await nextTick();
    document.getElementById('departure-airport')?.focus();
}
</script>
