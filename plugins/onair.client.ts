import { useOnairStore } from '~/stores/onair';

export default defineNuxtPlugin(() => {
    const store = useOnairStore();
    store.restore();
    store.$subscribe(() => store.persist(), { detached: true, flush: 'post' });
});
