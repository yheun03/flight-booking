import type { AirportCode, FareId, Flight, Search, SegmentId, Passenger } from '~/types/onair';

// 모든 운항 정보와 서비스 조건은 포트폴리오 전용 가상 규칙입니다.
export const airports = [
    { value: 'ICN', label: '인천 · ICN', city: '서울', name: '인천국제공항', offset: 9, zone: 'KST' },
    { value: 'NRT', label: '도쿄 · NRT', city: '도쿄', name: '나리타국제공항', offset: 9, zone: 'JST' },
    { value: 'BKK', label: '방콕 · BKK', city: '방콕', name: '수완나품공항', offset: 7, zone: 'ICT' },
    { value: 'CDG', label: '파리 · CDG', city: '파리', name: '샤를드골공항', offset: 1, zone: 'DEMO UTC+1' },
];
export const airport = (code: AirportCode) => airports.find((item) => item.value === code)!;
export const money = (value: number) => new Intl.NumberFormat('ko-KR').format(value);
export function dateAfter(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(value: string) {
    const date = new Date(`${value}T12:00:00Z`);
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function searchError(search: Search) {
    if (
        !airports.some((item) => item.value === search.from) ||
        !airports.some((item) => item.value === search.to) ||
        search.from === search.to ||
        (search.from !== 'ICN' && search.to !== 'ICN')
    )
        return 'routeError';
    if (![1, 2].includes(search.adults)) return 'adultError';
    if (!validDate(search.departure) || search.departure < dateAfter(0)) return 'dateError';
    if (search.trip === 'roundtrip' && (!validDate(search.returning) || search.returning <= search.departure)) return 'returnError';
    return '';
}
export function passengerError(passengers: Passenger[], contact: { email: string; phone: string }, departure: string) {
    for (const passenger of passengers) {
        if (!/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(passenger.firstName.trim()) || !/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(passenger.lastName.trim()))
            return 'nameError';
        if (!validDate(passenger.birth)) return 'birthError';
        const birth = new Date(`${passenger.birth}T12:00:00Z`);
        const flight = new Date(`${departure}T12:00:00Z`);
        const age = flight.getUTCFullYear() - birth.getUTCFullYear() - (flight.toISOString().slice(5, 10) < birth.toISOString().slice(5, 10) ? 1 : 0);
        if (age < 19 || age > 120) return 'birthError';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) || !/^0\d{9,10}$/.test(contact.phone.replace(/-/g, ''))) return 'contactError';
    return '';
}
export function flightsFor(search: Search, segment: SegmentId, fare: FareId = 'light'): Flight[] {
    const from = segment === 'outbound' ? search.from : search.to;
    const to = segment === 'outbound' ? search.to : search.from;
    const date = segment === 'outbound' ? search.departure : search.returning;
    const route = from === 'ICN' ? to : from;
    const data = {
        NRT: { price: 148000, tax: 42000, miles: 15000, duration: from === 'ICN' ? 150 : 160, earned: 750, no: 101 },
        BKK: { price: 268000, tax: 62000, miles: 25000, duration: from === 'ICN' ? 380 : 340, earned: 1800, no: 201 },
        CDG: { price: 628000, tax: 112000, miles: 40000, duration: from === 'ICN' ? 870 : 765, earned: 5500, no: 301 },
    }[route as 'NRT' | 'BKK' | 'CDG'];
    if (!data || !validDate(date)) return [];
    return ['09:10', '14:30', '21:45'].map((departure, index) => {
        const departureUtc = Date.parse(`${date}T${departure}:00Z`) - airport(from).offset * 3600000;
        const arrival = new Date(departureUtc + (data.duration + airport(to).offset * 60) * 60000).toISOString();
        return {
            id: `${segment}-${date}-${index}`,
            segment,
            number: `OA${data.no + index * 2 + (from === 'ICN' ? 0 : 1)}`,
            from,
            to,
            date,
            departure,
            arrival: arrival.slice(11, 16),
            arrivalDate: arrival.slice(0, 10),
            duration: data.duration,
            aircraft: route === 'CDG' ? 'B787-9' : 'A321',
            fare,
            price: data.price + index * 17000 + { light: 0, standard: 35000, flex: 85000 }[fare],
            tax: data.tax,
            miles: data.miles + { light: 0, standard: 3000, flex: 6000 }[fare],
            earnedMiles: data.earned,
            departureUtc,
        };
    });
}
export function seatLetters(flight: Flight) {
    return flight.aircraft === 'A321' ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'];
}
export function seatBlocked(flight: Flight, seat: string) {
    const row = Number(seat.slice(0, -1));
    if (!seatLetters(flight).includes(seat.slice(-1)) || row < 1 || row > (flight.aircraft === 'A321' ? 20 : 24)) return 'unavailable';
    if (row === 10 || row === 11) return 'exit';
    return (row * 7 + seat.charCodeAt(seat.length - 1)) % 9 === 0 ? 'occupied' : '';
}
export const mealOffered = (flight: Flight) => flight.from !== 'NRT' && flight.to !== 'NRT';
export function checkinWindow(flight: Flight, demo: boolean) {
    if (demo) return true;
    const hours = (flight.departureUtc - Date.now()) / 3600000;
    return hours <= 48 && hours >= 1;
}
