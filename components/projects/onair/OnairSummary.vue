<template>
    <aside class="airline-summary" :aria-label="t('onair.summary')">
        <div class="airline-summary__heading">
            <h2>{{ t('onair.summary') }}</h2>
            <span aria-hidden="true">↗</span>
        </div>
        <p class="airline-summary__travelers">{{ t('onair.adults') }} {{ count }} · {{ t('onair.economy') }}</p>
        <div v-for="flight in flights" :key="flight.id" class="airline-summary__flight">
            <span class="airline__eyebrow">{{ t(`onair.${flight.segment}`) }} · {{ flight.number }}</span>
            <strong>
                {{ flight.from }}
                <span aria-hidden="true">→</span>
                {{ flight.to }}
            </strong>
            <p>{{ flight.date }} · {{ flight.departure }}</p>
            <p>{{ t(`onair.${flight.fare}`) }} · {{ flight.aircraft }}</p>
        </div>
        <p v-if="!flights.length" class="airline__muted">{{ t('onair.noFlight') }}</p>
        <dl class="airline-summary__prices">
            <template v-if="method === 'miles'">
                <dt>{{ t('onair.requiredMiles') }}</dt>
                <dd>{{ money(totals.miles) }} M</dd>
            </template>
            <template v-else>
                <dt>{{ t('onair.fare') }}</dt>
                <dd>{{ money(totals.fare) }} {{ locale === 'ko' ? '원' : 'KRW' }}</dd>
            </template>
            <dt>{{ t('onair.tax') }}</dt>
            <dd>{{ money(totals.tax) }} {{ locale === 'ko' ? '원' : 'KRW' }}</dd>
        </dl>
        <div class="airline-summary__total">
            <span>{{ t('onair.total') }}</span>
            <strong>
                {{ money(totals.tax + (method === 'card' ? totals.fare : 0)) }}
                <small>KRW</small>
            </strong>
        </div>
        <p class="airline-summary__note">{{ t('onair.demoIntro') }}</p>
    </aside>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { money } from '~/utils/onair';

const props = defineProps<{ confirmed?: boolean }>();
const store = useOnairStore();
const { t, locale } = useI18nText();
const flights = computed(() => (props.confirmed ? store.booking?.flights || [] : store.draft.flights));
const count = computed(() => (props.confirmed ? store.booking?.passengers.length || 0 : store.draft.search.adults));
const method = computed(() => (props.confirmed ? store.booking?.method || 'card' : store.paymentMethod));
const totals = computed(() =>
    props.confirmed && store.booking ? { fare: store.booking.fare, tax: store.booking.tax, miles: store.booking.miles } : store.totals,
);
</script>
