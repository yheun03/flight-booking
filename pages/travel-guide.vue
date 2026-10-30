<template>
    <div class="airline-page airline-guide">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">TRAVEL READY</p>
            <h1>예약부터 탑승까지</h1>
            <p>항공권 구매 후 필요한 준비를 시간 순서대로 확인하세요. 완료한 단계는 나의 여행에서 이어서 처리할 수 있습니다.</p>
        </header>

        <ol class="airline-journey" aria-label="항공 여행 절차">
            <li v-for="(step, index) in journey" :key="step.title">
                <span aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
                <div>
                    <p>{{ step.when }}</p>
                    <h2>{{ step.title }}</h2>
                    <p>{{ step.description }}</p>
                    <NuxtLink v-if="step.path" :to="step.path" class="airline__text-link">{{ step.action }} →</NuxtLink>
                </div>
            </li>
        </ol>

        <div class="airline-guide__columns">
            <section class="airline__panel airline__stack">
                <div class="airline__toolbar">
                    <h2>출발 전 체크리스트</h2>
                    <span class="airline__muted">필수 확인</span>
                </div>
                <ul class="airline-check-list">
                    <li v-for="item in checklist" :key="item"><span aria-hidden="true">✓</span>{{ item }}</li>
                </ul>
            </section>
            <section class="airline__panel airline__stack">
                <h2>놓치기 쉬운 안내</h2>
                <p>공항·노선별 체크인 마감 시간과 탑승구는 달라질 수 있습니다. 출발 당일 최신 운항 정보와 탑승권을 다시 확인하세요.</p>
                <div class="airline__actions">
                    <AppButton to="/baggage">수하물 안내</AppButton>
                    <AppButton to="/restricted-items" tone="primary" variant="fill">반입 제한 물품</AppButton>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'airline' });
useHead({ title: '예약부터 탑승까지' });

const journey = [
    { when: '결제 직후', title: '예약·전자항공권 확인', description: '예약번호, 탑승객 영문명, 여정, 운임 조건, 결제 금액과 연락처를 확인합니다.', path: '/my-booking', action: '예약 조회' },
    { when: '출발 전', title: '여행 서류와 수하물 준비', description: '신분증 또는 여권·비자 유효기간을 확인하고 위탁·휴대 수하물 규정을 점검합니다.', path: '/baggage', action: '수하물 확인' },
    { when: '출발 48시간 전부터', title: '좌석·기내 서비스 선택', description: '원하는 좌석과 제공 가능한 기내식을 선택합니다. 항공편에 따라 서비스가 제한될 수 있습니다.', path: '/seats', action: '좌석 선택' },
    { when: '체크인 가능 시간', title: '온라인 체크인', description: '탑승객과 여정을 확인하고 위험물 안내에 동의한 뒤 탑승권을 발급합니다.', path: '/check-in', action: '체크인' },
    { when: '공항 도착 후', title: '수하물 위탁·보안 검색', description: '필요한 경우 수하물을 맡기고 보안 검색과 출국 심사를 마친 뒤 탑승구로 이동합니다.' },
    { when: '탑승 시작 전', title: '탑승권·신분증 제시', description: '탑승구, 탑승 시각, 그룹을 확인하고 안내 순서에 맞춰 항공기에 탑승합니다.', path: '/boarding-pass', action: '탑승권 보기' },
];
const checklist = [
    '예약 확인서의 이름이 신분증·여권의 영문명과 같은지 확인',
    '여권·비자·입국 조건 및 목적지에서 필요한 서류 확인',
    '무료 수하물 허용량과 초과 수하물 요금 확인',
    '보조배터리·액체류 등 휴대 및 위탁 제한 물품 분리',
    '공항 터미널, 체크인 마감, 탑승구 도착 시간 확인',
];
</script>
