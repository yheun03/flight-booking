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
                <span class="airline-hero__edition">YOUR JOURNEY, ON AIR. &nbsp; / &nbsp; 001</span>
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
                    <path d="m445 104 65-31-14-64-15 5Z" fill="#2458dc" />
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
            <form @submit.prevent="submit">
                <div class="airline-search__top">
                    <div class="airline__inline">
                        <AppChoice v-model="form.trip" type="radio" name="trip" value="oneway" :label="t('onair.oneway')" />
                        <AppChoice v-model="form.trip" type="radio" name="trip" value="roundtrip" :label="t('onair.roundtrip')" />
                    </div>
                    <span>{{ t('onair.searchHint') }}</span>
                </div>
                <div class="airline-search__fields">
                    <AppSelect v-model="form.from" id="departure-airport" :label="t('onair.from')" :items="airports" required />
                    <AppButton class="airline-search__swap" unstyled :aria-label="t('onair.swap')" @click="swap">⇄</AppButton>
                    <AppSelect v-model="form.to" id="arrival-airport" :label="t('onair.to')" :items="airports" required />
                    <AppDatePicker
                        :model-value="form.departure"
                        id="departure-date"
                        :label="t('onair.departureDate')"
                        :min="dateAfter(0)"
                        @update:model-value="form.departure = String($event || '')"
                    />
                    <AppDatePicker
                        v-if="form.trip === 'roundtrip'"
                        :model-value="form.returning"
                        id="return-date"
                        :label="t('onair.returnDate')"
                        :min="form.departure"
                        @update:model-value="form.returning = String($event || '')"
                    />
                    <AppSelect v-model="form.adults" id="travelers" :label="t('onair.travelers')" :items="travelerOptions" required />
                    <AppButton class="airline-search__submit" type="submit" variant="fill" tone="primary" size="lg">
                        {{ t('onair.searchFlights') }}
                        <span aria-hidden="true">↗</span>
                    </AppButton>
                </div>
                <p v-if="error" id="search-error" class="airline__error" role="alert" tabindex="-1">{{ t(`onair.${error}`) }}</p>
            </form>
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
                <button
                    v-for="destination in destinations"
                    :key="destination.code"
                    class="airline-destination"
                    :class="`airline-destination--${destination.key}`"
                    type="button"
                    @click="chooseDestination(destination.code)"
                >
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
        <div class="airline-home__note">
            <span aria-hidden="true">✳</span>
            <p>{{ t('onair.demoIntro') }}</p>
            <span>DESIGNED FOR THE JOURNEY.</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { airports, dateAfter, money } from '~/utils/onair';
import type { AirportCode } from '~/types/onair';

definePageMeta({ layout: 'airline' });
const store = useOnairStore();
const { t } = useI18nText();
const form = reactive({ ...store.draft.search });
const error = ref('');
watch(
    () => store.draft.search,
    (search) => {
        Object.assign(form, search);
        error.value = '';
    },
);
const travelerOptions = computed(() => [
    { value: 1, label: t('onair.adultOne') },
    { value: 2, label: t('onair.adultTwo') },
]);
const destinations = [
    { code: 'NRT' as AirportCode, key: 'tokyo', english: 'TOKYO', price: 190000 },
    { code: 'BKK' as AirportCode, key: 'bangkok', english: 'BANGKOK', price: 330000 },
    { code: 'CDG' as AirportCode, key: 'paris', english: 'PARIS', price: 740000 },
];
function swap() {
    [form.from, form.to] = [form.to, form.from];
}
function chooseDestination(code: AirportCode) {
    form.from = 'ICN';
    form.to = code;
    document.getElementById('departure-date')?.focus();
    document.querySelector('.airline-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
async function submit() {
    error.value = store.search(form);
    if (error.value) {
        await nextTick();
        document.getElementById('search-error')?.focus();
        return;
    }
    await navigateTo('/flights');
}
</script>
