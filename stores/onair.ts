import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Booking, FareId, Flight, MealId, Passenger, Search, SegmentId } from '~/types/onair';
import { dateAfter, flightsFor, passengerError, searchError, seatBlocked, mealOffered, checkinWindow } from '~/utils/onair';

const STORAGE_KEY = 'onair:booking:v1';
const newSearch = (): Search => ({ trip: 'oneway', from: 'ICN', to: 'NRT', departure: dateAfter(7), returning: dateAfter(10), adults: 1 });
const newPassenger = (index: number): Passenger => ({ id: `p${index + 1}`, firstName: '', lastName: '', birth: '' });
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const useOnairStore = defineStore('onair', () => {
    const ready = ref(false);
    const storageError = ref(false);
    const draft = ref({
        search: newSearch(),
        searched: false,
        flights: [] as Flight[],
        passengers: [newPassenger(0)],
        contact: { email: '', phone: '' },
        transactionId: '',
    });
    const booking = ref<Booking | null>(null);
    const balance = ref(240000);
    const demo = ref({ failPayment: false, checkin: false });
    const processing = ref(false);
    const paymentMethod = ref<'card' | 'miles'>('card');
    const requiredSegments = computed<SegmentId[]>(() => (draft.value.search.trip === 'roundtrip' ? ['outbound', 'inbound'] : ['outbound']));
    const flightsComplete = computed(() => requiredSegments.value.every((id) => draft.value.flights.some((flight) => flight.segment === id)));
    const itineraryError = computed(() => {
        const outbound = draft.value.flights.find((flight) => flight.segment === 'outbound');
        const inbound = draft.value.flights.find((flight) => flight.segment === 'inbound');
        return outbound && inbound && inbound.departureUtc <= outbound.departureUtc + outbound.duration * 60000 ? 'returnTimeError' : '';
    });
    const totals = computed(() => ({
        fare: draft.value.flights.reduce((total, flight) => total + flight.price, 0) * draft.value.search.adults,
        tax: draft.value.flights.reduce((total, flight) => total + flight.tax, 0) * draft.value.search.adults,
        miles: draft.value.flights.reduce((total, flight) => total + flight.miles, 0) * draft.value.search.adults,
    }));
    const passengersError = computed(() => passengerError(draft.value.passengers, draft.value.contact, draft.value.search.departure));
    function restore() {
        if (ready.value || !import.meta.client) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (
                    saved.version !== 1 ||
                    !saved.draft?.search ||
                    !Array.isArray(saved.draft.flights) ||
                    !Array.isArray(saved.draft.passengers) ||
                    !Number.isFinite(saved.balance) ||
                    saved.balance < 0 ||
                    !saved.demo
                )
                    throw new Error('invalid');
                draft.value = saved.draft;
                booking.value = saved.booking;
                balance.value = saved.balance;
                demo.value = saved.demo;
                paymentMethod.value = saved.paymentMethod === 'miles' ? 'miles' : 'card';
            }
        } catch {
            storageError.value = true;
        }
        ready.value = true;
    }
    function persist() {
        if (!import.meta.client || !ready.value) return true;
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    version: 1,
                    draft: draft.value,
                    booking: booking.value,
                    balance: balance.value,
                    demo: demo.value,
                    paymentMethod: paymentMethod.value,
                }),
            );
            return true;
        } catch {
            storageError.value = true;
            return false;
        }
    }
    function search(next: Search) {
        const error = searchError(next);
        if (error) return error;
        const same = JSON.stringify(draft.value.search) === JSON.stringify(next);
        draft.value.search = clone(next);
        draft.value.searched = true;
        if (!same || booking.value?.transactionId === draft.value.transactionId) {
            draft.value.flights = [];
            draft.value.transactionId = crypto.randomUUID();
        }
        if (!draft.value.transactionId) draft.value.transactionId = crypto.randomUUID();
        draft.value.passengers = Array.from({ length: next.adults }, (_, index) => draft.value.passengers[index] || newPassenger(index));
        persist();
        return '';
    }
    function selectFlight(segment: SegmentId, index: number, fare: FareId) {
        const flight = flightsFor(draft.value.search, segment, fare)[index];
        if (!flight) return;
        draft.value.flights = [...draft.value.flights.filter((item) => item.segment !== segment), flight].sort((a, b) =>
            a.segment === 'outbound' ? -1 : 1,
        );
        draft.value.transactionId = crypto.randomUUID();
        persist();
    }
    function fillPassengers() {
        draft.value.passengers = draft.value.passengers.map((passenger, index) => ({
            ...passenger,
            firstName: index === 0 ? 'MINJUN' : 'SEOYEON',
            lastName: index === 0 ? 'KIM' : 'LEE',
            birth: index === 0 ? '1994-05-18' : '1996-08-22',
        }));
        draft.value.contact = { email: 'traveler@example.com', phone: '01012345678' };
        persist();
    }
    async function pay() {
        if (processing.value) return 'processing';
        if (booking.value?.transactionId === draft.value.transactionId) return 'success';
        if (!flightsComplete.value || itineraryError.value || passengersError.value || searchError(draft.value.search)) return 'invalidBooking';
        if (paymentMethod.value === 'miles' && balance.value < totals.value.miles) return 'insufficient';
        const transactionId = draft.value.transactionId;
        processing.value = true;
        try {
            await new Promise((resolve) => setTimeout(resolve, 1100));
            if (transactionId !== draft.value.transactionId) return 'invalidBooking';
            if (demo.value.failPayment) return 'paymentFailed';
            // 탭 간 결제를 직렬화하고, 예약 확정·마일 차감을 하나의 저장값으로 기록합니다.
            const commit = () => {
                const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
                if (saved?.booking?.transactionId === draft.value.transactionId) {
                    booking.value = saved.booking;
                    balance.value = saved.balance;
                    return 'success';
                }
                const currentBalance = saved?.balance ?? balance.value;
                if (paymentMethod.value === 'miles' && currentBalance < totals.value.miles) return 'insufficient';
                const previousBooking = booking.value;
                const previousBalance = balance.value;
                booking.value = {
                    id: `OA${crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`,
                    transactionId: draft.value.transactionId,
                    createdAt: new Date().toISOString(),
                    flights: clone(draft.value.flights),
                    passengers: clone(draft.value.passengers).map((passenger) => ({
                        ...passenger,
                        firstName: passenger.firstName.trim().toUpperCase(),
                        lastName: passenger.lastName.trim().toUpperCase(),
                    })),
                    contact: clone(draft.value.contact),
                    method: paymentMethod.value,
                    fare: paymentMethod.value === 'card' ? totals.value.fare : 0,
                    tax: totals.value.tax,
                    miles: paymentMethod.value === 'miles' ? totals.value.miles : 0,
                    services: Object.fromEntries(
                        draft.value.flights.map((flight) => [
                            flight.id,
                            Object.fromEntries(draft.value.passengers.map((passenger) => [passenger.id, { seat: '', meal: '', checkedIn: false }])),
                        ]),
                    ),
                };
                balance.value = currentBalance - booking.value.miles;
                if (!persist()) {
                    booking.value = previousBooking;
                    balance.value = previousBalance;
                    return 'storageFailed';
                }
                return 'success';
            };
            return navigator.locks ? await navigator.locks.request('onair-payment', commit) : commit();
        } catch {
            return 'storageFailed';
        } finally {
            processing.value = false;
        }
    }
    function assignSeat(flightId: string, passengerId: string, seat: string) {
        const flight = booking.value?.flights.find((item) => item.id === flightId);
        const services = booking.value?.services[flightId];
        if (!flight || !services?.[passengerId] || services[passengerId].checkedIn) return 'locked';
        if (seatBlocked(flight, seat) || Object.entries(services).some(([id, service]) => id !== passengerId && service.seat === seat))
            return 'seatTaken';
        services[passengerId].seat = services[passengerId].seat === seat ? '' : seat;
        persist();
        return '';
    }
    function selectMeal(flightId: string, passengerId: string, meal: MealId) {
        const service = booking.value?.services[flightId]?.[passengerId];
        const flight = booking.value?.flights.find((item) => item.id === flightId);
        if (!flight || !service || service.checkedIn || !mealOffered(flight)) return false;
        service.meal = meal;
        persist();
        return true;
    }
    function checkin(flightId: string, passengerIds: string[], consent: boolean) {
        const flight = booking.value?.flights.find((item) => item.id === flightId);
        const services = booking.value?.services[flightId];
        if (!flight || !services || !checkinWindow(flight, demo.value.checkin)) return 'checkinClosed';
        if (!consent || !passengerIds.length) return 'consentError';
        if (passengerIds.some((id) => !services[id]?.seat)) return 'seatRequired';
        passengerIds.forEach((id) => {
            services[id].checkedIn = true;
            if (!services[id].meal) services[id].meal = 'regular';
        });
        persist();
        return '';
    }
    function reset() {
        draft.value = {
            search: newSearch(),
            searched: false,
            flights: [],
            passengers: [newPassenger(0)],
            contact: { email: '', phone: '' },
            transactionId: '',
        };
        booking.value = null;
        balance.value = 240000;
        demo.value = { failPayment: false, checkin: false };
        paymentMethod.value = 'card';
        storageError.value = false;
        persist();
    }
    return {
        ready,
        storageError,
        draft,
        booking,
        balance,
        demo,
        processing,
        paymentMethod,
        requiredSegments,
        flightsComplete,
        itineraryError,
        totals,
        passengersError,
        restore,
        persist,
        search,
        selectFlight,
        fillPassengers,
        pay,
        assignSeat,
        selectMeal,
        checkin,
        reset,
    };
});
