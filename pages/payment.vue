<template>
    <div class="airline-page airline-page--payment">
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
                        <div class="korean-payment-accordion">
                            <button type="button">캐시 앤 마일즈 <span>⌄</span></button>
                            <button type="button">쿠폰 <span>⌄</span></button>
                            <button type="button">전자우대할인권 <span>⌄</span></button>
                            <button type="button">기프트카드 <span>⌄</span></button>
                        </div>
                        <div class="korean-payment-methods">
                            <h2>결제 수단</h2>
                            <div>
                                <label v-for="gateway in gateways" :key="gateway.id"
                                    :class="{ 'is-selected': paymentGateway === gateway.id }">
                                    <input v-model="paymentGateway" type="radio" name="payment-gateway"
                                        :value="gateway.id" />
                                    <strong>{{ gateway.label }}</strong>
                                </label>
                            </div>
                            <AppChoice v-model="savePayment" label="자주 쓰는 결제수단으로 저장" />
                        </div>
                        <div class="korean-payment-notice">
                            <strong>유의사항</strong>
                            <p>구매 후 항공권의 결제수단은 변경할 수 없습니다.</p>
                            <p>본 화면은 실제 결제가 발생하지 않는 포트폴리오용 가상 결제 화면입니다.</p>
                        </div>
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
                        <p v-if="store.balance < store.totals.miles" class="airline__error" role="alert">{{
                            t('onair.insufficient') }}</p>
                    </template>
                </section>
                <section class="airline__panel airline__stack">
                    <h2>{{ t('onair.review') }}</h2>
                    <p v-for="passenger in store.draft.passengers" :key="passenger.id">
                        {{ passenger.lastName.toUpperCase() }} {{ passenger.firstName.toUpperCase() }} · {{
                            passenger.birth }}
                    </p>
                    <p>{{ store.draft.contact.email }}</p>
                    <AppChoice v-model="consent" :label="t('onair.payConsent')" :disabled="store.processing" />
                </section>
                <p v-if="error" id="payment-error" class="airline__error" role="alert" tabindex="-1">{{
                    t(`onair.${error}`) }}</p>
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
const savePayment = ref(false);
const paymentGateway = ref('card');
const error = ref('');
const gateways = [
    { id: 'card', label: '한국발행 신용 / 체크카드' },
    { id: 'kakaopay', label: 'Kakao Pay' },
    { id: 'samsung', label: 'SAMSUNG Pay' },
    { id: 'payco', label: 'PAYCO' },
    { id: 'apple', label: 'Apple Pay' },
    { id: 'toss', label: 'toss pay' },
    { id: 'transfer', label: '실시간 계좌이체' },
    { id: 'mobile', label: '휴대폰 결제' },
];
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
