import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { useOnairStore } from '../stores/onair';
import { dateAfter, flightsFor, searchError, validDate, seatBlocked, checkinWindow } from '../utils/onair';

const saved = new Map<string, string>();
Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value) },
});
const fresh = () => {
    setActivePinia(createPinia());
    const store = useOnairStore();
    store.restore();
    return store;
};
let passed = 0;
async function test(title: string, run: () => void | Promise<void>) {
    await run();
    passed++;
    console.log(`✓ ${title}`);
}
const store = fresh();
await test('매일 운항·역방향·현지 시각 및 날짜 변경', () => {
    for (const to of ['NRT', 'BKK', 'CDG'] as const) {
        const search = { ...store.draft.search, to, trip: 'roundtrip' as const };
        assert.equal(flightsFor(search, 'outbound').length, 3);
        assert.equal(flightsFor(search, 'inbound')[0].from, to);
        assert.equal(flightsFor(search, 'outbound')[0].arrival, { NRT: '11:40', BKK: '13:30', CDG: '15:40' }[to]);
    }
    const night = flightsFor(store.draft.search, 'outbound')[2];
    assert.ok(night.arrivalDate > night.date);
    assert.equal(validDate('2026-02-30'), false);
    assert.equal(searchError({ ...store.draft.search, to: 'ICN' }), 'routeError');
    assert.equal(searchError({ ...store.draft.search, departure: '2000-01-01' }), 'dateError');
    assert.equal(searchError({ ...store.draft.search, trip: 'roundtrip', returning: store.draft.search.departure }), 'returnError');
});
await test('편도 1인 카드 결제·연속 클릭·새로고침 후 멱등성', async () => {
    assert.equal(store.search(store.draft.search), '');
    store.selectFlight('outbound', 0, 'light');
    store.fillPassengers();
    const first = store.pay();
    assert.equal(await store.pay(), 'processing');
    assert.equal(await first, 'success');
    assert.equal(store.booking?.fare, 148000);
    assert.equal(store.booking?.tax, 42000);
    assert.equal(store.balance, 240000);
    const id = store.booking!.id;
    assert.equal(await store.pay(), 'success');
    assert.equal(store.booking!.id, id);
    const restored = fresh();
    assert.equal(restored.booking!.id, id);
    assert.equal(restored.draft.passengers[0].firstName, 'MINJUN');
});
await test('3–3 좌석·점유/비상구 차단·체크인 선행 조건·잠금', () => {
    const flight = store.booking!.flights[0];
    assert.equal(store.assignSeat(flight.id, 'p1', '10A'), 'seatTaken');
    const occupied = Array.from({ length: 6 }, (_, i) => `1${'ABCDEF'[i]}`).find((seat) => seatBlocked(flight, seat));
    assert.ok(occupied);
    assert.equal(store.assignSeat(flight.id, 'p1', occupied!), 'seatTaken');
    store.demo.checkin = true;
    assert.equal(store.checkin(flight.id, ['p1'], true), 'seatRequired');
    assert.equal(store.assignSeat(flight.id, 'p1', '1B'), '');
    assert.equal(store.checkin(flight.id, ['p1'], false), 'consentError');
    assert.equal(store.checkin(flight.id, ['p1'], true), '');
    assert.equal(store.booking!.services[flight.id].p1.meal, 'regular');
    assert.equal(store.assignSeat(flight.id, 'p1', '2A'), 'locked');
    assert.equal(store.selectMeal(flight.id, 'p1', 'fruit'), false);
    assert.equal(checkinWindow(flight, false), false);
});
await test('왕복 2인·마일 부족·결제 실패 후 입력 유지·성공 시만 차감', async () => {
    store.reset();
    assert.equal(store.search({ ...store.draft.search, trip: 'roundtrip', to: 'CDG', adults: 2 }), '');
    store.selectFlight('outbound', 0, 'standard');
    store.selectFlight('inbound', 1, 'light');
    store.fillPassengers();
    assert.equal(store.flightsComplete, true);
    assert.equal(store.draft.passengers.length, 2);
    assert.equal(store.totals.miles, 166000);
    assert.equal(store.totals.tax, 448000);
    store.paymentMethod = 'miles';
    store.balance = 100;
    store.persist();
    assert.equal(await store.pay(), 'insufficient');
    assert.equal(store.booking, null);
    assert.equal(store.balance, 100);
    store.balance = 200000;
    store.demo.failPayment = true;
    store.persist();
    assert.equal(await store.pay(), 'paymentFailed');
    assert.equal(store.booking, null);
    assert.equal(store.balance, 200000);
    assert.equal(store.draft.passengers[1].firstName, 'SEOYEON');
    store.demo.failPayment = false;
    store.persist();
    assert.equal(await store.pay(), 'success');
    assert.equal(store.balance, 34000);
    assert.equal(store.booking!.tax, 448000);
    assert.equal(store.booking!.fare, 0);
    await store.pay();
    assert.equal(store.balance, 34000);
});
await test('왕복 2인·3–3–3 좌석 중복 방지·구간 및 탑승객별 기내식 격리', () => {
    const [outbound, inbound] = store.booking!.flights;
    assert.equal(outbound.aircraft, 'B787-9');
    assert.equal(store.assignSeat(outbound.id, 'p1', '1B'), '');
    assert.equal(store.assignSeat(outbound.id, 'p2', '1B'), 'seatTaken');
    assert.equal(store.assignSeat(outbound.id, 'p2', '1C'), '');
    assert.equal(store.assignSeat(inbound.id, 'p1', '2A'), '');
    assert.equal(store.assignSeat(inbound.id, 'p2', '2B'), '');
    store.selectMeal(outbound.id, 'p1', 'fruit');
    store.selectMeal(outbound.id, 'p2', 'vegetarian');
    store.selectMeal(inbound.id, 'p2', 'fruit');
    assert.equal(store.booking!.services[outbound.id].p1.meal, 'fruit');
    assert.equal(store.booking!.services[inbound.id].p1.meal, '');
    store.demo.checkin = true;
    assert.equal(store.checkin(outbound.id, ['p1'], true), '');
    assert.equal(store.booking!.services[outbound.id].p2.checkedIn, false);
    assert.equal(store.booking!.services[inbound.id].p1.checkedIn, false);
    assert.equal(store.selectMeal(outbound.id, 'p1', 'regular'), false);
    assert.equal(store.selectMeal(outbound.id, 'p2', 'regular'), true);
    assert.equal(store.checkin(outbound.id, ['p2'], true), '');
    assert.equal(store.checkin(inbound.id, ['p1', 'p2'], true), '');
});
await test('결제 전 항공편 변경 후 운임 재계산·승객 유지·확정 예약 격리', () => {
    const oldId = store.booking!.id;
    const oldPrice = store.booking!.flights[0].price;
    store.search({ ...store.draft.search, departure: dateAfter(12), returning: dateAfter(16) });
    assert.equal(store.draft.flights.length, 0);
    assert.equal(store.flightsComplete, false);
    store.selectFlight('outbound', 2, 'flex');
    assert.equal(store.totals.fare, (628000 + 34000 + 85000) * 2);
    assert.equal(store.draft.passengers[0].firstName, 'MINJUN');
    assert.equal(store.booking!.id, oldId);
    assert.equal(store.booking!.flights[0].price, oldPrice);
});
await test('결제 처리 중 새로고침·재시도에도 같은 예약과 한 번의 마일 차감', async () => {
    store.reset();
    store.search({ ...store.draft.search, to: 'BKK' });
    store.selectFlight('outbound', 0, 'light');
    store.fillPassengers();
    store.paymentMethod = 'miles';
    store.persist();
    const pending = store.pay();
    const restored = fresh();
    assert.equal(restored.processing, false);
    const retry = restored.pay();
    assert.equal(await pending, 'success');
    assert.equal(await retry, 'success');
    assert.equal(store.booking!.id, restored.booking!.id);
    assert.equal(restored.balance, 215000);
});
await test('저장 공간 오류 시 예약 확정과 마일 차감을 롤백', async () => {
    store.reset();
    store.search(store.draft.search);
    store.selectFlight('outbound', 0, 'light');
    store.fillPassengers();
    store.paymentMethod = 'miles';
    store.persist();
    const original = localStorage.setItem;
    localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
    };
    assert.equal(await store.pay(), 'storageFailed');
    assert.equal(store.booking, null);
    assert.equal(store.balance, 240000);
    localStorage.setItem = original;
});
await test('역방향 장거리 왕복의 시간 역전 조합 차단', () => {
    store.reset();
    store.search({ ...store.draft.search, from: 'CDG', to: 'ICN', trip: 'roundtrip', departure: dateAfter(7), returning: dateAfter(8) });
    store.selectFlight('outbound', 2, 'light');
    store.selectFlight('inbound', 0, 'light');
    assert.equal(store.itineraryError, 'returnTimeError');
    store.selectFlight('inbound', 2, 'light');
    assert.equal(store.itineraryError, '');
});
console.log(`${passed} scenarios passed.`);
