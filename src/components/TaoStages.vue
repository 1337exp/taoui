<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed } from 'vue';
import type { TaoStageItem, TaoStageStatus } from '../stage';
import { useLocaleText, useTaoLocale } from '../locale';

defineOptions({ name: 'TaoStages' });

const appLocale = useTaoLocale();

const props = withDefaults(
    defineProps<{
        items?: TaoStageItem[];
        /** `column` (default) — steps top to bottom, `row` — left to right. / `column` — сверху вниз, `row` — слева направо. */
        direction?: 'row' | 'column';
        ariaLabel?: string;
        statusLabels?: Partial<Record<TaoStageStatus, string>>;
    }>(),
    {
        items: () => [],
        direction: 'column',
        statusLabels: () => ({}),
    },
);
const l10n = useLocaleText(props, 'stages');

defineSlots<{
    default(props: { item: TaoStageItem; index: number; status: TaoStageStatus }): unknown;
    icon(props: { item: TaoStageItem; index: number; status: TaoStageStatus }): unknown;
}>();

function statusOf(item: TaoStageItem): TaoStageStatus {
    return item.status ?? 'wait';
}

function itemLabel(item: TaoStageItem): string {
    const status = statusOf(item);
    return `${item.label ?? item.key}, ${props.statusLabels[status] ?? appLocale.value.stages.statusLabels[status]}`;
}

const isRow = computed(() => props.direction === 'row');
</script>

<template>
    <ul
        class="tao-stages"
        :class="{ 'tao-stages--horizontal': isRow }"
        :aria-label="l10n.ariaLabel"
    >
        <li
            v-for="(item, index) in items"
            :key="item.key"
            class="tao-stages__item"
            :class="`tao-stages__item--${statusOf(item)}`"
            :aria-label="itemLabel(item)"
        >
            <span class="tao-stages__ico" aria-hidden="true">
                <slot name="icon" :item="item" :index="index" :status="statusOf(item)">
                    <TaoIcon v-if="statusOf(item) === 'ok'" class="tao-stages__mark" name="tao-check" :size="14" />
                    <TaoIcon v-else-if="statusOf(item) === 'bad'" class="tao-stages__mark" name="tao-close" :size="14" />
                    <TaoIcon v-else-if="statusOf(item) === 'work'" class="tao-stages__mark" name="tao-circle-dashed" :size="14" />
                    <TaoIcon v-else class="tao-stages__mark" name="tao-circle" :size="14" />
                </slot>
            </span>
            <span class="tao-stages__label">
                <slot :item="item" :index="index" :status="statusOf(item)">{{ item.label ?? item.key }}</slot>
            </span>
        </li>
    </ul>
</template>

<style scoped>
.tao-stages {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-text);
}

.tao-stages--horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--tao-space-4);
}

.tao-stages__item {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    min-width: 0;
}

.tao-stages__ico {
    display: inline-flex;
    flex: 0 0 auto;
    color: inherit;
}

.tao-stages__mark {
    display: block;
}

.tao-stages__label {
    min-width: 0;
}

.tao-stages__item--wait {
    color: var(--tao-color-text-muted);
}

.tao-stages__item--work .tao-stages__ico {
    color: var(--tao-color-accent);
}

.tao-stages__item--ok .tao-stages__ico {
    color: var(--tao-color-success-text);
}

.tao-stages__item--bad .tao-stages__ico {
    color: var(--tao-color-danger-text);
}

.tao-stages__item--work .tao-stages__mark {
    animation: tao-stages-spin 1.1s linear infinite;
}

@keyframes tao-stages-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .tao-stages__item--work .tao-stages__mark {
        animation: none;
    }
}
</style>
