<template>
    <div class="airline-home">
        <section class="airline-hero">
            <div class="airline-hero__content">
                <p class="airline__eyebrow">
                    <span class="airline-hero__line" />
                    {{ t('onair.heroEyebrow') }}
                </p>
                <h1>
                    {{ t('onair.heroTitle') }}
                    <br />
                    <em>{{ t('onair.heroTitle2') }}</em>
                </h1>
                <p class="airline-hero__description">{{ t('onair.heroDesc') }}</p>
                <span class="airline-hero__edition">YOUR JOURNEY, KOREAN AIR. &nbsp; / &nbsp; 001</span>
            </div>
            <div class="airline-hero__visual" aria-hidden="true">
                <div class="airline-hero__sun" />
                <div class="airline-hero__cloud airline-hero__cloud--one" />
                <div class="airline-hero__cloud airline-hero__cloud--two" />
                <svg class="airline-hero__wing" viewBox="0 0 580 380">
                    <defs>
                        <linearGradient id="wing" x1="0" x2="1" y1="1" y2="0">
                            <stop stop-color="#e8eff3" />
                            <stop offset=".65" stop-color="#fff" />
                            <stop offset="1" stop-color="#c6d6e8" />
                        </linearGradient>
                    </defs>
                    <path d="m-35 330 545-257-55 107-347 200Z" fill="url(#wing)" />
                    <path d="m445 104 65-31-14-64-15 5Z" fill="#071d75" />
                    <path d="m55 337 390-188-15 31L95 363Z" fill="#c1cfdf" />
                    <path d="m90 340 330-163" stroke="#a6b8cd" stroke-width="1" />
                    <path d="m162 286 34 20m78-71 31 17" stroke="#c0cede" stroke-width="2" />
                </svg>
                <span class="airline-hero__visual-caption">
                    ABOVE THE EVERYDAY.
                    <br />
                    <strong>35,000 FT OF POSSIBILITY</strong>
                </span>
                <span class="airline-hero__coordinates">37°27′ N &nbsp; 126°27′ E</span>
            </div>
        </section>
        <section class="airline-search" :aria-label="t('onair.search')">
            <nav class="airline-search__quick-nav" aria-label="빠른 메뉴">
                <NuxtLink to="/" class="is-current" aria-current="page">✈ 항공권 예매</NuxtLink>
                <NuxtLink to="/my-booking">♙ 나의 여행</NuxtLink>
                <NuxtLink to="/check-in">▣ 체크인</NuxtLink>
                <NuxtLink to="/travel-guide">◷ 출도착 / 스케줄</NuxtLink>
            </nav>
            <form @submit.prevent="submit" @keydown.esc.prevent="closePanel()">
                <div class="airline-search__top">
                    <div class="airline__inline">
                        <div class="airline-search__modes" role="group" aria-label="예매 방식">
                            <button type="button" :class="{ 'is-active': bookingMode === 'fare' }"
                                @click="bookingMode = 'fare'">예매</button>
                            <button type="button" :class="{ 'is-active': bookingMode === 'miles' }"
                                @click="bookingMode = 'miles'">마일리지 예매</button>
                        </div>
                        <AppChoice v-model="form.trip" type="radio" variant="chip" name="trip" value="roundtrip"
                            :label="t('onair.roundtrip')" />
                        <AppChoice v-model="form.trip" type="radio" variant="chip" name="trip" value="oneway"
                            :label="t('onair.oneway')" />
                    </div>
                    <AppChoice v-model="nearbyDates" label="가까운 날짜 함께 조회" />
                </div>
                <div class="airline-search__fields">
                    <button id="departure-airport" class="korean-search-field korean-search-field--airport"
                        type="button" aria-haspopup="dialog" aria-controls="airport-search-panel"
                        :aria-expanded="activePanel === 'from'" @click="togglePanel('from')">
                        <span>{{ t('onair.from') }}</span>
                        <strong>{{ form.from }}</strong>
                        <small>{{ airport(form.from).city }} / {{ airport(form.from).name }}</small>
                    </button>
                    <AppButton class="airline-search__swap" unstyled :aria-label="t('onair.swap')" @click="swap">⇄
                    </AppButton>
                    <button id="arrival-airport" class="korean-search-field korean-search-field--airport" type="button"
                        aria-haspopup="dialog" aria-controls="airport-search-panel"
                        :aria-expanded="activePanel === 'to'" @click="togglePanel('to')">
                        <span>{{ t('onair.to') }}</span>
                        <strong>{{ form.to }}</strong>
                        <small>{{ airport(form.to).city }} / {{ airport(form.to).name }}</small>
                    </button>
                    <button id="departure-date" class="korean-search-field korean-search-field--date" type="button"
                        aria-haspopup="dialog" aria-controls="date-search-panel"
                        :aria-expanded="activePanel === 'dates'" @click="togglePanel('dates')">
                        <span>{{ form.trip === 'roundtrip' ? '출발일 · 귀국일' : t('onair.departureDate') }}</span>
                        <strong>{{ shortDate(form.departure) }}</strong>
                        <small v-if="form.trip === 'roundtrip'">→ {{ shortDate(form.returning) }}</small>
                    </button>
                    <button id="travelers" class="korean-search-field korean-search-field--passengers" type="button"
                        aria-haspopup="dialog" aria-controls="passenger-search-panel"
                        :aria-expanded="activePanel === 'travelers'" @click="togglePanel('travelers')">
                        <span>{{ t('onair.travelers') }}</span>
                        <strong>성인 {{ form.adults }}</strong>
                        <small>소아 0 · 유아 0</small>
                    </button>
                    <button id="cabin-class" class="korean-search-field korean-search-field--class" type="button"
                        aria-haspopup="dialog" aria-controls="class-search-panel"
                        :aria-expanded="activePanel === 'class'" @click="togglePanel('class')">
                        <span>좌석 등급</span>
                        <strong>{{ cabinLabel }}</strong>
                    </button>
                    <AppButton id="search-submit" class="airline-search__submit" type="submit" variant="fill"
                        tone="primary" size="lg">
                        {{ t('onair.searchFlights') }}
                        <span aria-hidden="true">↗</span>
                    </AppButton>
                </div>
                <div v-if="activePanel === 'from' || activePanel === 'to'" id="airport-search-panel"
                    class="korean-search-panel korean-airport-panel" role="dialog" aria-modal="false"
                    aria-labelledby="airport-search-title">
                    <header>
                        <h2 id="airport-search-title">지역과 도시 선택</h2>
                        <button type="button" data-panel-close aria-label="공항 선택 닫기" @click="closePanel()">×</button>
                    </header>
                    <div class="korean-airport-panel__body">
                        <nav aria-label="지역">
                            <button v-for="(region, index) in regions" :key="region" type="button"
                                :class="{ 'is-active': index === selectedRegion }"
                                :aria-pressed="index === selectedRegion" @click="selectedRegion = index">{{
                                    region }}</button>
                        </nav>
                        <div>
                            <strong>대한항공 취항지</strong>
                            <button v-for="item in filteredAirports" :key="item.value" type="button"
                                :aria-label="`${item.city} ${item.name} ${item.value} 선택`"
                                @click="selectAirport(item.value)">
                                <span>✈ {{ item.city }} / {{ item.name }}</span>
                                <b>{{ item.value }}</b>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="activePanel === 'dates'" id="date-search-panel"
                    class="korean-search-panel korean-calendar-panel" role="dialog" aria-modal="false"
                    aria-labelledby="date-search-title">
                    <header>
                        <h2 id="date-search-title">출발일</h2>
                        <button type="button" data-panel-close aria-label="날짜 선택 닫기" @click="closePanel()">×</button>
                    </header>
                    <div class="korean-calendar-panel__top">
                        <button type="button" :class="{ 'is-active': form.trip === 'roundtrip' }"
                            @click="form.trip = 'roundtrip'">왕복</button>
                        <button type="button" :class="{ 'is-active': form.trip === 'oneway' }"
                            @click="form.trip = 'oneway'">편도</button>
                        <label><input type="checkbox" /> 가까운 날짜 함께 조회</label>
                    </div>
                    <div class="korean-calendar-panel__months">
                        <section v-for="month in calendarMonths" :key="month.key">
                            <h3>{{ month.year }}년 {{ month.month + 1 }}월</h3>
                            <div class="korean-calendar-panel__week"><span v-for="day in weekDays" :key="day">{{ day
                                    }}</span></div>
                            <div class="korean-calendar-panel__days">
                                <button v-for="(day, index) in month.days" :key="`${month.key}-${index}`" type="button"
                                    :disabled="!day || day < dateAfter(0)" :aria-label="day ? fullDate(day) : undefined"
                                    :aria-pressed="day ? day === form.departure || day === form.returning : undefined"
                                    :class="{ 'is-selected': day === form.departure || day === form.returning, 'is-range': inRange(day) }"
                                    @click="day && selectDate(day)">{{ day ? Number(day.slice(-2)) : '' }}</button>
                            </div>
                        </section>
                    </div>
                </div>
                <div v-if="activePanel === 'travelers'" id="passenger-search-panel"
                    class="korean-search-panel korean-passenger-panel" role="dialog" aria-modal="false"
                    aria-labelledby="passenger-search-title">
                    <header>
                        <h2 id="passenger-search-title">승객 선택</h2>
                        <button type="button" data-panel-close aria-label="승객 선택 닫기" @click="closePanel()">×</button>
                    </header>
                    <div class="korean-passenger-panel__counts">
                        <div>
                            <strong>성인 <small>만 12세 이상</small></strong>
                            <span><button type="button" aria-label="성인 인원 감소" :disabled="form.adults <= 1"
                                    @click="changeAdults(-1)">−</button><b>{{ form.adults }}</b><button type="button"
                                    aria-label="성인 인원 증가" :disabled="form.adults >= 2"
                                    @click="changeAdults(1)">＋</button></span>
                        </div>
                        <div><strong>소아 <small>만 2~11세</small></strong><span><button type="button"
                                    disabled>−</button><b>0</b><button type="button" disabled>＋</button></span></div>
                        <div><strong>유아 <small>만 2세 미만</small></strong><span><button type="button"
                                    disabled>−</button><b>0</b><button type="button" disabled>＋</button></span></div>
                    </div>
                    <div class="korean-passenger-panel__notice">소아와 유아를 포함한 예약은 실제 대한항공 홈페이지에서 자세한 규정을 확인해 주세요.</div>
                    <AppButton variant="fill" tone="primary" @click="closePanel(true)">확인</AppButton>
                </div>
                <div v-if="activePanel === 'class'" id="class-search-panel"
                    class="korean-search-panel korean-class-panel" role="dialog" aria-modal="false"
                    aria-labelledby="class-search-title">
                    <header>
                        <h2 id="class-search-title">좌석 등급 선택</h2>
                        <button type="button" data-panel-close aria-label="좌석 등급 선택 닫기" @click="closePanel()">×</button>
                    </header>
                    <div class="korean-class-panel__options">
                        <button v-for="item in cabinClasses" :key="item.value" type="button"
                            :class="{ 'is-active': form.cabin === item.value }"
                            :aria-pressed="form.cabin === item.value" @click="selectCabinClass(item.value)">{{
                            item.label }}</button>
                    </div>
                    <label class="korean-class-panel__upgrade">
                        <span>마일리지로 좌석 승급을 하시겠습니까?</span>
                        <input v-model="upgradeWithMiles" type="checkbox" />
                    </label>
                </div>
                <p class="sr-only" aria-live="polite">{{ panelAnnouncement }}</p>
                <p v-if="error" id="search-error" class="airline__error" role="alert" tabindex="-1">{{
                    t(`onair.${error}`) }}</p>
            </form>
        </section>
        <section class="airline-home-banner">
            <strong>대한항공 예약 서비스를 한눈에 확인해 보세요</strong>
            <span>항공권 검색부터 좌석 선택과 결제까지 한 번에 진행할 수 있습니다.</span>
            <b>FAQ</b>
        </section>
        <section class="airline-destinations">
            <header class="airline__section-heading">
                <div>
                    <p class="airline__eyebrow">FIND YOUR NEXT SCENE</p>
                    <h2>{{ t('onair.destTitle') }}</h2>
                </div>
                <p>{{ t('onair.destDesc') }}</p>
            </header>
            <div class="airline-destinations__grid">
                <button v-for="destination in destinations" :key="destination.code" class="airline-destination"
                    :class="`airline-destination--${destination.key}`" type="button"
                    @click="chooseDestination(destination.code)">
                    <div class="airline-destination__art" aria-hidden="true">
                        <span class="airline-destination__sun" />
                        <span class="airline-destination__building" />
                        <span class="airline-destination__code">{{ destination.code }}</span>
                        <span class="airline-destination__arrow">↗</span>
                    </div>
                    <div class="airline-destination__info">
                        <div>
                            <h3>
                                {{ t(`onair.${destination.key}`) }}
                                <small>{{ destination.english }}</small>
                            </h3>
                            <p>{{ t(`onair.${destination.key}Desc`) }}</p>
                        </div>
                        <span>
                            {{ t('onair.fromPrice') }}
                            <strong>
                                {{ money(destination.price) }}
                                <small>KRW~</small>
                            </strong>
                        </span>
                    </div>
                </button>
            </div>
        </section>
        <section class="airline-home-notice" aria-labelledby="home-notice-title">
            <div>
                <header>
                    <h2 id="home-notice-title">알려드립니다</h2>
                    <NuxtLink to="/travel-guide">목록보기</NuxtLink>
                </header>
                <ul>
                    <li v-for="notice in notices" :key="notice.title">
                        <NuxtLink to="/travel-guide">{{ notice.title }}</NuxtLink>
                        <time>{{ notice.date }}</time>
                    </li>
                </ul>
            </div>
            <NuxtLink to="/my-page" class="airline-home-notice__app">
                <span>대한항공 My 앱</span>
                <small>내 손안의 여행 큐레이터</small>
                <i aria-hidden="true">KOREAN AIR</i>
            </NuxtLink>
        </section>
        <section class="airline-experience" aria-labelledby="experience-title">
            <div>
                <h2 id="experience-title">여행의 완성을 위한 경험</h2>
                <div>
                    <NuxtLink v-for="item in experiences" :key="item.label" :to="item.to">
                        <span aria-hidden="true">{{ item.icon }}</span>
                        <strong>{{ item.label }}</strong>
                    </NuxtLink>
                </div>
            </div>
        </section>
        <div class="airline-home__note">
            <span aria-hidden="true">✳</span>
            <p>{{ t('onair.demoIntro') }}</p>
            <span>DESIGNED FOR THE JOURNEY.</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { airport, airports, dateAfter, money } from '~/utils/onair';
import type { AirportCode, CabinClass } from '~/types/onair';

definePageMeta({ layout: 'airline' });
const store = useOnairStore();
const { t } = useI18nText();
const form = reactive({ ...store.draft.search });
const error = ref('');
const activePanel = ref<'from' | 'to' | 'dates' | 'travelers' | 'class' | ''>('');
const panelAnnouncement = ref('');
const nearbyDates = ref(false);
const bookingMode = ref<'fare' | 'miles'>('fare');
const upgradeWithMiles = ref(false);
const cabinClasses: { value: CabinClass; label: string }[] = [
    { value: 'economy', label: '일반석' },
    { value: 'prestige', label: '프레스티지석' },
    { value: 'first', label: '일등석' },
];
const cabinLabel = computed(() => cabinClasses.find((item) => item.value === form.cabin)?.label || '일반석');
const selectedRegion = ref(0);
const regions = ['대한민국', '동북아시아', '동남아시아 / 서남아시아', '미주', '유럽', '대양주'];
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
watch(
    () => store.draft.search,
    (search) => {
        Object.assign(form, search);
        error.value = '';
    },
);
const calendarMonths = computed(() => {
    const base = new Date(`${form.departure || dateAfter(0)}T12:00:00`);
    const first = new Date(base.getFullYear(), base.getMonth(), 1);
    return [0, 1].map((offset) => {
        const current = new Date(first.getFullYear(), first.getMonth() + offset, 1);
        const year = current.getFullYear();
        const month = current.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const days: (string | null)[] = Array(current.getDay()).fill(null);
        for (let day = 1; day <= lastDay; day += 1) {
            days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        }
        return { key: `${year}-${month}`, year, month, days };
    });
});
const filteredAirports = computed(() => {
    const codes = [
        ['ICN', 'GMP', 'CJU'],
        ['NRT'],
        ['BKK'],
        [],
        ['CDG'],
        [],
    ][selectedRegion.value];
    return airports.filter((item) => codes?.includes(item.value));
});
const destinations = [
    { code: 'NRT' as AirportCode, key: 'tokyo', english: 'TOKYO', price: 190000 },
    { code: 'BKK' as AirportCode, key: 'bangkok', english: 'BANGKOK', price: 330000 },
    { code: 'CDG' as AirportCode, key: 'paris', english: 'PARIS', price: 740000 },
];
const notices = [
    { title: '항공편 운항 정보 및 여행 안내', date: '2026년 10월 31일' },
    { title: '대한항공 주요 서비스 안내', date: '2026년 10월 30일' },
    { title: '마일리지 서비스 확대 안내', date: '2026년 10월 29일' },
    { title: '국제선 탑승 전 확인 사항', date: '2026년 10월 27일' },
];
const experiences = [
    { label: '이벤트', icon: '◇', to: '/travel-guide' },
    { label: '대한항공카드', icon: '▭', to: '/payment' },
    { label: '기프트카드', icon: '▱', to: '/payment' },
    { label: '호텔', icon: '▥', to: '/travel-guide' },
    { label: '렌터카', icon: '▰', to: '/travel-guide' },
    { label: '기내 면세점', icon: '⌑', to: '/travel-guide' },
    { label: '여행자 보험', icon: '♢', to: '/travel-guide' },
    { label: '여행 상품', icon: '□', to: '/travel-guide' },
];
function swap() {
    [form.from, form.to] = [form.to, form.from];
}
function togglePanel(panel: 'from' | 'to' | 'dates' | 'travelers' | 'class') {
    if (activePanel.value === panel) {
        closePanel();
        return;
    }
    activePanel.value = panel;
    nextTick(() => document.querySelector<HTMLButtonElement>('.korean-search-panel [data-panel-close]')?.focus());
}
function closePanel(advance = false) {
    const panel = activePanel.value;
    if (!panel) return;
    activePanel.value = '';
    const currentTarget = { from: 'departure-airport', to: 'arrival-airport', dates: 'departure-date', travelers: 'travelers', class: 'cabin-class' }[panel];
    const nextTarget = { from: 'arrival-airport', to: 'departure-date', dates: 'travelers', travelers: 'cabin-class', class: 'search-submit' }[panel];
    nextTick(() => document.getElementById(advance ? nextTarget : currentTarget)?.focus());
}
function selectCabinClass(value: CabinClass) {
    form.cabin = value;
    panelAnnouncement.value = `${cabinClasses.find((item) => item.value === value)?.label}이 선택되었습니다.`;
    closePanel(true);
}
function selectAirport(code: string) {
    const panel = activePanel.value;
    if (activePanel.value === 'from') form.from = code as AirportCode;
    if (activePanel.value === 'to') form.to = code as AirportCode;
    panelAnnouncement.value = `${airport(code as AirportCode).city} ${airport(code as AirportCode).name}이 ${panel === 'from' ? '출발지' : '도착지'}로 선택되었습니다.`;
    closePanel(true);
}
function shortDate(value: string) {
    if (!value) return '날짜 선택';
    const [, month, day] = value.split('-');
    return `${Number(month)}월 ${Number(day)}일`;
}
function fullDate(value: string) {
    const date = new Date(`${value}T12:00:00`);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekDays[date.getDay()]}요일`;
}
function selectDate(value: string) {
    if (form.trip === 'oneway') {
        form.departure = value;
        panelAnnouncement.value = `${fullDate(value)} 출발일이 선택되었습니다.`;
        closePanel(true);
        return;
    }
    if (!form.departure || form.returning || value <= form.departure) {
        form.departure = value;
        form.returning = '';
        return;
    }
    form.returning = value;
    panelAnnouncement.value = `${fullDate(form.departure)} 출발, ${fullDate(value)} 귀국 일정이 선택되었습니다.`;
    closePanel(true);
}
function inRange(value: string | null) {
    return Boolean(value && form.departure && form.returning && value > form.departure && value < form.returning);
}
function changeAdults(amount: number) {
    form.adults = Math.min(2, Math.max(1, form.adults + amount));
    panelAnnouncement.value = `성인 ${form.adults}명으로 변경되었습니다.`;
}
function chooseDestination(code: AirportCode) {
    form.from = 'ICN';
    form.to = code;
    document.getElementById('departure-date')?.focus();
    document.querySelector('.airline-search')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
    });
}
async function submit() {
    store.paymentMethod = bookingMode.value === 'miles' ? 'miles' : 'card';
    error.value = store.search(form);
    if (error.value) {
        await nextTick();
        document.getElementById('search-error')?.focus();
        return;
    }
    await navigateTo('/flights');
}
</script>
