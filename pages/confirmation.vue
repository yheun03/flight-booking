<template>
    <div v-if="booking" class="airline-page">
        <header class="airline-page__heading airline-page__heading--center">
            <span class="airline__success-icon" aria-hidden="true">✓</span>
            <p class="airline__eyebrow">YOU'RE GOING PLACES</p>
            <h1>{{ t('onair.confirmedTitle') }}</h1>
            <p>{{ t('onair.confirmedDesc') }}</p>
        </header>
        <section class="airline-confirmation-next" aria-labelledby="confirmation-next-title">
            <div>
                <p class="airline__eyebrow">NEXT STEP</p>
                <h2 id="confirmation-next-title">출발 전 준비를 이어서 진행하세요</h2>
            </div>
            <ol>
                <li><span aria-hidden="true">1</span><strong>예약 확인서</strong>
                    <NuxtLink to="/itinerary">확인·인쇄 →</NuxtLink>
                </li>
                <li><span aria-hidden="true">2</span><strong>좌석 선택</strong>
                    <NuxtLink to="/seats">좌석 선택 →</NuxtLink>
                </li>
                <li><span aria-hidden="true">3</span><strong>기내식 사전 주문</strong>
                    <NuxtLink to="/meals">메뉴 선택 →</NuxtLink>
                </li>
            </ol>
        </section>
        <OnairBookingDetails />
    </div>
    <div v-else class="airline-page">
        <div class="airline__empty">
            <span aria-hidden="true">↗</span>
            <h1>완료된 예약이 없습니다.</h1>
            <p>항공권 결제를 완료하면 예약번호와 다음 준비 단계를 확인할 수 있습니다.</p>
            <AppButton to="/" tone="primary" variant="fill">항공편 검색</AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '예약 완료' });
const { t } = useI18nText();
const store = useOnairStore();
const booking = computed(() => store.booking);
</script>
