<script lang="ts" setup>
defineOptions({ name: 'TaoFieldset' });

withDefaults(
    defineProps<{
        legend?: string;
        /** Подпись на верхней рамке. */
        align?: 'start' | 'center' | 'end';
    }>(),
    {
        legend: '',
        align: 'start',
    },
);
</script>

<template>
    <fieldset class="tao-fieldset" :class="`tao-fieldset--${align}`">
        <legend v-if="legend || $slots.legend" class="tao-fieldset__legend">
            <slot name="legend">{{ legend }}</slot>
        </legend>
        <div class="tao-fieldset__body">
            <slot />
        </div>
    </fieldset>
</template>

<style scoped>
.tao-fieldset {
    margin: 0;
    min-width: 0;
    padding: 0 var(--tao-space-4) var(--tao-space-4);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-panel);
    color: var(--tao-color-text);
    background: transparent;
}

.tao-fieldset__legend {
    padding: 0 var(--tao-space-2);
    font-size: var(--tao-font-size-sm);
    font-weight: 500;
    color: var(--tao-color-text);
    background: var(--tao-color-bg);
}

.tao-fieldset--start .tao-fieldset__legend {
    margin-inline-start: var(--tao-space-2);
}

.tao-fieldset--center .tao-fieldset__legend {
    margin-inline: auto;
}

.tao-fieldset--end .tao-fieldset__legend {
    margin-inline-start: auto;
    margin-inline-end: var(--tao-space-2);
}

.tao-fieldset__body {
    padding-top: var(--tao-space-3);
}
</style>
