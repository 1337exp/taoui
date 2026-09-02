<script lang="ts" setup>
import type { TaoStageItem, TaoStageStatus } from '../stage';

defineOptions({ name: 'TaoStages' });

const props = withDefaults(
    defineProps<{
        items?: TaoStageItem[];
        vertical?: boolean;
        ariaLabel?: string;
    }>(),
    {
        items: () => [],
        vertical: true,
        ariaLabel: 'Стадии',
    },
);

defineSlots<{
    default(props: { item: TaoStageItem; index: number; status: TaoStageStatus }): unknown;
    icon(props: { item: TaoStageItem; index: number; status: TaoStageStatus }): unknown;
}>();

const statusText: Record<TaoStageStatus, string> = {
    wait: 'ожидание',
    work: 'в работе',
    ok: 'готово',
    bad: 'ошибка',
};

function statusOf(item: TaoStageItem): TaoStageStatus {
    if (item.status === 'danger') {
        return 'bad';
    }
    return item.status ?? 'wait';
}

function itemLabel(item: TaoStageItem): string {
    return `${item.label ?? item.key}, ${statusText[statusOf(item)]}`;
}
</script>

<template>
    <ul
        class="tao-stages"
        :class="{ 'tao-stages--horizontal': !props.vertical }"
        :aria-label="ariaLabel"
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
                    <svg v-if="statusOf(item) === 'ok'" class="tao-stages__mark" viewBox="0 0 16 16" width="14" height="14">
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.5 8.5 6.5 11.5 12.5 4.5"
                        />
                    </svg>
                    <svg v-else-if="statusOf(item) === 'bad'" class="tao-stages__mark" viewBox="0 0 16 16" width="14" height="14">
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
                        />
                    </svg>
                    <svg v-else-if="statusOf(item) === 'work'" class="tao-stages__mark" viewBox="0 0 16 16" width="14" height="14">
                        <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="20 10" stroke-linecap="round" />
                    </svg>
                    <svg v-else class="tao-stages__mark" viewBox="0 0 16 16" width="14" height="14">
                        <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6" />
                    </svg>
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
    color: var(--tao-color-success);
}

.tao-stages__item--bad .tao-stages__ico {
    color: var(--tao-color-danger);
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
