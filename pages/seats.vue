<template>
    <div v-if="booking && flight && service" class="airline-page">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">MAKE YOURSELF COMFORTABLE</p>
            <h1>{{ t('onair.seats') }}</h1>
            <p>{{ t('onair.seatsDesc') }}</p>
        </header>
        <div class="airline__columns">
            <div class="airline__stack">
                <OnairServiceSelector v-model:flight-id="flightId" v-model:passenger-id="passengerId" />
                <div class="airline__toolbar airline__panel">
                    <strong>{{ flight.aircraft }} · {{ passenger.lastName }} {{ passenger.firstName }}</strong>
                    <span>
                        {{ t('onair.seat') }}
                        <b>{{ service.seat || t('onair.notSelected') }}</b>
                    </span>
                </div>
                <p v-if="service.checkedIn" class="airline__notice" role="status">{{ t('onair.locked') }}</p>
                <div class="airline-seat-legend">
                    <span>
                        <i />
                        {{ t('onair.available') }}
                    </span>
                    <span>
                        <i class="is-selected">✓</i>
                        {{ t('onair.selected') }}
                    </span>
                    <span>
                        <i class="is-occupied">×</i>
                        {{ t('onair.occupied') }}
                    </span>
                    <span>
                        <i class="is-exit">—</i>
                        {{ t('onair.exit') }}
                    </span>
                </div>
                <p class="airline__muted">{{ t('onair.seatHint') }} {{ t('onair.seatScroll') }}</p>
                <div class="airline-seat-map" tabindex="0" role="region" :aria-label="t('onair.seats')">
                    <div class="airline-seat-map__aircraft" :class="{ 'airline-seat-map__aircraft--wide': flight.aircraft === 'B787-9' }">
                        <div class="airline-seat-map__nose">
                            <span>↑ {{ t('onair.front') }}</span>
                            <strong>{{ flight.aircraft }}</strong>
                        </div>
                        <div class="airline-seat-map__row airline-seat-map__letters" :style="{ gridTemplateColumns: gridColumns }">
                            <span class="airline-seat-map__number" />
                            <span v-for="letter in letters" :key="letter" :class="{ 'airline-seat-map__aisle': aisleAfter(letter) }">{{
                                letter
                            }}</span>
                        </div>
                        <div v-for="row in rows" :key="row" class="airline-seat-map__row" :style="{ gridTemplateColumns: gridColumns }">
                            <span class="airline-seat-map__number">{{ row }}</span>
                            <button
                                v-for="letter in letters"
                                :key="letter"
                                class="airline-seat"
                                :class="[
                                    {
                                        'airline-seat-map__aisle': aisleAfter(letter),
                                        'is-selected': service.seat === `${row}${letter}`,
                                        'is-occupied': blocked(`${row}${letter}`) === 'occupied',
                                        'is-exit': blocked(`${row}${letter}`) === 'exit',
                                    },
                                ]"
                                type="button"
                                :disabled="service.checkedIn || !!blocked(`${row}${letter}`)"
                                :aria-label="`${row}${letter} · ${service.seat === `${row}${letter}` ? t('onair.selected') : t(`onair.${blocked(`${row}${letter}`) || 'available'}`)}`"
                                :aria-pressed="service.seat === `${row}${letter}`"
                                @click="choose(`${row}${letter}`)"
                            >
                                {{
                                    blocked(`${row}${letter}`)
                                        ? blocked(`${row}${letter}`) === 'exit'
                                            ? '—'
                                            : '×'
                                        : service.seat === `${row}${letter}`
                                          ? '✓'
                                          : `${row}${letter}`
                                }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="airline__actions">
                    <AppButton to="/my-booking">{{ t('onair.myBooking') }}</AppButton>
                    <AppButton to="/meals" tone="primary" variant="fill" size="lg">{{ t('onair.meals') }} →</AppButton>
                </div>
            </div>
            <OnairSummary confirmed />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { seatLetters, seatBlocked } from '~/utils/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '좌석 지정' });
const store = useOnairStore();
const { t } = useI18nText();
const toast = useToast();
const booking = computed(() => store.booking!);
const flightId = ref(booking.value?.flights[0].id || '');
const passengerId = ref(booking.value?.passengers[0].id || '');
const flight = computed(() => booking.value?.flights.find((item) => item.id === flightId.value));
const passenger = computed(() => booking.value?.passengers.find((item) => item.id === passengerId.value)!);
const service = computed(() => booking.value?.services[flightId.value]?.[passengerId.value]);
const letters = computed(() => (flight.value ? seatLetters(flight.value) : []));
const rows = computed(() => (flight.value?.aircraft === 'A321' ? 20 : 24));
const gridColumns = computed(() =>
    flight.value?.aircraft === 'A321'
        ? '25px repeat(3, 38px) 58px repeat(2, 38px)'
        : '25px repeat(3, 38px) 58px repeat(2, 38px) 58px repeat(2, 38px)',
);
function aisleAfter(letter: string) {
    return letter === 'D' || (flight.value?.aircraft === 'B787-9' && letter === 'G');
}
function blocked(seat: string) {
    if (!flight.value) return 'unavailable';
    return (
        seatBlocked(flight.value, seat) ||
        (Object.entries(booking.value.services[flightId.value]).some(([id, item]) => id !== passengerId.value && item.seat === seat)
            ? 'occupied'
            : '')
    );
}
function choose(seat: string) {
    const error = store.assignSeat(flightId.value, passengerId.value, seat);
    if (error) toast.error(t(`onair.${error}`));
    else toast.success(t('onair.seatSaved'));
}
</script>
