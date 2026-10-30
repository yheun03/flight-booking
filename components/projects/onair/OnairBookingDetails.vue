<template>
    <div v-if="store.booking" class="airline__columns">
        <div class="airline__stack">
            <div class="airline-booking-ref">
                <div>
                    <span>{{ t('onair.bookingNo') }}</span>
                    <strong>{{ store.booking.id }}</strong>
                </div>
                <span class="airline__status">✓ {{ t('onair.reserved') }}</span>
            </div>
            <section v-for="flight in store.booking.flights" :key="flight.id" class="airline__panel airline__stack">
                <div class="airline__toolbar">
                    <h2>
                        {{ t(`onair.${flight.segment}`) }}
                        <small>{{ flight.number }}</small>
                    </h2>
                    <span class="airline__muted">{{ flight.aircraft }} · {{ t(`onair.${flight.fare}`) }}</span>
                </div>
                <div class="airline-booking-route">
                    <div>
                        <strong>{{ flight.from }}</strong>
                        <span>{{ airport(flight.from).name }}</span>
                        <b>{{ flight.date }} · {{ flight.departure }}</b>
                        <small>{{ airport(flight.from).zone }}</small>
                    </div>
                    <span aria-hidden="true">→</span>
                    <div>
                        <strong>{{ flight.to }}</strong>
                        <span>{{ airport(flight.to).name }}</span>
                        <b>{{ flight.arrivalDate }} · {{ flight.arrival }}</b>
                        <small>{{ airport(flight.to).zone }}</small>
                    </div>
                </div>
                <ul class="airline-booking-status">
                    <li v-for="passenger in store.booking.passengers" :key="passenger.id">
                        <strong>{{ passenger.lastName }} {{ passenger.firstName }}</strong>
                        <div>
                            <span>
                                {{ t('onair.seat') }}
                                <b>{{ store.booking.services[flight.id][passenger.id].seat || t('onair.notSelected') }}</b>
                            </span>
                            <span>
                                {{ t('onair.meals') }}
                                <b>
                                    {{
                                        mealOffered(flight)
                                            ? t(`onair.${store.booking.services[flight.id][passenger.id].meal || 'regular'}`)
                                            : t('onair.notOffered')
                                    }}
                                </b>
                            </span>
                            <span :class="{ airline__status: store.booking.services[flight.id][passenger.id].checkedIn }">
                                {{ t(`onair.${store.booking.services[flight.id][passenger.id].checkedIn ? 'checkedIn' : 'notCheckedIn'}`) }}
                            </span>
                        </div>
                    </li>
                </ul>
            </section>
            <section v-if="!print" class="airline__panel airline__stack no-print">
                <h2>{{ t('onair.services') }}</h2>
                <div class="airline-booking-services">
                    <NuxtLink v-for="(service, index) in services" :key="service.path" :to="service.path">
                        <span>0{{ index + 1 }}</span>
                        <strong>{{ t(`onair.${service.key}`) }}</strong>
                        <span aria-hidden="true">↗</span>
                    </NuxtLink>
                </div>
            </section>
            <div v-if="!print" class="airline__actions no-print">
                <AppButton to="/itinerary">{{ t('onair.itinerary') }} ↗</AppButton>
                <AppButton to="/boarding-pass" variant="fill" tone="primary">{{ t('onair.boardingPass') }} →</AppButton>
            </div>
            <p v-if="print" class="airline__notice">{{ t('onair.confirmationDemo') }}</p>
        </div>
        <OnairSummary confirmed />
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { airport, mealOffered } from '~/utils/onair';

defineProps<{ print?: boolean }>();
const store = useOnairStore();
const { t } = useI18nText();
const services = [
    { path: '/seats', key: 'seats' },
    { path: '/meals', key: 'meals' },
    { path: '/check-in', key: 'checkin' },
];
</script>
