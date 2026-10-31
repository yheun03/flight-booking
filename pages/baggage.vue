<template>
    <div class="airline-page airline-guide">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">BAGGAGE GUIDE</p>
            <h1>수하물 안내</h1>
            <p>선택한 운임과 여정에 적용되는 무료 수하물 기준을 확인하고, 출발 전에 크기와 무게를 점검하세요.</p>
        </header>

        <section v-if="booking" class="airline-baggage-summary" aria-labelledby="baggage-booking-title">
            <div>
                <p>현재 예약</p>
                <h2 id="baggage-booking-title">{{ booking.flights[0].from }} → {{ booking.flights[0].to }}</h2>
                <span>예약번호 {{ booking.id }} · {{ booking.flights.length > 1 ? '왕복' : '편도' }} · {{ cabinLabel }}</span>
            </div>
            <dl>
                <div>
                    <dt>기내 휴대</dt>
                    <dd>1개 · 10kg 이내</dd>
                </div>
                <div>
                    <dt>무료 위탁</dt>
                    <dd>{{ checkedBaggage }}</dd>
                </div>
            </dl>
        </section>

        <div class="airline-info-grid">
            <section class="airline__panel airline__stack">
                <span class="airline-info-grid__number" aria-hidden="true">01</span>
                <h2>기내 휴대 수하물</h2>
                <strong>가방 1개 + 휴대용 가방 1개</strong>
                <p>두 개의 합계는 10kg 이내이며, 가방은 머리 위 선반이나 앞 좌석 아래에 안전하게 보관할 수 있어야 합니다.</p>
                <ul>
                    <li>삼변의 합 115cm 이내</li>
                    <li>손잡이·바퀴 포함</li>
                    <li>귀중품·전자기기는 직접 휴대</li>
                </ul>
            </section>
            <section class="airline__panel airline__stack">
                <span class="airline-info-grid__number" aria-hidden="true">02</span>
                <h2>무료 위탁 수하물</h2>
                <strong>{{ cabinLabel }} {{ checkedBaggage }}</strong>
                <p>노선, 운임, 회원 등급에 따라 허용량이 달라질 수 있습니다. 공항에서는 포장 상태와 실제 측정값을 기준으로 접수합니다.</p>
                <ul>
                    <li>이름과 연락처 표기</li>
                    <li>파손·분실 우려 물품은 직접 휴대</li>
                    <li>초과 시 별도 요금 발생 가능</li>
                </ul>
            </section>
        </div>

        <section class="airline__panel airline__stack">
            <div class="airline__toolbar">
                <div>
                    <p class="airline__eyebrow">SAFETY FIRST</p>
                    <h2>가방에 넣기 전에 확인하세요</h2>
                </div>
                <AppButton to="/restricted-items" tone="primary" variant="fill">반입 제한 물품 확인 →</AppButton>
            </div>
            <p class="airline__notice">보조배터리와 전자담배는 위탁 수하물에 넣을 수 없습니다. 위험물 종류와 용량에 따라 운송이 완전히 금지되거나 사전 승인이 필요합니다.</p>
        </section>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '수하물 안내' });
const store = useOnairStore();
const booking = computed(() => store.booking);
const cabinLabel = computed(() => ({ economy: '일반석', prestige: '프레스티지석', first: '일등석' })[booking.value?.flights[0]?.cabin || 'economy']);
const checkedBaggage = computed(() => booking.value?.flights[0]?.cabin === 'first' ? '3개 · 각 32kg 이내' : booking.value?.flights[0]?.cabin === 'prestige' ? '2개 · 각 32kg 이내' : '1개 · 20kg 이내');
</script>
