<script lang="ts" setup>
defineOptions({ name: 'TaoEmpty' });

withDefaults(
    defineProps<{
        title?: string;
    }>(),
    {
        title: 'Ничего нет',
    },
);
</script>

<template>
    <div class="tao-empty">
        <div v-if="$slots.icon" class="tao-empty__icon">
            <slot name="icon" />
        </div>
        <p v-if="title" class="tao-empty__title">{{ title }}</p>
        <p v-if="$slots.default" class="tao-empty__text"><slot /></p>
        <div v-if="$slots.action" class="tao-empty__action">
            <slot name="action" />
        </div>
    </div>
</template>

<style scoped>
.tao-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--tao-space-2);
    padding: var(--tao-space-8) var(--tao-space-4);
    text-align: center;
}

.tao-empty__icon {
    color: var(--tao-color-text-muted);
    font-size: 32px;
    line-height: 1;
}

.tao-empty__title {
    margin: 0;
    font-size: var(--tao-font-size-lg);
    font-weight: 600;
    color: var(--tao-color-text-strong);
}

.tao-empty__text {
    margin: 0;
    max-width: 36ch;
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text-muted);
    line-height: 1.5;
}

.tao-empty__action {
    margin-top: var(--tao-space-2);
}
</style>
