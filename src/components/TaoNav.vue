<script lang="ts" setup>
import { computed, nextTick, ref, useSlots } from 'vue';
import { useLocaleText } from '../locale';
import { menuReturnsFocus, type TaoMenuCloseReason, type TaoMenuItem } from '../menu';
import type { TaoNavItem, TaoNavLayout } from '../nav';
import TaoIcon from './TaoIcon.vue';
import TaoMenu from './TaoMenu.vue';

defineOptions({ name: 'TaoNav' });

// Navigation between the sections of an app. One list of items, three looks: a bottom bar (phone), a rail with icons
// (tablet), a side panel with labels (desktop). `layout="auto"` picks the look by the width of TaoNav itself with
// container queries: no JS, nothing jumps after hydration, and it is right inside a TaoSplit pane too. Put the page
// into the default slot and TaoNav lays it out: the bar sticks to the bottom, the rail and the drawer to the side.
// Навигация между разделами приложения. Один список пунктов, три вида: нижняя панель (телефон), рейка с иконками
// (планшет), боковая панель с подписями (ПК). `layout="auto"` выбирает вид по ширине самого TaoNav через container
// queries: без JS, ничего не прыгает после гидратации, и внутри панели TaoSplit тоже верно. Страница в слоте по умолчанию:
// TaoNav раскладывает её сам, панель прилипает к низу, рейка и боковая панель — к краю.
const props = withDefaults(
    defineProps<{
        items: TaoNavItem[];
        /** The id of the current section (`aria-current="page"`). / id текущего раздела. */
        modelValue?: string;
        layout?: TaoNavLayout;
        /** The bar holds this many; with more items the last place is «More» with a menu. / Столько помещается в bar. */
        maxBarItems?: number;
        /** Accessible name of the navigation. / Имя навигации для скринридера. */
        ariaLabel?: string;
        /** The «More» entry of the bar. / Пункт «Ещё» нижней панели. */
        moreLabel?: string;
        /**
         * In the bar look, a detached pill above the page: inset from the edges and the safe area, round, with a shadow.
         * The rail and the side panel stay as they are.
         * В виде нижней панели — отдельная «пилюля» над страницей: отступ от краёв и безопасной зоны, скругление, тень.
         * Рейка и боковая панель не меняются.
         */
        floating?: boolean;
    }>(),
    {
        modelValue: undefined,
        layout: 'auto',
        maxBarItems: 5,
        ariaLabel: undefined,
        moreLabel: undefined,
        floating: false,
    },
);
const l10n = useLocaleText(props, 'nav');

const emit = defineEmits<{
    'update:modelValue': [id: string];
    /**
     * A section was picked. `event.preventDefault()` keeps a link from navigating (route it yourself).
     * Выбран раздел. `event.preventDefault()` не даёт ссылке перейти (маршрутизируйте сами).
     */
    select: [id: string, event: Event];
}>();

defineSlots<{
    /** The page: TaoNav lays it out next to the navigation. / Страница: TaoNav раскладывает её рядом с навигацией. */
    default?(): unknown;
    /** Replaces the label of one item. / Заменяет подпись пункта. */
    label?(props: { item: TaoNavItem; active: boolean }): unknown;
}>();

const slots = useSlots();
const standalone = computed(() => !slots.default);

const overflowing = computed(() => props.items.length > props.maxBarItems);
/** Items that stay on the bar when it overflows. / Пункты, что остаются на панели при переполнении. */
const barCount = computed(() => (overflowing.value ? Math.max(1, props.maxBarItems - 1) : props.items.length));
const overflowItems = computed(() => props.items.slice(barCount.value));
const activeInOverflow = computed(() => overflowItems.value.some((item) => item.id === props.modelValue));

const moreMenu = computed<TaoMenuItem[]>(() =>
    overflowItems.value.map((item) => ({ id: item.id, label: item.label, icon: item.icon, disabled: item.disabled })),
);

const moreButton = ref<HTMLElement | null>(null);
const moreOpen = ref(false);

const badgeText = (item: TaoNavItem) => (item.badge === true ? '' : String(item.badge));
const hasBadge = (item: TaoNavItem) => item.badge !== undefined && item.badge !== false && item.badge !== '';

function choose(item: TaoNavItem, event: Event) {
    if (item.disabled) {
        event.preventDefault();
        return;
    }
    emit('select', item.id, event);
    emit('update:modelValue', item.id);
}

function onMoreSelect(id: string) {
    const item = props.items.find((entry) => entry.id === id);
    if (!item) {
        return;
    }
    // a menu entry is not a link: navigate unless the app routes it itself
    // пункт меню не ссылка: переходим, если приложение не маршрутизирует само
    const event = new Event('select', { cancelable: true });
    choose(item, event);
    if (item.href && !event.defaultPrevented && typeof window !== 'undefined') {
        window.location.assign(item.href);
    }
}

function onMoreClose(reason: TaoMenuCloseReason) {
    moreOpen.value = false;
    if (menuReturnsFocus(reason)) {
        void nextTick(() => moreButton.value?.focus());
    }
}
</script>

<template>
    <div class="tao-nav" :class="[`tao-nav--${layout}`, { 'tao-nav--standalone': standalone, 'tao-nav--floating': floating }]">
        <div class="tao-nav__shell">
            <nav class="tao-nav__panel" :aria-label="l10n.ariaLabel">
                <ul class="tao-nav__list">
                    <li
                        v-for="(item, index) in items"
                        :key="item.id"
                        class="tao-nav__entry"
                        :class="{ 'tao-nav__entry--overflow': overflowing && index >= barCount }"
                    >
                        <component
                            :is="item.href ? 'a' : 'button'"
                            class="tao-nav__item"
                            :class="{ 'tao-nav__item--active': item.id === modelValue }"
                            :href="item.href && !item.disabled ? item.href : undefined"
                            :type="item.href ? undefined : 'button'"
                            :disabled="!item.href && item.disabled ? true : undefined"
                            :aria-disabled="item.href && item.disabled ? 'true' : undefined"
                            :aria-current="item.id === modelValue ? 'page' : undefined"
                            @click="choose(item, $event)"
                        >
                            <span v-if="item.icon" class="tao-nav__icon" aria-hidden="true">
                                <TaoIcon :name="item.icon" :size="20" />
                            </span>
                            <span class="tao-nav__label">
                                <slot name="label" :item="item" :active="item.id === modelValue">{{ item.label }}</slot>
                            </span>
                            <span
                                v-if="hasBadge(item)"
                                class="tao-nav__badge"
                                :class="{ 'tao-nav__badge--dot': item.badge === true }"
                                :aria-hidden="item.badge === true ? 'true' : undefined"
                            >
                                {{ badgeText(item) }}
                            </span>
                        </component>
                    </li>
                    <li v-if="overflowing" class="tao-nav__entry tao-nav__entry--more">
                        <button
                            ref="moreButton"
                            type="button"
                            class="tao-nav__item"
                            :class="{ 'tao-nav__item--active': activeInOverflow }"
                            aria-haspopup="menu"
                            :aria-expanded="moreOpen"
                            @click="moreOpen = !moreOpen"
                        >
                            <span class="tao-nav__icon" aria-hidden="true">
                                <TaoIcon name="tao-more-horizontal" :size="20" />
                            </span>
                            <span class="tao-nav__label">{{ l10n.moreLabel }}</span>
                        </button>
                    </li>
                </ul>
            </nav>
            <div v-if="!standalone" class="tao-nav__content">
                <slot />
            </div>
        </div>
        <TaoMenu
            v-if="overflowing"
            :items="moreMenu"
            :open="moreOpen"
            :anchor="moreButton"
            placement="top-end"
            :label="l10n.moreLabel"
            @select="onMoreSelect"
            @close="onMoreClose"
        />
    </div>
</template>

<style scoped>
/*
 * One DOM for the three looks: each look only sets the private --_* variables on the shell, the rules below read them.
 * `auto` sets them from container queries on .tao-nav, so the look follows the width of TaoNav, not of the window.
 * Один DOM на три вида: вид только задаёт приватные --_* на оболочке, правила ниже их читают. `auto` задаёт их
 * из container queries по .tao-nav, поэтому вид следует ширине TaoNav, а не окна.
 */
.tao-nav {
    container: tao-nav / inline-size;
    color: var(--tao-color-text);
}

/* bar */
.tao-nav--bar > .tao-nav__shell {
    --_grid: 'content' 1fr 'nav' auto / minmax(0, 1fr);
    --_panel-align: end;
    --_panel-position: sticky;
    --_list-position: static;
    --_panel-width: auto;
    --_panel-height: none;
    --_border-top: 1px;
    --_border-side: 0px;
    --_safe-bottom: env(safe-area-inset-bottom, 0px);
    --_list-direction: row;
    --_entry-flex: 1 1 0;
    --_item-direction: column;
    --_item-justify: center;
    --_label-size: var(--tao-font-size-xs);
    --_overflow-display: none;
    --_more-display: block;
    --_badge-position: absolute;
    --_badge-push: 0;
    --_bar: 1;
    --_bar-shadow: var(--tao-shadow-lg);
}

/* rail */
.tao-nav--rail > .tao-nav__shell {
    --_grid: 'nav content' 1fr / auto minmax(0, 1fr);
    --_panel-align: stretch;
    --_panel-position: relative;
    --_list-position: sticky;
    --_panel-width: 80px;
    --_panel-height: 100dvh;
    --_border-top: 0px;
    --_border-side: 1px;
    --_safe-bottom: 0px;
    --_list-direction: column;
    --_entry-flex: none;
    --_item-direction: column;
    --_item-justify: center;
    --_label-size: var(--tao-font-size-xs);
    --_overflow-display: block;
    --_more-display: none;
    --_badge-position: absolute;
    --_badge-push: 0;
    --_bar: 0;
    --_bar-shadow: none;
}

/* drawer */
.tao-nav--drawer > .tao-nav__shell {
    --_grid: 'nav content' 1fr / auto minmax(0, 1fr);
    --_panel-align: stretch;
    --_panel-position: relative;
    --_list-position: sticky;
    --_panel-width: 240px;
    --_panel-height: 100dvh;
    --_border-top: 0px;
    --_border-side: 1px;
    --_safe-bottom: 0px;
    --_list-direction: column;
    --_entry-flex: none;
    --_item-direction: row;
    --_item-justify: flex-start;
    --_label-size: var(--tao-control-font-size);
    --_overflow-display: block;
    --_more-display: none;
    --_badge-position: static;
    --_badge-push: auto;
    --_bar: 0;
    --_bar-shadow: none;
}

@container tao-nav (width < 600px) {
    .tao-nav--auto > .tao-nav__shell {
        --_grid: 'content' 1fr 'nav' auto / minmax(0, 1fr);
        --_panel-align: end;
        --_panel-position: sticky;
        --_list-position: static;
        --_panel-width: auto;
        --_panel-height: none;
        --_border-top: 1px;
        --_border-side: 0px;
        --_safe-bottom: env(safe-area-inset-bottom, 0px);
        --_list-direction: row;
        --_entry-flex: 1 1 0;
        --_item-direction: column;
        --_item-justify: center;
        --_label-size: var(--tao-font-size-xs);
        --_overflow-display: none;
        --_more-display: block;
        --_badge-position: absolute;
        --_badge-push: 0;
        --_bar: 1;
        --_bar-shadow: var(--tao-shadow-lg);
    }
}

@container tao-nav (600px <= width < 840px) {
    .tao-nav--auto > .tao-nav__shell {
        --_grid: 'nav content' 1fr / auto minmax(0, 1fr);
        --_panel-align: stretch;
        --_panel-position: relative;
        --_list-position: sticky;
        --_panel-width: 80px;
        --_panel-height: 100dvh;
        --_border-top: 0px;
        --_border-side: 1px;
        --_safe-bottom: 0px;
        --_list-direction: column;
        --_entry-flex: none;
        --_item-direction: column;
        --_item-justify: center;
        --_label-size: var(--tao-font-size-xs);
        --_overflow-display: block;
        --_more-display: none;
        --_badge-position: absolute;
        --_badge-push: 0;
        --_bar: 0;
        --_bar-shadow: none;
    }
}

@container tao-nav (width >= 840px) {
    .tao-nav--auto > .tao-nav__shell {
        --_grid: 'nav content' 1fr / auto minmax(0, 1fr);
        --_panel-align: stretch;
        --_panel-position: relative;
        --_list-position: sticky;
        --_panel-width: 240px;
        --_panel-height: 100dvh;
        --_border-top: 0px;
        --_border-side: 1px;
        --_safe-bottom: 0px;
        --_list-direction: column;
        --_entry-flex: none;
        --_item-direction: row;
        --_item-justify: flex-start;
        --_label-size: var(--tao-control-font-size);
        --_overflow-display: block;
        --_more-display: none;
        --_badge-position: static;
        --_badge-push: auto;
        --_bar: 0;
        --_bar-shadow: none;
    }
}

.tao-nav__shell {
    display: grid;
    grid-template: var(--_grid);
}

.tao-nav__content {
    grid-area: content;
    min-width: 0;
}

.tao-nav__panel {
    grid-area: nav;
    align-self: var(--_panel-align);
    position: var(--_panel-position);
    bottom: 0;
    z-index: 1;
    box-sizing: border-box;
    width: var(--_panel-width);
    padding: var(--tao-space-1) var(--tao-space-1) calc(var(--tao-space-1) + var(--_safe-bottom));
    background: var(--tao-color-surface-raised);
    border: 0 solid var(--tao-color-border);
    border-top-width: var(--_border-top);
    border-inline-end-width: var(--_border-side);
}

/* on its own (no page in the slot) it is a panel: a full border, the corners, no sticking */
.tao-nav--standalone .tao-nav__panel,
.tao-nav--standalone .tao-nav__list {
    position: static;
}

.tao-nav--standalone .tao-nav__panel {
    border-width: 1px;
    border-radius: var(--tao-radius-panel);
}

/*
 * floating: the bar look becomes a pill above the page, off the edges and above the safe area (the sticky offset, not
 * the padding, keeps it clear of the home indicator). --_bar is 1 in the bar look and 0 on the side, so the same rules
 * leave the rail and the drawer untouched in `auto`. Wider than 520px + the insets it stays 520px, centred.
 * floating: вид нижней панели становится «пилюлей» над страницей, с отступом от краёв и над безопасной зоной (от
 * индикатора «домой» её отодвигает смещение sticky, а не padding). --_bar равен 1 в виде панели и 0 сбоку, поэтому
 * те же правила в `auto` не трогают рейку и боковую панель. Шире 520px + отступы — остаётся 520px по центру.
 */
.tao-nav--floating .tao-nav__panel {
    bottom: calc(var(--_bar) * (var(--tao-space-3) + var(--_safe-bottom)));
    margin: 0 calc(var(--_bar) * max(var(--tao-space-3), (100% - 520px) / 2))
        calc(var(--_bar) * (var(--tao-space-3) + var(--_safe-bottom)));
    padding-bottom: calc(var(--tao-space-1) + (1 - var(--_bar)) * var(--_safe-bottom));
    border-top-width: max(var(--_border-top), calc(var(--_bar) * 1px));
    border-bottom-width: calc(var(--_bar) * 1px);
    border-inline-start-width: calc(var(--_bar) * 1px);
    border-inline-end-width: max(var(--_border-side), calc(var(--_bar) * 1px));
    border-radius: calc(var(--_bar) * var(--tao-radius-full));
    box-shadow: var(--_bar-shadow);
}

.tao-nav--floating.tao-nav--standalone .tao-nav__panel {
    border-width: 1px;
    border-radius: max(var(--tao-radius-panel), calc(var(--_bar) * var(--tao-radius-full)));
}

.tao-nav__list {
    /* the bar sticks as a whole; on the side the panel runs the full height and only the list sticks */
    position: var(--_list-position);
    top: 0;
    max-height: var(--_panel-height);
    overflow-y: auto;
    display: flex;
    flex-direction: var(--_list-direction);
    gap: var(--tao-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
}

.tao-nav__entry {
    flex: var(--_entry-flex);
    min-width: 0;
}

.tao-nav__entry--overflow {
    display: var(--_overflow-display);
}

.tao-nav__entry--more {
    display: var(--_more-display);
}

.tao-nav__item {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: var(--_item-direction);
    align-items: center;
    justify-content: var(--_item-justify);
    gap: var(--tao-space-1) var(--tao-space-3);
    width: 100%;
    /* a finger-sized target in every look / цель под палец в любом виде */
    min-height: 48px;
    padding: var(--tao-space-2) var(--tao-space-3);
    border: 0;
    /* concentric corners: the panel radius minus its padding / концентричные углы */
    border-radius: max(0px, calc(var(--tao-radius-panel) - var(--tao-space-1)));
    background: transparent;
    color: var(--tao-color-text-muted);
    font: inherit;
    font-size: var(--_label-size);
    line-height: 1.2;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition: var(--tao-transition-base);
    /* selecting the text around must not catch the button label / выделение текста вокруг не захватывает подпись кнопки */
    user-select: none;
}

/* in the pill the active item is a pill too / в «пилюле» активный пункт тоже «пилюля» */
.tao-nav--floating .tao-nav__item {
    border-radius: max(max(0px, calc(var(--tao-radius-panel) - var(--tao-space-1))), calc(var(--_bar) * var(--tao-radius-full)));
}

.tao-nav__item:hover {
    background: var(--tao-color-surface-hover);
    color: var(--tao-color-text);
}

.tao-nav__item--active,
.tao-nav__item--active:hover {
    background: var(--tao-color-accent-subtle);
    color: var(--tao-color-accent-text);
}

.tao-nav__item:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-nav__item:disabled,
.tao-nav__item[aria-disabled='true'] {
    color: var(--tao-color-text-disabled);
    background: transparent;
    cursor: default;
}

.tao-nav__icon {
    display: inline-flex;
    flex: none;
}

.tao-nav__label {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-nav__badge {
    position: var(--_badge-position);
    top: var(--tao-space-1);
    left: calc(50% + 6px);
    margin-inline-start: var(--_badge-push);
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    box-sizing: border-box;
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-accent);
    color: var(--tao-color-on-accent);
    font-size: 10px;
    font-weight: 600;
    line-height: 16px;
    text-align: center;
}

.tao-nav__badge--dot {
    min-width: 8px;
    width: 8px;
    height: 8px;
    padding: 0;
}

@media (prefers-reduced-motion: reduce) {
    .tao-nav__item {
        transition: none;
    }
}
</style>
