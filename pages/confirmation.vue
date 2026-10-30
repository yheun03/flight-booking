<template>
    <div class="airline-page">
        <header class="airline-page__heading airline-page__heading--center">
            <span class="airline__success-icon" aria-hidden="true">✓</span>
            <p class="airline__eyebrow">YOU'RE GOING PLACES</p>
            <h1>{{ t('onair.confirmedTitle') }}</h1>
            <p>{{ t('onair.confirmedDesc') }}</p>
        </header>
        <OnairBookingDetails />
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'airline' });
useHead({ title: '예약 완료' });
const { t } = useI18nText();
</script>
