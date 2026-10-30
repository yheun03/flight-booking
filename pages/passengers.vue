<template>
    <div class="airline-page airline-page--passengers">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">02 / THE TRAVELER</p>
            <h1>{{ t('onair.passengers') }}</h1>
            <p>{{ t('onair.passengerDesc') }}</p>
        </header>
        <div class="airline__columns">
            <form class="airline__stack" novalidate @submit.prevent="next">
                <div class="airline__member">
                    <div>
                        <span class="airline__eyebrow">{{ t('onair.member') }}</span>
                        <p>{{ t('onair.privacy') }}</p>
                    </div>
                    <AppButton tone="primary" variant="soft" @click="store.fillPassengers()">{{ t('onair.loadDemo') }} ↗
                    </AppButton>
                </div>
                <section v-for="(passenger, index) in store.draft.passengers" :key="passenger.id"
                    class="airline__panel airline__stack korean-passenger-card">
                    <h2>
                        {{ t('onair.passenger') }} {{ String(index + 1).padStart(2, '0') }}
                        <small>/ {{ t('onair.adults') }}</small>
                    </h2>
                    <div class="airline__form-grid">
                        <AppInput v-model="passenger.lastName" :id="`last-${passenger.id}`" :label="t('onair.lastName')"
                            placeholder="KIM" autocomplete="off" :state="error === 'nameError' ? 'error' : null"
                            :hint="error === 'nameError' ? t('onair.nameError') : ''" />
                        <AppInput v-model="passenger.firstName" :id="`first-${passenger.id}`"
                            :label="t('onair.firstName')" placeholder="MINJUN" autocomplete="off"
                            :state="error === 'nameError' ? 'error' : null"
                            :hint="error === 'nameError' ? t('onair.nameError') : ''" />
                        <AppInput v-model="passenger.birth" :id="`birth-${passenger.id}`" :label="t('onair.birth')"
                            type="date" :state="error === 'birthError' ? 'error' : null"
                            :hint="error === 'birthError' ? t('onair.birthError') : ''" />
                    </div>
                </section>
                <section class="airline__panel airline__stack korean-passenger-card korean-passenger-card--contact">
                    <h2>{{ t('onair.contact') }}</h2>
                    <div class="airline__form-grid">
                        <AppInput v-model="store.draft.contact.email" id="contact-email" :label="t('onair.email')"
                            type="email" placeholder="traveler@example.com"
                            :state="error === 'contactError' ? 'error' : null"
                            :hint="error === 'contactError' ? t('onair.contactError') : ''" />
                        <AppInput v-model="store.draft.contact.phone" id="contact-phone" :label="t('onair.phone')"
                            type="tel" placeholder="01012345678" :state="error === 'contactError' ? 'error' : null"
                            :hint="error === 'contactError' ? t('onair.contactError') : ''" />
                    </div>
                </section>
                <p v-if="error" id="passenger-error" class="airline__error" role="alert" tabindex="-1">{{
                    t(`onair.${error}`) }}</p>
                <div class="airline__actions">
                    <AppButton to="/flights">{{ t('onair.back') }}</AppButton>
                    <AppButton type="submit" variant="fill" tone="primary" size="lg">{{ t('onair.payment') }} →
                    </AppButton>
                </div>
            </form>
            <OnairSummary />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '탑승객 정보' });
const store = useOnairStore();
const { t } = useI18nText();
const error = ref('');
async function next() {
    error.value = store.passengersError;
    store.persist();
    if (error.value) {
        await nextTick();
        document.getElementById('passenger-error')?.focus();
        return;
    }
    await navigateTo('/payment');
}
</script>
