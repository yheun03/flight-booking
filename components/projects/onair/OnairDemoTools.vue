<template>
    <AppButton size="sm" variant="outline" @click="open = true">{{ t('onair.demoTools') }}</AppButton>
    <AppDrawer v-model:open="open" :title="t('onair.demoTools')" :description="t('onair.demoIntro')" :width="400">
        <div class="airline__stack">
            <p class="airline__eyebrow">DEMO CONTROL PANEL</p>
            <h3>{{ t('onair.demoBalance') }} · {{ money(store.balance) }}</h3>
            <AppButton :disabled="store.processing" @click="setBalance(240000)">{{ t('onair.topUp') }}</AppButton>
            <AppButton :disabled="store.processing" @click="setBalance(100)">{{ t('onair.lowBalance') }}</AppButton>
            <AppChoice v-model="store.demo.failPayment" :disabled="store.processing" :label="t('onair.failToggle')" />
            <AppChoice v-model="store.demo.checkin" :label="t('onair.checkinToggle')" />
            <hr />
            <AppButton tone="danger" :disabled="store.processing" @click="reset">{{ t('onair.reset') }}</AppButton>
        </div>
    </AppDrawer>
</template>

<script setup lang="ts">
import { useOnairStore } from '~/stores/onair';
import { money } from '~/utils/onair';

const store = useOnairStore();
const { t } = useI18nText();
const toast = useToast();
const { openConfirm } = useModal();
const open = ref(false);
function setBalance(value: number) {
    store.balance = value;
    store.persist();
    toast.success(t('onair.saved'));
}
async function reset() {
    open.value = false;
    await nextTick();
    openConfirm({
        title: t('onair.resetTitle'),
        message: t('onair.resetConfirm'),
        confirmText: t('onair.confirm'),
        cancelText: t('onair.cancel'),
        onConfirm: () => {
            store.reset();
            toast.success(t('onair.resetDone'));
            navigateTo('/');
        },
    });
}
</script>
