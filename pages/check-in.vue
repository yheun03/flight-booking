<template>
    <div v-if="booking && flight" class="airline-page">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">LESS WAITING, MORE JOURNEY</p>
            <h1>{{ t('onair.checkin') }}</h1>
            <p>{{ t('onair.checkinDesc') }}</p>
        </header>
        <div class="airline__columns">
            <div class="airline__stack">
                <OnairServiceSelector v-model:flight-id="flightId" />
                <p class="airline__notice">{{ t('onair.checkinRule') }}</p>
                <div class="airline__toolbar">
                    <strong>{{ flight.number }} · {{ flight.date }} {{ flight.departure }} ({{ airport(flight.from).zone
                        }})</strong>
                    <span class="airline__status">{{ t(`onair.${open ? 'checkinAvailable' : 'notCheckedIn'}`) }}</span>
                </div>
                <section v-for="passenger in booking.passengers" :key="passenger.id"
                    class="airline__panel airline-checkin-passenger">
                    <AppChoice :model-value="chosen.includes(passenger.id)"
                        :label="`${passenger.lastName} ${passenger.firstName}`"
                        :disabled="services[passenger.id].checkedIn || !open"
                        @update:model-value="toggle(passenger.id, Boolean($event))" />
                    <p>
                        {{ passenger.birth }} · {{ t('onair.seat') }}
                        <strong>{{ services[passenger.id].seat || t('onair.notSelected') }}</strong>
                        ·
                        {{ mealOffered(flight) ? t(`onair.${services[passenger.id].meal || 'regular'}`) :
                            t('onair.notOffered') }}
                    </p>
                    <span v-if="services[passenger.id].checkedIn" class="airline__status">✓ {{ t('onair.checkedIn')
                        }}</span>
                    <NuxtLink v-else-if="!services[passenger.id].seat" to="/seats" class="airline__text-link">{{
                        t('onair.seats') }} →</NuxtLink>
                </section>
                <section class="airline__panel airline__stack">
                    <h2>{{ t('onair.notice') }}</h2>
                    <p>{{ t('onair.hazardNotice') }}</p>
                    <AppChoice v-model="consent" :label="t('onair.checkinConsent')" />
                </section>
                <p v-if="!open" class="airline__notice">{{ t('onair.checkinClosed') }}</p>
                <p v-if="error" id="checkin-error" class="airline__error" role="alert" tabindex="-1">{{
                    t(`onair.${error}`) }}</p>
                <div class="airline__actions">
                    <AppButton to="/my-booking">{{ t('onair.myBooking') }}</AppButton>
                    <AppButton v-if="allChecked" to="/boarding-pass" tone="primary" variant="fill" size="lg">{{
                        t('onair.boardingPass') }} →</AppButton>
                    <AppButton v-else :disabled="!open" tone="primary" variant="fill" size="lg" @click="checkin">{{
                        t('onair.checkinNow') }} →</AppButton>
                </div>
            </div>
            <OnairSummary confirmed />
        </div>
    </div>
    <div v-else class="airline-page">
        <div class="airline__empty">
            <span aria-hidden="true">✓</span>
            <h1>체크인할 예약이 없습니다.</h1>
            <p>예약을 완료한 뒤 체크인 가능 시간에 다시 이용해 주세요.</p>
            <AppButton to="/" tone="primary" variant="fill">항공편 검색</AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { airport, checkinWindow, mealOffered } from '~/utils/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '온라인 체크인' });
const store = useOnairStore();
const { t } = useI18nText();
const toast = useToast();
const booking = computed(() => store.booking!);
const flightId = ref(booking.value?.flights[0].id || '');
const flight = computed(() => booking.value?.flights.find((item) => item.id === flightId.value));
const services = computed(() => booking.value?.services[flightId.value] || {});
const open = computed(() => (flight.value ? checkinWindow(flight.value, store.demo.checkin) : false));
const chosen = ref<string[]>([]);
const consent = ref(false);
const error = ref('');
const allChecked = computed(() => Object.values(services.value).every((item) => item.checkedIn));
watch(flightId, () => {
    chosen.value = [];
    consent.value = false;
    error.value = '';
});
function toggle(id: string, checked: boolean) {
    chosen.value = checked ? [...chosen.value, id] : chosen.value.filter((item) => item !== id);
}
async function checkin() {
    error.value = store.checkin(flightId.value, chosen.value, consent.value);
    if (error.value) {
        await nextTick();
        document.getElementById('checkin-error')?.focus();
        return;
    }
    chosen.value = [];
    toast.success(t('onair.checkinSuccess'));
    await navigateTo('/boarding-pass');
}
</script>
