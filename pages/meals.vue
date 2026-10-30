<template>
    <div v-if="booking && flight && service" class="airline-page">
        <header class="airline-page__heading">
            <p class="airline__eyebrow">A TASTE OF YOUR JOURNEY</p>
            <h1>{{ t('onair.meals') }}</h1>
            <p>{{ t('onair.mealsDesc') }}</p>
        </header>
        <div class="airline__columns">
            <div class="airline__stack">
                <OnairServiceSelector v-model:flight-id="flightId" v-model:passenger-id="passengerId" />
                <p v-if="service.checkedIn" class="airline__notice" role="status">{{ t('onair.locked') }}</p>
                <div v-if="!mealOffered(flight)" class="airline__empty airline__panel">
                    <span aria-hidden="true">◌</span>
                    <h2>{{ t('onair.notOffered') }}</h2>
                    <p>{{ t('onair.mealNotOffered') }}</p>
                </div>
                <template v-else>
                    <p class="airline__notice">{{ t('onair.mealDefault') }}</p>
                    <div class="airline-meals">
                        <button
                            v-for="(meal, index) in meals"
                            :key="meal"
                            class="airline-meal"
                            :class="{ 'is-selected': service.meal === meal }"
                            type="button"
                            :disabled="service.checkedIn"
                            :aria-pressed="service.meal === meal"
                            @click="choose(meal)"
                        >
                            <div class="airline-meal__art" :class="`airline-meal__art--${meal}`" aria-hidden="true">
                                <span class="airline-meal__plate">
                                    <i />
                                    <i />
                                    <i />
                                </span>
                                <span class="airline-meal__number">0{{ index + 1 }}</span>
                            </div>
                            <div class="airline-meal__info">
                                <h2>
                                    {{ t(`onair.${meal}`) }}
                                    <span>{{ service.meal === meal ? `✓ ${t('onair.selected')}` : t('onair.free') }}</span>
                                </h2>
                                <p>{{ t(`onair.${meal}Desc`) }}</p>
                            </div>
                        </button>
                    </div>
                </template>
                <div class="airline__actions">
                    <AppButton to="/seats">{{ t('onair.seats') }}</AppButton>
                    <AppButton to="/check-in" tone="primary" variant="fill" size="lg">{{ t('onair.checkin') }} →</AppButton>
                </div>
            </div>
            <OnairSummary confirmed />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { mealOffered } from '~/utils/onair';
import type { MealId } from '~/types/onair';

definePageMeta({ layout: 'airline' });
useHead({ title: '기내식 선택' });
const store = useOnairStore();
const { t } = useI18nText();
const toast = useToast();
const booking = computed(() => store.booking!);
const flightId = ref(booking.value?.flights[0].id || '');
const passengerId = ref(booking.value?.passengers[0].id || '');
const flight = computed(() => booking.value?.flights.find((item) => item.id === flightId.value));
const service = computed(() => booking.value?.services[flightId.value]?.[passengerId.value]);
const meals: MealId[] = ['regular', 'vegetarian', 'fruit'];
function choose(meal: MealId) {
    if (store.selectMeal(flightId.value, passengerId.value, meal)) toast.success(t('onair.mealSaved'));
}
</script>
