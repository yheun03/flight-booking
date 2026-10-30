<template>
    <div v-if="store.booking" class="airline__stack">
        <AppTabs :model-value="flightId" :items="segments" variant="line" @update:model-value="emit('update:flightId', String($event))" />
        <div v-if="passengerId !== undefined" class="airline__passenger-switch" role="group" :aria-label="t('onair.passenger')">
            <AppButton
                v-for="(passenger, index) in store.booking.passengers"
                :key="passenger.id"
                :active="passengerId === passenger.id"
                :variant="passengerId === passenger.id ? 'soft' : 'outline'"
                :tone="passengerId === passenger.id ? 'primary' : 'gray'"
                @click="emit('update:passengerId', passenger.id)"
            >
                {{ index + 1 }}. {{ passenger.lastName }} {{ passenger.firstName }}
            </AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
const props = defineProps<{ flightId: string; passengerId?: string }>();
const emit = defineEmits<{ 'update:flightId': [string]; 'update:passengerId': [string] }>();
const store = useOnairStore();
const { t } = useI18nText();
const segments = computed(
    () =>
        store.booking?.flights.map((flight) => ({
            id: flight.id,
            title: `${t(`onair.${flight.segment}`)} · ${flight.from} → ${flight.to}`,
            description: `${flight.date} · ${flight.number}`,
        })) || [],
);
</script>
