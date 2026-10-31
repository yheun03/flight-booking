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
                    <span class="airline__muted">{{ flight.aircraft }} · {{ cabinName(flight.cabin) }} · {{
                        t(`onair.${flight.fare}`) }}</span>
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
                                <b>{{ store.booking.services[flight.id][passenger.id].seat || t('onair.notSelected')
                                }}</b>
                            </span>
                            <span>
                                {{ t('onair.meals') }}
                                <b>
                                    {{
                                        mealOffered(flight)
                                            ? mealName(store.booking.services[flight.id][passenger.id].meal || 'regular')
                                            : t('onair.notOffered')
                                    }}
                                </b>
                            </span>
                            <span
                                :class="{ airline__status: store.booking.services[flight.id][passenger.id].checkedIn }">
                                {{ t(`onair.${store.booking.services[flight.id][passenger.id].checkedIn ? 'checkedIn' :
                                    'notCheckedIn'}`) }}
                            </span>
                        </div>
                    </li>
                </ul>
            </section>
            <section class="airline__panel airline__stack airline-ticket-data" aria-labelledby="ticket-data-title">
                <div class="airline__toolbar">
                    <h2 id="ticket-data-title">전자항공권 및 결제 정보</h2>
                    <span class="airline__status">발권 완료</span>
                </div>
                <dl>
                    <div v-for="(passenger, index) in store.booking.passengers" :key="passenger.id">
                        <dt>탑승객 · 전자항공권 번호</dt>
                        <dd>{{ passenger.lastName }} {{ passenger.firstName }} <strong>{{ ticketNumber(index)
                        }}</strong></dd>
                    </div>
                    <div>
                        <dt>발권일</dt>
                        <dd>{{ store.booking.createdAt.slice(0, 10) }}</dd>
                    </div>
                    <div>
                        <dt>결제 수단</dt>
                        <dd>{{ store.booking.method === 'card' ? '카드·간편결제' : '마일리지' }}</dd>
                    </div>
                    <div>
                        <dt>결제 금액</dt>
                        <dd><strong>{{ money(store.booking.fare + store.booking.tax) }} KRW</strong></dd>
                    </div>
                    <div>
                        <dt>결제 승인 참조</dt>
                        <dd>{{ store.booking.transactionId.slice(0, 13).toUpperCase() }}</dd>
                    </div>
                    <div>
                        <dt>무료 위탁 수하물</dt>
                        <dd>탑승객 1인당 {{ checkedBaggage(store.booking.flights[0].cabin) }}</dd>
                    </div>
                    <div>
                        <dt>예약 연락처</dt>
                        <dd>{{ store.booking.contact.email }} · {{ store.booking.contact.phone }}</dd>
                    </div>
                    <div>
                        <dt>운임 조건</dt>
                        <dd>변경·환불 시 선택 운임의 규정과 수수료가 적용됩니다.</dd>
                    </div>
                </dl>
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
import { airport, mealOffered, money } from '~/utils/onair';
import type { CabinClass, MealId } from '~/types/onair';

defineProps<{ print?: boolean }>();
const store = useOnairStore();
const { t } = useI18nText();
const services = [
    { path: '/seats', key: 'seats' },
    { path: '/meals', key: 'meals' },
    { path: '/check-in', key: 'checkin' },
];
const cabinName = (cabin: CabinClass) => ({ economy: '일반석', prestige: '프레스티지석', first: '일등석' })[cabin];
const checkedBaggage = (cabin: CabinClass) => cabin === 'first' ? '3개 · 각 32kg 이내' : cabin === 'prestige' ? '2개 · 각 32kg 이내' : '1개 · 20kg 이내';
const mealName = (meal: MealId) => ({
    regular: '소고기 버섯 리조또',
    vegetarian: '구운 채소와 허브 파스타',
    fruit: '신선한 과일 플레이트',
    bibimbap: '더덕 비빔밥과 바싹불고기',
    galbi: '우엉떡갈비와 은갈치조림',
    steak: '필레 미뇽 스테이크',
    lobster: '바닷가재구이',
    ginsengSoup: '가오리찜과 우거지갈비탕',
    vegan: '두부떡갈비와 채개장',
})[meal];
function ticketNumber(index: number) {
    const seed = [...store.booking!.id].reduce((total, char) => total + char.charCodeAt(0), 0) * 100 + index;
    return `180-${String(seed).padStart(10, '0')}`;
}
</script>
