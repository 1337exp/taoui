<script lang="ts" setup>
import { computed } from 'vue';
import { sizeClass, type TaoSize } from '../size';
import { timelineState, type TaoTimelineAlign, type TaoTimelineItem, type TaoTimelineState } from '../timeline';
import { toneClass } from '../tone';
import TaoIcon from './TaoIcon.vue';

defineOptions({ name: 'TaoTimeline' });

// A vertical feed of events: an order's steps, a project's releases, an activity log. A marker on a line per event.
// With `active` the line is filled up to the current event and the events after it are upcoming (a progress);
// without it the feed is a log of the past. An ordered list, the time in <time>, the current event aria-current.
// Вертикальная лента событий: шаги заказа, релизы, журнал. Маркер на линии на каждое событие. С `active` линия залита
// до текущего события, а следующие ждут (прогресс); без него лента — журнал прошедшего.
const props = withDefaults(
    defineProps<{
        items: TaoTimelineItem[];
        /** The id of the current event. / id текущего события. */
        active?: string;
        /** `alternate` folds into `start` below 480px of its own width. / `alternate` складывается в `start` уже 480px. */
        align?: TaoTimelineAlign;
        /** Without it the size of ancestors. / Без него — размер предков. */
        size?: TaoSize;
    }>(),
    {
        active: undefined,
        align: 'start',
        size: undefined,
    },
);

interface ItemSlot {
    item: TaoTimelineItem;
    index: number;
    state: TaoTimelineState;
    active: boolean;
}

defineSlots<{
    /** The marker on the line. / Маркер на линии. */
    marker?(props: ItemSlot): unknown;
    /** The title line. / Строка заголовка. */
    title?(props: ItemSlot): unknown;
    /** Anything under the description: links, a card, buttons. / Что угодно под описанием. */
    content?(props: ItemSlot): unknown;
}>();

const activeIndex = computed(() => (props.active === undefined ? -1 : props.items.findIndex((item) => item.id === props.active)));

const slotProps = (item: TaoTimelineItem, index: number): ItemSlot => {
    const state = timelineState(index, activeIndex.value);
    return { item, index, state, active: state === 'current' };
};
</script>

<template>
    <ol class="tao-timeline" :class="[`tao-timeline--${align}`, sizeClass(size), { 'tao-timeline--progress': activeIndex >= 0 }]">
        <li
            v-for="(item, index) in items"
            :key="item.id"
            class="tao-timeline__item"
            :class="[`tao-timeline__item--${slotProps(item, index).state}`, { 'tao-timeline__item--far': index % 2 === 1 }]"
            :aria-current="slotProps(item, index).active ? 'step' : undefined"
        >
            <div class="tao-timeline__rail" aria-hidden="true">
                <span
                    class="tao-timeline__marker"
                    :class="[toneClass(item.tone), { 'tao-timeline__marker--icon': item.icon || $slots.marker }]"
                >
                    <slot name="marker" v-bind="slotProps(item, index)">
                        <TaoIcon v-if="item.icon" :name="item.icon" />
                    </slot>
                </span>
                <span v-if="index < items.length - 1" class="tao-timeline__line"></span>
            </div>
            <div class="tao-timeline__body">
                <time v-if="item.time" class="tao-timeline__time" :datetime="item.datetime">{{ item.time }}</time>
                <div class="tao-timeline__title">
                    <slot name="title" v-bind="slotProps(item, index)">{{ item.title }}</slot>
                </div>
                <p v-if="item.description" class="tao-timeline__description">{{ item.description }}</p>
                <slot name="content" v-bind="slotProps(item, index)" />
            </div>
        </li>
    </ol>
</template>

<style scoped>
.tao-timeline {
    --_rail: calc(var(--tao-control-height) * 0.66);
    --_dot: calc(var(--_rail) * 0.5);
    container: tao-timeline / inline-size;
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--tao-color-text);
    font-size: var(--tao-control-font-size);
}

.tao-timeline__item {
    display: grid;
    grid-template-columns: var(--_rail) minmax(0, 1fr);
    column-gap: var(--tao-space-3);
}

/* ---------- the rail: a marker and the line down to the next one / рейка: маркер и линия до следующего ---------- */

.tao-timeline__rail {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tao-timeline__marker {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: var(--_dot);
    height: var(--_dot);
    /* centred on the first text line / по центру первой строки текста */
    margin-top: calc((1.5em - var(--_dot)) / 2);
    border: 2px solid var(--tao-tone);
    border-radius: var(--tao-radius-full);
    background: var(--tao-tone);
    color: var(--tao-tone-on);
    font-size: calc(var(--_rail) * 0.5);
}

.tao-timeline__marker--icon {
    width: var(--_rail);
    height: var(--_rail);
    margin-top: calc((1.5em - var(--_rail)) / 2);
}

.tao-timeline__line {
    flex: 1;
    width: 2px;
    min-height: var(--tao-space-4);
    margin: var(--tao-space-1) 0;
    border-radius: 1px;
    background: var(--tao-color-border);
}

/* progress: the line is filled up to the current event, the events after it wait */
.tao-timeline--progress .tao-timeline__item--done .tao-timeline__line {
    background: var(--tao-color-accent);
}

.tao-timeline__item--current .tao-timeline__marker {
    box-shadow: 0 0 0 4px var(--tao-tone-wash);
}

.tao-timeline__item--upcoming .tao-timeline__marker {
    border-color: var(--tao-color-border-strong);
    background: var(--tao-color-surface);
    color: var(--tao-color-text-muted);
}

.tao-timeline__item--upcoming .tao-timeline__title {
    color: var(--tao-color-text-muted);
}

/* ---------- the text / текст ---------- */

.tao-timeline__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding-bottom: var(--tao-space-5);
    line-height: 1.5;
}

.tao-timeline__item:last-child .tao-timeline__body {
    padding-bottom: 0;
}

.tao-timeline__time {
    font-size: var(--tao-control-font-size-secondary);
    font-variant-numeric: tabular-nums;
    color: var(--tao-color-text-muted);
}

.tao-timeline__title {
    font-weight: 600;
    color: var(--tao-color-text-strong);
}

.tao-timeline__description {
    margin: 0;
    color: var(--tao-color-text-muted);
}

/* ---------- alternate: the events on both sides of the line / по обе стороны линии ---------- */

@container tao-timeline (width >= 480px) {
    .tao-timeline--alternate .tao-timeline__item {
        grid-template-columns: minmax(0, 1fr) var(--_rail) minmax(0, 1fr);
    }

    .tao-timeline--alternate .tao-timeline__rail {
        grid-column: 2;
        grid-row: 1;
    }

    .tao-timeline--alternate .tao-timeline__body {
        grid-column: 3;
        grid-row: 1;
    }

    .tao-timeline--alternate .tao-timeline__item--far .tao-timeline__body {
        grid-column: 1;
        align-items: flex-end;
        text-align: end;
    }
}
</style>
