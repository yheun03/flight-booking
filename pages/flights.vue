<template>
    <div class="airline-page">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">01 / YOUR FLIGHT</p>
            <h1>{{ t('onair.flightSelect') }}</h1>
            <p>{{ t('onair.flightDesc') }}</p>
        </header>
        <div class="airline__columns">
            <div class="airline__stack">
                <div class="airline__toolbar">
                    <strong>
                        {{ airport(store.draft.search.from).city }}
                        <span aria-hidden="true">→</span>
                        {{ airport(store.draft.search.to).city }}
                    </strong>
                    <NuxtLink to="/" class="airline__text-link">{{ t('onair.changeSearch') }}</NuxtLink>
                </div>
                <AppTabs v-model="segment" :items="segmentItems" variant="line" />
                <div class="airline__flight-toolbar">
                    <p>{{ currentDate }} · {{ t('onair.direct') }} · {{ t('onair.economy') }}</p>
                    <AppSelect v-model="sort" :label="t('onair.sort')" :items="sortOptions" :width="175" required size="sm" />
                </div>
                <article
                    v-for="entry in sortedFlights"
                    :key="entry.flight.id"
                    class="airline-flight"
                    :class="{ 'is-selected': selected?.id === entry.flight.id }"
                >
                    <header class="airline-flight__header">
                        <span class="airline-flight__airline">
                            <b>↗</b>
                            ON AIR
                            <small>{{ entry.flight.number }} · {{ entry.flight.aircraft }}</small>
                        </span>
                        <span v-if="selected?.id === entry.flight.id" class="airline__status">✓ {{ t('onair.selected') }}</span>
                    </header>
                    <div class="airline-flight__schedule">
                        <div>
                            <strong>{{ entry.flight.departure }}</strong>
                            <span>{{ entry.flight.from }} · {{ airport(entry.flight.from).zone }}</span>
                        </div>
                        <div class="airline-flight__duration">
                            <span>
                                {{ Math.floor(entry.flight.duration / 60) }}{{ t('onair.hours') }} {{ entry.flight.duration % 60
                                }}{{ t('onair.minutes') }}
                            </span>
                            <i aria-hidden="true">→</i>
                            <span>{{ t('onair.direct') }}</span>
                        </div>
                        <div>
                            <strong>{{ entry.flight.arrival }}</strong>
                            <span>{{ entry.flight.to }} · {{ airport(entry.flight.to).zone }}</span>
                            <small v-if="entry.flight.arrivalDate !== entry.flight.date"
                                >{{ t('onair.nextDay') }} {{ entry.flight.arrivalDate }}</small
                            >
                        </div>
                        <div class="airline-flight__price">
                            <span>{{ t('onair.perAdult') }}</span>
                            <strong>
                                {{ money(selected?.id === entry.flight.id ? selected.price + selected.tax : entry.flight.price + entry.flight.tax) }}
                                <small>KRW</small>
                            </strong>
                        </div>
                    </div>
                    <p class="airline__muted">
                        {{ t('onair.earnMiles') }} {{ money(entry.flight.earnedMiles) }} M · {{ t('onair.requiredMiles') }}
                        {{ money(selected?.id === entry.flight.id ? selected.miles : entry.flight.miles) }} M{{
                            selected?.id === entry.flight.id ? '' : '~'
                        }}
                    </p>
                    <div class="airline-flight__fares">
                        <AppButton
                            v-for="fare in fares"
                            :key="fare.id"
                            :active="selected?.id === entry.flight.id && selected?.fare === fare.id"
                            :variant="selected?.id === entry.flight.id && selected?.fare === fare.id ? 'fill' : 'outline'"
                            :tone="selected?.id === entry.flight.id && selected?.fare === fare.id ? 'primary' : 'gray'"
                            @click="store.selectFlight(segment, entry.index, fare.id)"
                        >
                            {{ t(`onair.${fare.id}`) }} · {{ money(entry.flight.price + entry.flight.tax + fare.extra) }} KRW
                            <span v-if="selected?.id === entry.flight.id && selected?.fare === fare.id">✓</span>
                        </AppButton>
                    </div>
                </article>
                <section class="airline__panel airline__stack">
                    <h2>{{ t('onair.fareConditions') }}</h2>
                    <p v-for="fare in fares" :key="fare.id">
                        <strong>{{ t(`onair.${fare.id}`) }}</strong>
                        · {{ t(`onair.${fare.id}Rule`) }}
                    </p>
                    <p class="airline__muted">{{ t('onair.fareNotice') }}</p>
                    <p class="airline__muted">{{ t('onair.fictionalTime') }}</p>
                </section>
                <p v-if="error" class="airline__error" role="alert">{{ t(`onair.${error}`) }}</p>
                <div class="airline__actions">
                    <AppButton to="/">{{ t('onair.back') }}</AppButton>
                    <AppButton variant="fill" tone="primary" size="lg" @click="next">
                        {{
                            segment === 'outbound' &&
                            store.draft.search.trip === 'roundtrip' &&
                            !store.draft.flights.some((f) => f.segment === 'inbound')
                                ? t('onair.inbound')
                                : t('onair.passengers')
                        }}
                        →
                    </AppButton>
                </div>
            </div>
            <OnairSummary />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { flightsFor, airport, money } from '~/utils/onair';
import type { FareId, SegmentId } from '~/types/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '항공편 선택' });
const store = useOnairStore();
const { t } = useI18nText();
const segment = ref<SegmentId>('outbound');
const sort = ref('price');
const error = ref('');
watch(
    () => store.draft.flights,
    () => {
        error.value = '';
    },
);
const fares: { id: FareId; extra: number }[] = [
    { id: 'light', extra: 0 },
    { id: 'standard', extra: 35000 },
    { id: 'flex', extra: 85000 },
];
const sortOptions = computed(() => [
    { value: 'price', label: t('onair.priceSort') },
    { value: 'time', label: t('onair.timeSort') },
]);
const segmentItems = computed(() =>
    store.requiredSegments.map((id) => ({
        id,
        title: t(`onair.${id}`),
        badge: store.draft.flights.some((flight) => flight.segment === id) ? '✓' : undefined,
    })),
);
const currentDate = computed(() => (segment.value === 'outbound' ? store.draft.search.departure : store.draft.search.returning));
const sortedFlights = computed(() =>
    flightsFor(store.draft.search, segment.value)
        .map((flight, index) => ({ flight, index }))
        .sort((a, b) => (sort.value === 'price' ? a.flight.price - b.flight.price : a.flight.departure.localeCompare(b.flight.departure))),
);
const selected = computed(() => store.draft.flights.find((flight) => flight.segment === segment.value));
function next() {
    if (!selected.value) {
        error.value = 'selectAllFlights';
        return;
    }
    if (segment.value === 'outbound' && store.draft.search.trip === 'roundtrip' && !store.flightsComplete) {
        segment.value = 'inbound';
        error.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    if (store.itineraryError) {
        error.value = store.itineraryError;
        return;
    }
    if (!store.flightsComplete) {
        error.value = 'selectAllFlights';
        return;
    }
    navigateTo('/passengers');
}
</script>
