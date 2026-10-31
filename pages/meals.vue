<template>
    <div v-if="booking && flight && service" class="airline-page airline-page--meals">
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
                    <div class="korean-meal-intro">
                        <strong>{{ cabinLabel }} 기내식 사전 주문</strong>
                        <p>항공편과 탑승객을 확인한 뒤 원하는 메뉴를 선택해 주세요.</p>
                    </div>
                    <div class="airline-meals">
                        <button v-for="(meal, index) in meals" :key="meal.id" class="airline-meal"
                            :class="{ 'is-selected': service.meal === meal.id }" type="button"
                            :disabled="service.checkedIn" :aria-pressed="service.meal === meal.id"
                            @click="openMeal(meal)">
                            <div class="airline-meal__art" :class="`airline-meal__art--${meal.id}`" aria-hidden="true">
                                <span class="airline-meal__plate">
                                    <i />
                                    <i />
                                    <i />
                                </span>
                                <span class="airline-meal__number">0{{ index + 1 }}</span>
                            </div>
                            <div class="airline-meal__info">
                                <h2>
                                    {{ meal.name }}
                                    <span>{{ service.meal === meal.id ? `✓ ${t('onair.selected')}` : t('onair.free')
                                    }}</span>
                                </h2>
                                <p>{{ meal.description }}</p>
                                <small v-if="meal.premium">사전 주문 전용</small>
                            </div>
                        </button>
                    </div>
                </template>
                <div class="airline__actions">
                    <AppButton to="/seats">{{ t('onair.seats') }}</AppButton>
                    <AppButton to="/check-in" tone="primary" variant="fill" size="lg">{{ t('onair.checkin') }} →
                    </AppButton>
                </div>
            </div>
            <OnairSummary confirmed />
        </div>
        <Teleport to="body">
            <div v-if="selectedMeal" class="korean-meal-modal" role="dialog" aria-modal="true"
                aria-labelledby="meal-detail-title" @click.self="closeMeal" @keydown.esc="closeMeal">
                <div class="korean-meal-modal__dialog">
                    <button type="button" aria-label="기내식 상세 닫기" @click="closeMeal">×</button>
                    <div class="airline-meal__art korean-meal-modal__hero"
                        :class="`airline-meal__art--${selectedMeal.id}`" aria-hidden="true">
                        <span class="airline-meal__plate"><i /><i /><i /></span>
                    </div>
                    <h2 id="meal-detail-title">{{ selectedMeal.name }}</h2>
                    <p>{{ selectedMeal.description }}</p>
                    <section v-if="selectedMeal.id === 'steak'">
                        <h3>스테이크 굽기 정도 <b>*</b></h3>
                        <div class="korean-meal-modal__pills">
                            <label v-for="item in donenessOptions" :key="item">
                                <input v-model="doneness" type="radio" name="doneness" :value="item" />
                                <span>{{ item }}</span>
                            </label>
                        </div>
                    </section>
                    <section v-if="flight.cabin !== 'economy'">
                        <h3>전채요리 선택 <b>*</b></h3>
                        <div class="korean-meal-modal__options">
                            <label v-for="item in starterOptions" :key="item">
                                <input v-model="starter" type="radio" name="starter" :value="item" />
                                <span><i aria-hidden="true" />{{ item }}</span>
                            </label>
                        </div>
                    </section>
                    <section v-if="flight.cabin !== 'economy'">
                        <h3>수프 선택 <b>*</b></h3>
                        <div class="korean-meal-modal__options korean-meal-modal__options--soup">
                            <label v-for="item in soupOptions" :key="item">
                                <input v-model="soup" type="radio" name="soup" :value="item" />
                                <span><i aria-hidden="true" />{{ item }}</span>
                            </label>
                        </div>
                    </section>
                    <AppButton variant="fill" tone="primary" size="lg" @click="confirmMeal">메뉴 선택</AppButton>
                </div>
            </div>
        </Teleport>
    </div>
    <div v-else class="airline-page">
        <div class="airline__empty">
            <span aria-hidden="true">◌</span>
            <h1>기내 서비스를 선택할 예약이 없습니다.</h1>
            <p>예약을 완료한 뒤 항공편에서 제공되는 기내 서비스를 선택할 수 있습니다.</p>
            <AppButton to="/" tone="primary" variant="fill">항공편 검색</AppButton>
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
type MealOption = { id: MealId; name: string; description: string; premium?: boolean };
const mealOptions: Record<MealId, MealOption> = {
    regular: { id: 'regular', name: '소고기 버섯 리조또', description: '따뜻한 메인 요리와 계절 샐러드' },
    vegetarian: { id: 'vegetarian', name: '구운 채소와 허브 파스타', description: '제철 채소를 사용한 담백한 채식 메뉴' },
    fruit: { id: 'fruit', name: '신선한 과일 플레이트', description: '계절 과일로 구성한 가벼운 메뉴' },
    bibimbap: { id: 'bibimbap', name: '[한식] 더덕 비빔밥과 바싹불고기', description: '향긋한 더덕과 바싹불고기를 곁들인 한식 메뉴', premium: true },
    galbi: { id: 'galbi', name: '[한식] 우엉떡갈비와 은갈치조림', description: '떡갈비와 은갈치조림으로 구성한 프리미엄 한식', premium: true },
    steak: { id: 'steak', name: '[양식] 페퍼콘소스의 필레 미뇽 스테이크', description: '필레 미뇽 스테이크와 구운 감자를 함께 제공합니다', premium: true },
    lobster: { id: 'lobster', name: '[양식] 바닷가재구이와 크래커 크럼블', description: '바닷가재와 계절 채소를 곁들인 시그니처 메뉴', premium: true },
    ginsengSoup: { id: 'ginsengSoup', name: '[한식] 가오리찜과 우거지갈비탕', description: '부드러운 가오리찜과 깊은 맛의 갈비탕', premium: true },
    vegan: { id: 'vegan', name: '[ESG] 두부떡갈비와 채개장', description: '식물성 재료로 구성한 지속 가능한 메뉴', premium: true },
};
const meals = computed(() => {
    if (flight.value?.cabin === 'first') return ['bibimbap', 'galbi', 'steak', 'lobster', 'ginsengSoup', 'vegan'].map((id) => mealOptions[id as MealId]);
    if (flight.value?.cabin === 'prestige') return ['bibimbap', 'steak', 'ginsengSoup', 'vegan'].map((id) => mealOptions[id as MealId]);
    return ['regular', 'vegetarian', 'fruit'].map((id) => mealOptions[id as MealId]);
});
const cabinLabel = computed(() => ({ economy: '일반석', prestige: '프레스티지석', first: '일등석' })[flight.value?.cabin || 'economy']);
const selectedMeal = ref<MealOption | null>(null);
const doneness = ref('미디엄');
const starter = ref('토마토 페스토를 곁들인 부라타치즈');
const soup = ref('버섯을 곁들인 소고기 맑은 수프');
const donenessOptions = ['미디엄 레어', '미디엄', '미디엄 웰', '웰던'];
const starterOptions = ['토마토 페스토를 곁들인 부라타치즈', '콜리플라워 소스의 아란치니', '비트 샐러드와 리코타 치즈'];
const soupOptions = ['버섯을 곁들인 소고기 맑은 수프', '토스카나식 판체타 수프', '토마토 수프'];
function openMeal(meal: MealOption) {
    selectedMeal.value = meal;
}
function closeMeal() {
    selectedMeal.value = null;
}
function confirmMeal() {
    if (!selectedMeal.value) return;
    const preference = flight.value?.cabin === 'economy'
        ? undefined
        : { doneness: selectedMeal.value.id === 'steak' ? doneness.value : undefined, starter: starter.value, soup: soup.value };
    if (store.selectMeal(flightId.value, passengerId.value, selectedMeal.value.id, preference)) toast.success(t('onair.mealSaved'));
    closeMeal();
}
</script>
