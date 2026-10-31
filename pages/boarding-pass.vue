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
        <div v-if="!passes.length" class="airline__empty no-print">
            <span aria-hidden="true">▥</span>
            <h2>아직 발급된 탑승권이 없습니다.</h2>
            <p>온라인 체크인을 완료하면 탑승권의 탑승 시각, 터미널, 탑승구와 좌석을 확인할 수 있습니다.</p>
            <AppButton to="/check-in" tone="primary" variant="fill">온라인 체크인</AppButton>
        </div>
        <article v-for="pass in passes" :key="`${pass.flight.id}-${pass.passenger.id}`" class="airline-boarding-pass"
            :aria-label="`${pass.passenger.lastName} ${pass.passenger.firstName} ${pass.flight.number} 탑승권`">
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
                    <div>
                        <dt>터미널 / TERMINAL</dt>
                        <dd>{{ terminal(pass.flight) }}</dd>
                    </div>
                    <div>
                        <dt>탑승 마감 / CLOSE</dt>
                        <dd>{{ boardingClose(pass.flight) }}</dd>
                    </div>
                    <div>
                        <dt>예약 등급 / CLASS</dt>
                        <dd>{{ cabinCode(pass.flight) }}</dd>
                    </div>
                </dl>
                <div class="airline-boarding-pass__code">
                    <div class="airline-boarding-pass__barcode" aria-hidden="true" />
                    <code>DEMO-INVALID-{{ booking.id }}-{{ pass.flight.number }}-{{ pass.passenger.id }}</code>
                </div>
                <footer>
                    <b>{{ t('onair.boardingDemo') }}</b>
                    <span>{{ t('onair.bookingNo') }} {{ booking.id }} · {{ cabinName(pass.flight) }}</span>
                </footer>
            </div>
        </article>
    </div>
    <div v-else class="airline-page">
        <div class="airline__empty">
            <span aria-hidden="true">▥</span>
            <h1>발급된 탑승권이 없습니다.</h1>
            <p>예약 조회 후 온라인 체크인을 완료하면 탑승권을 확인할 수 있습니다.</p>
            <AppButton to="/check-in" tone="primary" variant="fill">온라인 체크인</AppButton>
        </div>
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
function boardingClose(flight: Flight) {
    return new Date(flight.departureUtc + airport(flight.from).offset * 3600000 - 10 * 60000).toISOString().slice(11, 16);
}
function terminal(flight: Flight) {
    return ['GMP', 'CJU'].includes(flight.from) ? 'DOM' : flight.from === 'ICN' ? 'T2' : 'T1';
}
function cabinName(flight: Flight) {
    return ({ economy: '일반석', prestige: '프레스티지석', first: '일등석' })[flight.cabin];
}
function cabinCode(flight: Flight) {
    return ({ economy: 'Y', prestige: 'C', first: 'F' })[flight.cabin];
}
function printPasses() {
    window.print();
}
</script>
