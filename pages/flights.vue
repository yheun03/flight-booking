<template>
    <div class="airline-page airline-page--flights">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">01 / YOUR FLIGHT</p>
            <h1>{{ t('onair.flightSelect') }}</h1>
            <p>{{ t('onair.flightDesc') }}</p>
        </header>
        <div class="airline__columns">
            <div class="airline__stack">
                <div class="airline__toolbar">
                    <strong>
                        {{ airport(store.draft.search.from).city }}
                        <span aria-hidden="true">→</span>
                        {{ airport(store.draft.search.to).city }}
                    </strong>
                    <NuxtLink to="/" class="airline__text-link">{{ t('onair.changeSearch') }}</NuxtLink>
                </div>
                <AppTabs v-model="segment" :items="segmentItems" variant="line" />
                <div class="korean-date-strip" role="group" aria-label="주변 일자별 최저 운임">
                    <button type="button" aria-label="이전 7일 보기" @click="shiftDateWindow(-7)">‹</button>
                    <button v-for="item in dateOptions" :key="item.value" type="button"
                        :class="{ 'is-current': item.value === currentDate }"
                        :aria-current="item.value === currentDate ? 'date' : undefined"
                        :aria-label="`${item.fullLabel}, 최저가 ${money(item.price)}원`"
                        :disabled="dateDisabled(item.value)" @click="changeDate(item.value)">
                        <span>{{ item.label }}</span>
                        <strong>{{ money(item.price) }}원</strong>
                    </button>
                    <button type="button" aria-label="다음 7일 보기" @click="shiftDateWindow(7)">›</button>
                </div>
                <p class="sr-only" aria-live="polite">{{ dateChangeAnnouncement }}</p>
                <div class="airline__flight-toolbar">
                    <p>{{ currentDate }} · {{ t('onair.direct') }} · {{ cabinLabel }}</p>
                    <AppSelect v-model="sort" :label="t('onair.sort')" :items="sortOptions" :width="175" required
                        size="sm" />
                </div>
                <article v-for="entry in sortedFlights" :key="entry.flight.id" class="airline-flight"
                    :aria-labelledby="`flight-title-${entry.flight.id}`" :class="{
                        'is-selected': selected?.id === entry.flight.id,
                        'is-lowest': entry.flight.price + entry.flight.tax === lowestCurrentPrice,
                    }">
                    <header class="airline-flight__header">
                        <span :id="`flight-title-${entry.flight.id}`" class="airline-flight__airline" role="heading"
                            aria-level="2">
                            <b>↗</b>
                            KOREAN AIR
                            <small>{{ entry.flight.number }} · {{ entry.flight.aircraft }}</small>
                        </span>
                        <div class="airline-flight__header-actions">
                            <span v-if="entry.flight.price + entry.flight.tax === lowestCurrentPrice"
                                class="korean-lowest-badge">최저가</span>
                            <AppButton size="sm" :data-detail-id="entry.flight.id" @click="openDetail(entry.flight.id)">
                                상세 보기</AppButton>
                            <span v-if="selected?.id === entry.flight.id" class="airline__status">✓ {{
                                t('onair.selected') }}</span>
                        </div>
                    </header>
                    <div class="airline-flight__schedule">
                        <div>
                            <strong>{{ entry.flight.departure }}</strong>
                            <span>{{ entry.flight.from }} · {{ airport(entry.flight.from).zone }}</span>
                        </div>
                        <div class="airline-flight__duration">
                            <span>
                                {{ Math.floor(entry.flight.duration / 60) }}{{ t('onair.hours') }} {{
                                    entry.flight.duration % 60
                                }}{{ t('onair.minutes') }}
                            </span>
                            <i aria-hidden="true">→</i>
                            <span>{{ t('onair.direct') }}</span>
                        </div>
                        <div>
                            <strong>{{ entry.flight.arrival }}</strong>
                            <span>{{ entry.flight.to }} · {{ airport(entry.flight.to).zone }}</span>
                            <small v-if="entry.flight.arrivalDate !== entry.flight.date">{{ t('onair.nextDay') }} {{
                                entry.flight.arrivalDate }}</small>
                        </div>
                        <div class="airline-flight__price">
                            <span>최저가 · {{ t('onair.perAdult') }}</span>
                            <strong>
                                {{ money(entry.flight.price + entry.flight.tax) }}
                                <small>KRW</small>
                            </strong>
                        </div>
                    </div>
                    <p class="airline__muted">
                        {{ t('onair.earnMiles') }} {{ money(entry.flight.earnedMiles) }} M · {{ t('onair.requiredMiles')
                        }}
                        {{ money(selected?.id === entry.flight.id ? selected.miles : entry.flight.miles) }} M{{
                            selected?.id === entry.flight.id ? '' : '~'
                        }}
                    </p>
                    <div class="airline-flight__fares" role="group" :aria-label="`${entry.flight.number} 운임 선택`">
                        <AppButton v-for="fare in fares" :key="fare.id"
                            :active="selected?.id === entry.flight.id && selected?.fare === fare.id"
                            :variant="selected?.id === entry.flight.id && selected?.fare === fare.id ? 'fill' : 'outline'"
                            :tone="selected?.id === entry.flight.id && selected?.fare === fare.id ? 'primary' : 'gray'"
                            :aria-label="`${entry.flight.number} ${fareLabel(fare.id)} 운임 ${money(entry.flight.price + entry.flight.tax + fare.extra)}원 선택`"
                            @click="store.selectFlight(segment, entry.index, fare.id)">
                            <span class="korean-fare-name">{{ fareLabel(fare.id) }}</span>
                            <strong>{{ money(entry.flight.price + entry.flight.tax + fare.extra) }} 원</strong>
                            <small v-if="fare.id !== 'light'">{{ fare.id === 'standard' ? '4석' : '2석' }}</small>
                            <span v-if="selected?.id === entry.flight.id && selected?.fare === fare.id">✓</span>
                        </AppButton>
                    </div>
                    <dl v-if="selected?.id === entry.flight.id" class="airline-fare-benefits" aria-label="선택 운임 조건">
                        <div>
                            <dt>무료 위탁 수하물</dt>
                            <dd>{{ store.draft.search.cabin === 'economy' ? '1개 · 20kg 이내' : store.draft.search.cabin
                                === 'prestige' ? '2개 · 각 32kg 이내' : '3개 · 각 32kg 이내' }}</dd>
                        </div>
                        <div>
                            <dt>좌석 선택</dt>
                            <dd>{{ selected.fare === 'light' ? '일부 좌석 유료' : '일반 좌석 무료' }}</dd>
                        </div>
                        <div>
                            <dt>예약 변경</dt>
                            <dd>{{ selected.fare === 'flex' ? '수수료 면제' : '운임별 수수료 적용' }}</dd>
                        </div>
                        <div>
                            <dt>환불</dt>
                            <dd>{{ selected.fare === 'flex' ? '출발 전 가능' : '운임별 위약금 적용' }}</dd>
                        </div>
                    </dl>
                    <div v-if="detailFlightId === entry.flight.id" class="korean-flight-detail"
                        @click.self="closeDetail(entry.flight.id)" @keydown.esc="closeDetail(entry.flight.id)">
                        <div class="korean-flight-detail__dialog" role="dialog" aria-modal="true"
                            :aria-labelledby="`flight-detail-title-${entry.flight.id}`" tabindex="-1">
                            <header>
                                <h2 :id="`flight-detail-title-${entry.flight.id}`">여정 정보</h2><button type="button"
                                    data-detail-close aria-label="여정 정보 닫기"
                                    @click="closeDetail(entry.flight.id)">×</button>
                            </header>
                            <div class="korean-flight-detail__route">
                                <strong>{{ entry.flight.from }} {{ airport(entry.flight.from).city }} → {{
                                    entry.flight.to }} {{ airport(entry.flight.to).city }}</strong>
                                <span>총 {{ Math.floor(entry.flight.duration / 60) }}시간 {{ entry.flight.duration % 60 }}분
                                    여정</span>
                            </div>
                            <div class="korean-flight-detail__aircraft">
                                <p><b>✈ {{ entry.flight.number }}</b><u>{{ entry.flight.aircraft }}</u></p>
                                <dl>
                                    <div>
                                        <dt>{{ airport(entry.flight.from).city }} {{ entry.flight.from }}</dt>
                                        <dd>{{ entry.flight.date }} {{ entry.flight.departure }} · 터미널 안내</dd>
                                    </div>
                                    <div>
                                        <dt>{{ airport(entry.flight.to).city }} {{ entry.flight.to }}</dt>
                                        <dd>{{ entry.flight.arrivalDate }} {{ entry.flight.arrival }} · 터미널 안내</dd>
                                    </div>
                                </dl>
                            </div>
                            <AppButton variant="fill" tone="primary" @click="closeDetail(entry.flight.id)">확인
                            </AppButton>
                        </div>
                    </div>
                </article>
                <section class="airline__panel airline__stack">
                    <h2>{{ t('onair.fareConditions') }}</h2>
                    <p v-for="fare in fares" :key="fare.id">
                        <strong>{{ fareLabel(fare.id) }}</strong>
                        · {{ t(`onair.${fare.id}Rule`) }}
                    </p>
                    <p class="airline__muted">{{ t('onair.fareNotice') }}</p>
                    <p class="airline__muted">{{ t('onair.fictionalTime') }}</p>
                </section>
                <p v-if="error" class="airline__error" role="alert">{{ t(`onair.${error}`) }}</p>
                <div class="airline__actions">
                    <AppButton to="/">{{ t('onair.back') }}</AppButton>
                    <AppButton variant="fill" tone="primary" size="lg" @click="next">
                        {{
                            segment === 'outbound' &&
                                store.draft.search.trip === 'roundtrip' &&
                                !store.draft.flights.some((f) => f.segment === 'inbound')
                                ? t('onair.inbound')
                                : t('onair.passengers')
                        }}
                        →
                    </AppButton>
                </div>
            </div>
            <OnairSummary />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { flightsFor, airport, money, dateAfter } from '~/utils/onair';
import type { FareId, SegmentId } from '~/types/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '항공편 선택' });
const store = useOnairStore();
const { t } = useI18nText();
const segment = ref<SegmentId>('outbound');
const sort = ref('price');
const error = ref('');
const detailFlightId = ref('');
const dateWindowOffset = ref(0);
const dateChangeAnnouncement = ref('');
watch(
    () => store.draft.flights,
    () => {
        error.value = '';
    },
);
const cabinLabel = computed(() => ({ economy: '일반석', prestige: '프레스티지석', first: '일등석' })[store.draft.search.cabin]);
const fares = computed<{ id: FareId; extra: number }[]>(() => {
    const extras = {
        economy: [0, 35000, 85000],
        prestige: [0, 170000, 350000],
        first: [0, 280000, 520000],
    }[store.draft.search.cabin];
    return [
        { id: 'light', extra: extras[0] },
        { id: 'standard', extra: extras[1] },
        { id: 'flex', extra: extras[2] },
    ];
});
function fareLabel(fare: FareId) {
    if (store.draft.search.cabin === 'economy') return t(`onair.${fare}`);
    const prefix = store.draft.search.cabin === 'first' ? '일등석' : '프레스티지';
    return `${prefix} ${{ light: '세이버', standard: '스탠다드', flex: '플렉스' }[fare]}`;
}
const sortOptions = computed(() => [
    { value: 'price', label: t('onair.priceSort') },
    { value: 'time', label: t('onair.timeSort') },
]);
const segmentItems = computed(() =>
    store.requiredSegments.map((id) => ({
        id,
        title: t(`onair.${id}`),
        badge: store.draft.flights.some((flight) => flight.segment === id) ? '✓' : undefined,
    })),
);
const currentDate = computed(() => (segment.value === 'outbound' ? store.draft.search.departure : store.draft.search.returning));
const dateOptions = computed(() => {
    const date = new Date(`${currentDate.value}T12:00:00`);
    date.setDate(date.getDate() + dateWindowOffset.value);
    return Array.from({ length: 7 }, (_, index) => {
        const current = new Date(date);
        current.setDate(date.getDate() + index - 3);
        const value = current.toISOString().slice(0, 10);
        const search = { ...store.draft.search };
        if (segment.value === 'outbound') search.departure = value;
        else search.returning = value;
        const prices = flightsFor(search, segment.value, 'light').map((flight) => flight.price + flight.tax);
        return {
            value,
            label: `${String(current.getMonth() + 1).padStart(2, '0')}/${String(current.getDate()).padStart(2, '0')}(${['일', '월', '화', '수', '목', '금', '토'][current.getDay()]})`,
            fullLabel: `${current.getFullYear()}년 ${current.getMonth() + 1}월 ${current.getDate()}일 ${['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][current.getDay()]}`,
            price: prices.length ? Math.min(...prices) : 0,
        };
    });
});
const sortedFlights = computed(() =>
    flightsFor(store.draft.search, segment.value)
        .map((flight, index) => ({ flight, index }))
        .sort((a, b) => (sort.value === 'price' ? a.flight.price - b.flight.price : a.flight.departure.localeCompare(b.flight.departure))),
);
const lowestCurrentPrice = computed(() => Math.min(...sortedFlights.value.map(({ flight }) => flight.price + flight.tax)));
const selected = computed(() => store.draft.flights.find((flight) => flight.segment === segment.value));
function dateDisabled(value: string) {
    return value < dateAfter(0) || (segment.value === 'inbound' && value <= store.draft.search.departure);
}
function shiftDateWindow(days: number) {
    dateWindowOffset.value += days;
}
function changeDate(value: string) {
    if (segment.value === 'outbound') store.draft.search.departure = value;
    else store.draft.search.returning = value;
    if (segment.value === 'outbound' && store.draft.search.trip === 'roundtrip' && store.draft.search.returning <= value) {
        const returning = new Date(`${value}T12:00:00`);
        returning.setDate(returning.getDate() + 1);
        store.draft.search.returning = returning.toISOString().slice(0, 10);
    }
    store.draft.flights = store.draft.flights.filter((flight) => flight.segment !== segment.value);
    dateWindowOffset.value = 0;
    dateChangeAnnouncement.value = `${value} 항공편으로 변경되었습니다. 최저가는 ${money(dateOptions.value.find((item) => item.value === value)?.price || 0)}원입니다.`;
    store.persist();
}
function openDetail(flightId: string) {
    detailFlightId.value = flightId;
    nextTick(() => document.querySelector<HTMLButtonElement>('[data-detail-close]')?.focus());
}
function closeDetail(flightId: string) {
    detailFlightId.value = '';
    nextTick(() => document.querySelector<HTMLElement>(`[data-detail-id="${flightId}"]`)?.focus());
}
function next() {
    if (!selected.value) {
        error.value = 'selectAllFlights';
        return;
    }
    if (segment.value === 'outbound' && store.draft.search.trip === 'roundtrip' && !store.flightsComplete) {
        segment.value = 'inbound';
        error.value = '';
        window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        return;
    }
    if (store.itineraryError) {
        error.value = store.itineraryError;
        return;
    }
    if (!store.flightsComplete) {
        error.value = 'selectAllFlights';
        return;
    }
    navigateTo('/passengers');
}
</script>
