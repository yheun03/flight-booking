<template>
    <div class="airline-page airline-print airline-print--confirmation">
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
</template>

<script setup lang="ts">
definePageMeta({ layout: 'airline' });
useHead({ title: '예약 확인서' });
const { t } = useI18nText();
function printConfirmation() {
    window.print();
}
</script>
