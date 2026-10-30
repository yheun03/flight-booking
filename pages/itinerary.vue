<template>
    <div v-if="booking" class="airline-page airline-print airline-print--confirmation">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">KOREAN AIR / BOOKING CONFIRMATION</p>
            <h1>{{ t('onair.itinerary') }}</h1>
            <p>{{ t('onair.confirmationDemo') }}</p>
        </header>
        <div class="airline-print__toolbar no-print">
            <AppButton to="/my-booking">{{ t('onair.myBooking') }}</AppButton>
            <AppButton tone="primary" variant="fill" @click="printConfirmation">{{ t('onair.print') }} ↗</AppButton>
        </div>
        <OnairBookingDetails print />
    </div>
    <div v-else class="airline-page">
        <div class="airline__empty">
            <span aria-hidden="true">▤</span>
            <h1>발급된 예약 확인서가 없습니다.</h1>
            <p>항공권 결제를 완료하면 전자항공권과 결제 정보를 확인할 수 있습니다.</p>
            <AppButton to="/" tone="primary" variant="fill">항공편 검색</AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '예약 확인서' });
const { t } = useI18nText();
const store = useOnairStore();
const booking = computed(() => store.booking);
function printConfirmation() {
    window.print();
}
</script>
