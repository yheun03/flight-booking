<template>
    <div class="airline-page">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">03 / READY FOR TAKEOFF</p>
            <h1>{{ t('onair.payment') }}</h1>
            <p>{{ t('onair.paymentDesc') }}</p>
        </header>
        <div class="airline__columns">
            <div class="airline__stack">
                <section class="airline__panel airline__stack">
                    <AppTabs v-model="store.paymentMethod" :items="methods" variant="line" />
                    <template v-if="store.paymentMethod === 'card'">
                        <div class="airline-payment-card">
                            <span>ON AIR.</span>
                            <span class="airline-payment-card__chip" aria-hidden="true">▦</span>
                            <strong>0000 &nbsp; 0000 &nbsp; 0000 &nbsp; DEMO</strong>
                            <small>{{ t('onair.cardDemo') }} &nbsp; / &nbsp; NO CHARGE</small>
                        </div>
                        <p class="airline__muted">{{ t('onair.cardHint') }}</p>
                    </template>
                    <template v-else>
                        <div class="airline-mileage">
                            <span>{{ t('onair.balance') }}</span>
                            <strong>
                                {{ money(store.balance) }}
                                <small>M</small>
                            </strong>
                            <div>
                                <span>
                                    {{ t('onair.requiredMiles') }}
                                    <b>{{ money(store.totals.miles) }} M</b>
                                </span>
                                <span>
                                    {{ t('onair.remaining') }}
                                    <b>{{ money(store.balance - store.totals.miles) }} M</b>
                                </span>
                            </div>
                        </div>
                        <p>{{ t('onair.mileageNotice') }}</p>
                        <p v-if="store.balance < store.totals.miles" class="airline__error" role="alert">{{ t('onair.insufficient') }}</p>
                    </template>
                </section>
                <section class="airline__panel airline__stack">
                    <h2>{{ t('onair.review') }}</h2>
                    <p v-for="passenger in store.draft.passengers" :key="passenger.id">
                        {{ passenger.lastName.toUpperCase() }} {{ passenger.firstName.toUpperCase() }} · {{ passenger.birth }}
                    </p>
                    <p>{{ store.draft.contact.email }}</p>
                    <AppChoice v-model="consent" :label="t('onair.payConsent')" :disabled="store.processing" />
                </section>
                <p v-if="error" id="payment-error" class="airline__error" role="alert" tabindex="-1">{{ t(`onair.${error}`) }}</p>
                <p v-if="store.processing" role="status" class="airline__notice">{{ t('onair.paying') }}…</p>
                <div class="airline__actions">
                    <AppButton to="/passengers" :disabled="store.processing">{{ t('onair.back') }}</AppButton>
                    <AppButton variant="fill" tone="primary" size="lg" :loading="store.processing" @click="pay">
                        {{ error === 'paymentFailed' ? t('onair.retry') : t('onair.payNow') }} →
                    </AppButton>
                </div>
            </div>
            <OnairSummary />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { money } from '~/utils/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '가상 결제' });
const store = useOnairStore();
const { t } = useI18nText();
const consent = ref(false);
const error = ref('');
const methods = computed(() => [
    { id: 'card', title: t('onair.card'), disabled: store.processing },
    { id: 'miles', title: t('onair.mileagePay'), disabled: store.processing },
]);
async function pay() {
    if (store.processing) return;
    if (!consent.value) {
        error.value = 'payConsentError';
        return;
    }
    error.value = '';
    const result = await store.pay();
    if (result === 'success') {
        await navigateTo('/confirmation', { replace: true });
        return;
    }
    error.value = result;
    await nextTick();
    document.getElementById('payment-error')?.focus();
}
</script>
