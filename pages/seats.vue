<template>
    <div v-if="booking && flight && service" class="airline-page airline-page--seats">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">MAKE YOURSELF COMFORTABLE</p>
            <h1>{{ t('onair.seats') }}</h1>
            <p>{{ t('onair.seatsDesc') }}</p>
        </header>
        <div class="airline__columns">
            <div class="airline__stack">
                <OnairServiceSelector v-model:flight-id="flightId" v-model:passenger-id="passengerId" />
                <div class="airline__toolbar airline__panel">
                    <strong>{{ flight.aircraft }} · {{ passenger.lastName }} {{ passenger.firstName }}</strong>
                    <span>
                        {{ t('onair.seat') }}
                        <b>{{ service.seat || t('onair.notSelected') }}</b>
                    </span>
                </div>
                <p v-if="service.checkedIn" class="airline__notice" role="status">{{ t('onair.locked') }}</p>
                <div class="airline-seat-legend">
                    <span>
                        <i />
                        {{ t('onair.available') }}
                    </span>
                    <span>
                        <i class="is-selected">✓</i>
                        {{ t('onair.selected') }}
                    </span>
                    <span>
                        <i class="is-occupied">×</i>
                        {{ t('onair.occupied') }}
                    </span>
                    <span>
                        <i class="is-exit">—</i>
                        {{ t('onair.exit') }}
                    </span>
                </div>
                <div class="korean-seat-keyboard-guide" role="note">
                    <span aria-hidden="true">↑ ↓ ← →</span>
                    <p id="seat-keyboard-instructions">
                        <strong>{{ service.checkedIn ? '좌석 선택 완료' : '키보드로 좌석 선택' }}</strong>
                        {{ service.checkedIn ? '체크인 완료 후에는 좌석을 변경할 수 없습니다.' : '방향키로 이동하고 Enter 또는 Space 키로 선택하세요.' }}
                    </p>
                </div>
                <p class="sr-only" aria-live="polite">{{ seatAnnouncement }}</p>
                <p class="airline__muted">{{ t('onair.seatHint') }} {{ t('onair.seatScroll') }}</p>
                <div class="airline-seat-map" role="region" aria-describedby="seat-keyboard-instructions"
                    :aria-label="`${t('onair.seats')} · 방향키로 이동, Enter 또는 Space로 선택`">
                    <div class="airline-seat-map__aircraft" :class="[
                        `airline-seat-map__aircraft--${flight.cabin}`,
                        { 'airline-seat-map__aircraft--wide': flight.aircraft === 'B787-9' && flight.cabin === 'economy' },
                    ]">
                        <div class="airline-seat-map__nose">
                            <span>↑ {{ t('onair.front') }}</span>
                            <strong>{{ flight.aircraft }}</strong>
                        </div>
                        <div class="airline-seat-map__row airline-seat-map__letters"
                            :style="{ gridTemplateColumns: gridColumns }">
                            <span class="airline-seat-map__number" />
                            <span v-for="letter in letters" :key="letter"
                                :class="{ 'airline-seat-map__aisle': aisleAfter(letter) }">{{
                                    letter
                                }}</span>
                        </div>
                        <div v-for="row in rows" :key="row" class="airline-seat-map__row"
                            :style="{ gridTemplateColumns: gridColumns }">
                            <span class="airline-seat-map__number">{{ row }}</span>
                            <button v-for="letter in letters" :key="letter" class="airline-seat" :class="[
                                `airline-seat--${flight.cabin}`,
                                {
                                    'airline-seat-map__aisle': aisleAfter(letter),
                                    'is-selected': service.seat === `${row}${letter}`,
                                    'is-occupied': blocked(`${row}${letter}`) === 'occupied',
                                    'is-exit': blocked(`${row}${letter}`) === 'exit',
                                },
                            ]" type="button" :data-seat="`${row}${letter}`" :tabindex="seatTabIndex(`${row}${letter}`)"
                                :disabled="service.checkedIn || !!blocked(`${row}${letter}`)"
                                aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Enter Space"
                                aria-describedby="seat-keyboard-instructions"
                                :aria-label="`${row}${letter} · ${service.seat === `${row}${letter}` ? t('onair.selected') : t(`onair.${blocked(`${row}${letter}`) || 'available'}`)}`"
                                :aria-pressed="service.seat === `${row}${letter}`"
                                @focus="activeSeat = `${row}${letter}`" @keydown="moveSeat($event, row, letter)"
                                @click="choose(`${row}${letter}`)">
                                {{
                                    blocked(`${row}${letter}`)
                                        ? blocked(`${row}${letter}`) === 'exit'
                                            ? '—'
                                            : '×'
                                        : service.seat === `${row}${letter}`
                                            ? '✓'
                                            : `${row}${letter}`
                                }}
                            </button>
                        </div>
                    </div>
                    <div v-if="pendingSeat" class="korean-seat-confirm" role="dialog" aria-modal="false"
                        aria-labelledby="seat-confirm-title">
                        <button type="button" aria-label="좌석 선택 확인 닫기" @click="pendingSeat = ''">×</button>
                        <span>{{ cabinLabel }}</span>
                        <strong id="seat-confirm-title">{{ pendingSeat }}</strong>
                        <b>무료 좌석</b>
                        <p><strong>{{ passenger.lastName }} {{ passenger.firstName }}</strong>의 좌석을 선택하시겠습니까?</p>
                        <AppButton variant="fill" tone="primary" @click="confirmSeat">{{ pendingSeat }} 좌석 선택
                        </AppButton>
                    </div>
                </div>
                <div class="airline__actions">
                    <AppButton to="/my-booking">{{ t('onair.myBooking') }}</AppButton>
                    <AppButton to="/meals" tone="primary" variant="fill" size="lg">{{ t('onair.meals') }} →</AppButton>
                </div>
            </div>
            <aside class="korean-seat-side" aria-label="좌석 및 항공기 정보">
                <section>
                    <span>탑승객</span>
                    <strong>① {{ passenger.lastName }} {{ passenger.firstName }}</strong>
                    <b>좌석 {{ service.seat || '미선택' }}</b>
                </section>
                <section class="korean-seat-side__cabin" :class="`korean-seat-side__cabin--${flight.cabin}`">
                    <div aria-hidden="true"><i /><i /><i /><i /></div>
                    <h2>{{ cabinLabel }}</h2>
                    <ul>
                        <li v-for="feature in cabinFeatures" :key="feature">{{ feature }}</li>
                    </ul>
                </section>
                <p>선택한 좌석은 탑승객 정보에 즉시 반영됩니다.</p>
            </aside>
        </div>
    </div>
    <div v-else class="airline-page">
        <div class="airline__empty">
            <span aria-hidden="true">▦</span>
            <h1>좌석을 선택할 예약이 없습니다.</h1>
            <p>예약을 완료한 뒤 탑승객별 좌석을 선택할 수 있습니다.</p>
            <AppButton to="/" tone="primary" variant="fill">항공편 검색</AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { seatLetters, seatBlocked } from '~/utils/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '좌석 지정' });
const store = useOnairStore();
const { t } = useI18nText();
const toast = useToast();
const booking = computed(() => store.booking!);
const flightId = ref(booking.value?.flights[0].id || '');
const passengerId = ref(booking.value?.passengers[0].id || '');
const activeSeat = ref('');
const pendingSeat = ref('');
const seatAnnouncement = ref('');
const flight = computed(() => booking.value?.flights.find((item) => item.id === flightId.value));
const passenger = computed(() => booking.value?.passengers.find((item) => item.id === passengerId.value)!);
const service = computed(() => booking.value?.services[flightId.value]?.[passengerId.value]);
const letters = computed(() => (flight.value ? seatLetters(flight.value) : []));
const rows = computed(() => {
    if (flight.value?.cabin === 'first') return Array.from({ length: 3 }, (_, index) => index + 1);
    if (flight.value?.cabin === 'prestige') return Array.from({ length: 5 }, (_, index) => index + 7);
    if (flight.value?.aircraft === 'A321') return Array.from({ length: 20 }, (_, index) => index + 1);
    return Array.from({ length: 34 }, (_, index) => index + 28);
});
const gridColumns = computed(() => {
    if (flight.value?.cabin === 'first') return '25px repeat(2, 82px)';
    if (flight.value?.cabin === 'prestige') return '25px repeat(6, 46px)';
    return flight.value?.aircraft === 'A220-300'
        ? '25px repeat(2, 32px) 48px repeat(3, 32px)'
        : flight.value?.aircraft === 'A321'
            ? '25px repeat(3, 32px) 48px repeat(2, 32px)'
            : '25px repeat(3, 32px) 48px repeat(2, 32px) 48px repeat(2, 32px)';
});
const cabinLabel = computed(() => ({ economy: '일반석', prestige: '프레스티지석', first: '일등석' })[flight.value?.cabin || 'economy']);
const cabinFeatures = computed(() => {
    if (flight.value?.cabin === 'first') return ['개인 스위트형 좌석', '좌석 간격 211cm · 180° 침대형', '개인 수납장 및 61cm 모니터'];
    if (flight.value?.cabin === 'prestige') return ['프레스티지 스위트 좌석', '좌석 간격 190cm · 180° 침대형', '개인 모니터 및 전원 공급 장치'];
    return [`${flight.value?.aircraft} 기종`, 'USB 포트 및 기내 엔터테인먼트', '좌석 선택 후 자동 저장'];
});
function aisleAfter(letter: string) {
    if (flight.value?.cabin === 'first') return letter === 'J';
    if (flight.value?.cabin === 'prestige') return letter === 'D' || letter === 'H';
    return letter === 'D' || (flight.value?.aircraft === 'B787-9' && letter === 'G');
}
function blocked(seat: string) {
    if (!flight.value) return 'unavailable';
    return (
        seatBlocked(flight.value, seat) ||
        (Object.entries(booking.value.services[flightId.value]).some(([id, item]) => id !== passengerId.value && item.seat === seat)
            ? 'occupied'
            : '')
    );
}
function firstAvailableSeat() {
    for (const row of rows.value) {
        for (const letter of letters.value) {
            const seat = `${row}${letter}`;
            if (!blocked(seat)) return seat;
        }
    }
    return '';
}
function seatTabIndex(seat: string) {
    return !service.value?.checkedIn && activeSeat.value === seat && !blocked(seat) ? 0 : -1;
}
function focusSeat(seat: string) {
    activeSeat.value = seat;
    nextTick(() => document.querySelector<HTMLButtonElement>(`.airline-seat[data-seat="${seat}"]`)?.focus());
}
function moveSeat(event: KeyboardEvent, row: number, letter: string) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || service.value?.checkedIn) return;
    event.preventDefault();

    const rowIndex = rows.value.indexOf(row);
    const letterIndex = letters.value.indexOf(letter);
    let nextRow = rowIndex;
    let nextLetter = letterIndex;

    if (event.key === 'Home' || event.key === 'End') {
        const candidates = event.key === 'Home' ? letters.value : [...letters.value].reverse();
        const target = candidates.map((item) => `${row}${item}`).find((seat) => !blocked(seat));
        if (target) focusSeat(target);
        return;
    }

    const rowStep = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    const letterStep = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    while (true) {
        nextRow += rowStep;
        nextLetter += letterStep;
        if (nextRow < 0 || nextRow >= rows.value.length || nextLetter < 0 || nextLetter >= letters.value.length) return;
        const target = `${rows.value[nextRow]}${letters.value[nextLetter]}`;
        if (!blocked(target)) {
            focusSeat(target);
            return;
        }
    }
}
function choose(seat: string) {
    activeSeat.value = seat;
    if (service.value?.seat === seat) {
        store.assignSeat(flightId.value, passengerId.value, seat);
        seatAnnouncement.value = `${seat} 좌석 선택이 해제되었습니다.`;
        return;
    }
    pendingSeat.value = seat;
    seatAnnouncement.value = `${seat} 좌석 선택 확인 창이 열렸습니다.`;
}
function confirmSeat() {
    if (!pendingSeat.value) return;
    const seat = pendingSeat.value;
    const error = store.assignSeat(flightId.value, passengerId.value, seat);
    if (error) {
        seatAnnouncement.value = `${seat} 좌석을 선택할 수 없습니다.`;
        toast.error(t(`onair.${error}`));
    } else {
        seatAnnouncement.value = `${seat} 좌석이 선택되었습니다.`;
        toast.success(t('onair.seatSaved'));
    }
    pendingSeat.value = '';
}
watch(
    [flightId, passengerId, () => service.value?.seat],
    () => {
        pendingSeat.value = '';
        activeSeat.value = service.value?.seat && !blocked(service.value.seat) ? service.value.seat : firstAvailableSeat();
    },
    { immediate: true },
);
</script>
