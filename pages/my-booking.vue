<template>
    <div class="airline-page">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">YOUR NEXT CHAPTER</p>
            <h1>{{ t('onair.myBooking') }}</h1>
            <p>{{ t('onair.confirmedDesc') }}</p>
        </header>
        <OnairBookingDetails v-if="store.booking" />
        <div v-else class="airline__empty">
            <span aria-hidden="true">↗</span>
            <h2>{{ t('onair.emptyBooking') }}</h2>
            <p>{{ t('onair.emptyBookingDesc') }}</p>
            <AppButton to="/" tone="primary" variant="fill">{{ t('onair.searchFlights') }}</AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
definePageMeta({ layout: 'airline' });
useHead({ title: '나의 예약' });
const store = useOnairStore();
const { t } = useI18nText();
</script>
