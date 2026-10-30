<template>
    <div v-if="booking" class="airline-page airline-print">
        <header class="airline-page__heading no-print">
            <p class="airline__eyebrow">THE WORLD IS WAITING</p>
            <h1>{{ t('onair.boardingPass') }}</h1>
            <p>{{ t('onair.printHint') }}</p>
        </header>
        <div class="airline-print__toolbar no-print">
            <AppButton to="/my-booking">{{ t('onair.myBooking') }}</AppButton>
            <AppButton tone="primary" variant="fill" @click="printPasses">{{ t('onair.print') }} ↗</AppButton>
        </div>
        <article v-for="pass in passes" :key="`${pass.flight.id}-${pass.passenger.id}`" class="airline-boarding-pass">
            <header class="airline-boarding-pass__header">
                <strong>◉ KOREAN AIR</strong>
                <span>
                    BOARDING PASS
                    <b>DEMO</b>
                </span>
            </header>
            <div class="airline-boarding-pass__body">
                <p class="airline-boarding-pass__passenger">
                    <small>{{ t('onair.passenger') }} / PASSENGER</small>
                    <strong>{{ pass.passenger.lastName }} {{ pass.passenger.firstName }}</strong>
                </p>
                <div class="airline-boarding-pass__route">
                    <div>
                        <strong>{{ pass.flight.from }}</strong>
                        <span>{{ airport(pass.flight.from).name }}</span>
                    </div>
                    <span aria-hidden="true">↗</span>
                    <div>
                        <strong>{{ pass.flight.to }}</strong>
                        <span>{{ airport(pass.flight.to).name }}</span>
                    </div>
                </div>
                <dl class="airline-boarding-pass__details">
                    <div>
                        <dt>{{ t('onair.flight') }} / FLIGHT</dt>
                        <dd>{{ pass.flight.number }}</dd>
                    </div>
                    <div>
                        <dt>{{ t('onair.departureDate') }} / DATE</dt>
                        <dd>{{ pass.flight.date }}</dd>
                    </div>
                    <div>
                        <dt>{{ t('onair.boardingTime') }}</dt>
                        <dd>
                            {{ boardingTime(pass.flight) }}
                            <small>{{ airport(pass.flight.from).zone }}</small>
                        </dd>
                    </div>
                    <div>
                        <dt>{{ t('onair.gate') }}</dt>
                        <dd>D12</dd>
                    </div>
                    <div>
                        <dt>{{ t('onair.seat') }} / SEAT</dt>
                        <dd>{{ pass.service.seat }}</dd>
                    </div>
                    <div>
                        <dt>{{ t('onair.group') }}</dt>
                        <dd>2</dd>
                    </div>
                </dl>
                <div class="airline-boarding-pass__code">
                    <div class="airline-boarding-pass__barcode" aria-hidden="true" />
                    <code>DEMO-INVALID-{{ booking.id }}-{{ pass.flight.number }}-{{ pass.passenger.id }}</code>
                </div>
                <footer>
                    <b>{{ t('onair.boardingDemo') }}</b>
                    <span>{{ t('onair.bookingNo') }} {{ booking.id }} · {{ t('onair.economy') }}</span>
                </footer>
            </div>
        </article>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { airport } from '~/utils/onair';
import type { Flight } from '~/types/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: 'DEMO 탑승권' });
const store = useOnairStore();
const { t } = useI18nText();
const booking = computed(() => store.booking!);
const passes = computed(
    () =>
        booking.value?.flights.flatMap((flight) =>
            booking.value.passengers
                .filter((passenger) => booking.value.services[flight.id][passenger.id].checkedIn)
                .map((passenger) => ({ flight, passenger, service: booking.value.services[flight.id][passenger.id] })),
        ) || [],
);
function boardingTime(flight: Flight) {
    return new Date(flight.departureUtc + airport(flight.from).offset * 3600000 - 40 * 60000).toISOString().slice(11, 16);
}
function printPasses() {
    window.print();
}
</script>
