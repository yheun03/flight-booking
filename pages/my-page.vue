<template>
    <div class="airline-page airline-mypage">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">MY KOREAN AIR</p>
            <h1>마이페이지</h1>
            <p>예약 현황과 출발 전 준비 상태를 한 곳에서 확인하고 필요한 서비스를 이어서 이용하세요.</p>
        </header>

        <template v-if="booking">
            <section class="airline-mypage__hero">
                <div>
                    <p>안녕하세요,</p>
                    <h2>{{ leadPassenger }} 고객님</h2>
                    <span>다음 여행까지 필요한 준비를 확인해 주세요.</span>
                </div>
                <div>
                    <span>예약번호</span>
                    <strong>{{ booking.id }}</strong>
                    <NuxtLink to="/my-booking">예약 상세 →</NuxtLink>
                </div>
            </section>

            <section class="airline__panel airline__stack" aria-labelledby="readiness-title">
                <div class="airline__toolbar">
                    <h2 id="readiness-title">여행 준비 현황</h2>
                    <span class="airline__status">{{ completedCount }}/3 완료</span>
                </div>
                <ol class="airline-readiness">
                    <li v-for="item in readiness" :key="item.label" :class="{ 'is-complete': item.complete }">
                        <span aria-hidden="true">{{ item.complete ? '✓' : item.index }}</span>
                        <div><strong>{{ item.label }}</strong><small>{{ item.description }}</small></div>
                        <NuxtLink :to="item.path">{{ item.complete ? '확인' : '진행' }}<span class="sr-only">: {{ item.label
                                }}</span></NuxtLink>
                    </li>
                </ol>
            </section>

            <section class="airline-mypage__services" aria-labelledby="my-service-title">
                <div class="airline__section-heading">
                    <h2 id="my-service-title">나의 여행 서비스</h2>
                </div>
                <div>
                    <NuxtLink v-for="service in services" :key="service.path" :to="service.path">
                        <span aria-hidden="true">{{ service.icon }}</span><strong>{{ service.label }}</strong><small>{{
                            service.description }}</small>
                    </NuxtLink>
                </div>
            </section>

            <section class="airline__panel airline-mypage__account">
                <div><span>예약 연락처</span><strong>{{ booking.contact.email }}</strong><small>{{ booking.contact.phone
                        }}</small></div>
                <AppButton to="/itinerary">전자항공권 확인서</AppButton>
            </section>
        </template>
        <div v-else class="airline__empty">
            <span aria-hidden="true">↗</span>
            <h2>조회할 예약이 없습니다.</h2>
            <p>항공권을 예약하면 일정, 좌석, 체크인과 탑승권을 이곳에서 관리할 수 있습니다.</p>
            <AppButton to="/" tone="primary" variant="fill">항공편 검색</AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { mealOffered } from '~/utils/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '마이페이지' });
const store = useOnairStore();
const booking = computed(() => store.booking);
const leadPassenger = computed(() => booking.value ? `${booking.value.passengers[0].lastName} ${booking.value.passengers[0].firstName}` : '');
const allServices = computed(() => booking.value ? Object.values(booking.value.services).flatMap((flight) => Object.values(flight)) : []);
const mealServices = computed(() => booking.value ? booking.value.flights.filter(mealOffered).flatMap((flight) => Object.values(booking.value!.services[flight.id])) : []);
const readiness = computed(() => [
    { index: 1, label: '좌석 선택', description: '모든 여정의 좌석을 확인하세요.', path: '/seats', complete: allServices.value.every((item) => Boolean(item.seat)) },
    { index: 2, label: '기내 서비스', description: '제공되는 기내식을 선택하세요.', path: '/meals', complete: mealServices.value.every((item) => Boolean(item.meal)) },
    { index: 3, label: '온라인 체크인', description: '탑승권을 발급받으세요.', path: '/check-in', complete: allServices.value.every((item) => item.checkedIn) },
]);
const completedCount = computed(() => readiness.value.filter((item) => item.complete).length);
const services = [
    { path: '/my-booking', icon: '✈', label: '예약 조회', description: '여정·승객·결제 정보' },
    { path: '/seats', icon: '▦', label: '좌석 선택', description: '탑승객별 좌석 배정' },
    { path: '/baggage', icon: '▣', label: '수하물', description: '허용량·제한 물품 확인' },
    { path: '/boarding-pass', icon: '▥', label: '탑승권', description: '체크인 후 탑승권 보기' },
];
</script>
