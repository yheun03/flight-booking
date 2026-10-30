import { useOnairStore } from '~/stores/onair';
import { searchError } from '~/utils/onair';

export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server || to.meta.layout !== 'airline') return;
    const store = useOnairStore();
    store.restore();
    const path = to.path.replace(/\/+$/, '') || '/';
    if (store.processing && path !== '/payment') return navigateTo('/payment', { replace: true });
    const redirect = (path: string, key: string) => {
        useToast().info(useI18nText().t(`onair.${key}`));
        return navigateTo(path, { replace: true });
    };
    if (['/flights', '/passengers', '/payment'].includes(path)) {
        if (!store.draft.searched || store.booking?.transactionId === store.draft.transactionId)
            return redirect(store.booking ? '/my-booking' : '/', 'startSearch');
        if (searchError(store.draft.search)) return redirect('/', 'dateError');
        if (path !== '/flights' && !store.flightsComplete) return redirect('/flights', 'selectAllFlights');
        if (path !== '/flights' && store.itineraryError) return redirect('/flights', 'returnTimeError');
        if (path === '/payment' && store.passengersError) return redirect('/passengers', 'completePassengers');
    }
    if (['/confirmation', '/seats', '/meals', '/check-in', '/boarding-pass', '/itinerary'].includes(path)) {
        if (!store.booking) return redirect('/my-booking', 'bookingRequired');
        if (
            path === '/boarding-pass' &&
            !Object.values(store.booking!.services).some((services) => Object.values(services).some((service) => service.checkedIn))
        )
            return redirect('/check-in', 'checkinRequired');
    }
});
