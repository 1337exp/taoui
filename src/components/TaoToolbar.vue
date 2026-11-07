<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, toRef, watch } from 'vue';
import { densityClass, resolveDensity, type TaoResolvedDensity } from '../density';
import { useDismiss } from '../dismiss';
import { useFloating } from '../floating';
import { frameStyle } from '../frames';
import { useLayer } from '../layers';
import { useLocaleText } from '../locale';
import { resolveSize, sizeClass, type TaoSize } from '../size';
import {
    applyRoving,
    isRadio,
    isTextField,
    planOverflow,
    stopTarget,
    toolbarKey,
    toolbarStops,
    type OverflowEntry,
    type TaoToolbarOrientation,
    type ToolbarUnit,
} from '../toolbar';
import TaoButton from './TaoButton.vue';

defineOptions({ name: 'TaoToolbar' });

const props = withDefaults(
    defineProps<{
        /** Accessible name: «Formatting», «Tools». / Доступное имя: «Форматирование», «Инструменты». */
        label?: string;
        /** The controls inside, as for any control. / Размер контролов внутри, как у любого контрола. */
        size?: TaoSize;
        /** Which arrows walk it. / Какие стрелки по ней ходят. */
        orientation?: TaoToolbarOrientation;
        /** `panel` — a raised bar of its own; `plain` — only the layout, for a toolbar inside a header. */
        variant?: 'panel' | 'plain';
        /** The frame of a `panel`; not set, it follows the frames context (`.tao-frames-soft`). / Рамка `panel`; не задан — идёт за контекстом рамок. */
        bordered?: boolean;
        /**
         * One row, never wrapped: the groups (`TaoToolbarGroup`) that do not fit go, the last one first, under a «more» button that
         * opens them in a panel. A group with `pinned` stays. Horizontal bars only.
         * Одна строка без переноса: группы, которые не влезли, уходят (последняя первой) под кнопку «more», которая открывает их
         * в панели. Группа с `pinned` остаётся. Только горизонтальные панели.
         */
        overflow?: boolean;
        /** Name of the «more» button; not set, the text of the locale. / Имя кнопки «more»; не задано — текст локали. */
        overflowLabel?: string;
    }>(),
    {
        label: undefined,
        size: undefined,
        orientation: 'horizontal',
        variant: 'panel',
        bordered: undefined,
        overflow: false,
        overflowLabel: undefined,
    },
);

const l10n = useLocaleText(props, 'toolbar');

// does the overflow mode work here: it is asked for and the bar lies in a row / работает ли режим: он включён и панель лежит в строку
const managed = computed(() => props.overflow && props.orientation === 'horizontal');

const root = ref<HTMLElement | null>(null);
const moreHost = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const menuEl = ref<HTMLElement | null>(null);

/**
 * The roving tabindex and the arrows of one set of stops: the bar itself and, apart, the menu with the groups that left it.
 * Roving tabindex и стрелки одного набора остановок: самой панели и, отдельно, меню с ушедшими группами.
 */
function createRoving(getRoot: () => HTMLElement | null) {
    // the stop that keeps the Tab order: the last one the focus was on / остановка в порядке Tab — последняя, где был фокус
    let current = 0;

    function refresh() {
        const el = getRoot();
        if (!el) {
            return;
        }
        const stops = toolbarStops(el);
        current = Math.min(current, Math.max(0, stops.length - 1));
        applyRoving(stops, current);
    }

    function onFocusin(event: FocusEvent) {
        const el = getRoot();
        if (!el) {
            return;
        }
        const stops = toolbarStops(el);
        const index = stops.findIndex((stop) => stop.els.includes(event.target as HTMLElement));
        if (index !== -1 && index !== current) {
            current = index;
            applyRoving(stops, current);
        }
    }

    function onKeydown(event: KeyboardEvent) {
        const el = getRoot();
        if (!el || event.altKey || event.ctrlKey || event.metaKey || isTextField(event.target)) {
            return;
        }
        const vertical = props.orientation === 'vertical';
        const next = vertical ? 'ArrowDown' : 'ArrowRight';
        const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
        if (![next, prev, 'Home', 'End'].includes(event.key)) {
            return;
        }

        const stops = toolbarStops(el);
        const target = event.target as HTMLElement;
        const index = stops.findIndex((stop) => stop.els.includes(target));
        if (index === -1) {
            return;
        }

        // inside a radio group the arrows pick the option natively; only past its edge do they move on
        // внутри группы радио стрелки выбирают вариант сами; дальше идём только с её края
        const stop = stops[index];
        if (isRadio(target) && (event.key === next || event.key === prev)) {
            const edge = event.key === next ? stop.els[stop.els.length - 1] : stop.els[0];
            if (target !== edge) {
                return;
            }
        }

        let to: number;
        if (event.key === 'Home') {
            to = 0;
        } else if (event.key === 'End') {
            to = stops.length - 1;
        } else {
            to = (index + (event.key === next ? 1 : -1) + stops.length) % stops.length;
        }
        event.preventDefault();
        current = to;
        applyRoving(stops, current);
        stopTarget(stops[to]).focus();
    }

    function focusFirst() {
        const el = getRoot();
        const stops = el ? toolbarStops(el) : [];
        if (!stops.length) {
            return false;
        }
        current = 0;
        applyRoving(stops, current);
        stopTarget(stops[0]).focus({ preventScroll: true });
        return true;
    }

    return { refresh, onFocusin, onKeydown, focusFirst };
}

const bar = createRoving(() => root.value);
const menu = createRoving(() => menuEl.value);

// ── overflow ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const units: ToolbarUnit[] = [];
const anyAway = ref(false);
const open = ref(false);
const panelSize = ref<TaoSize>('medium');
const panelDensity = ref<TaoResolvedDensity>('default');
// the width of the «more» button once it was seen; until then the height of a control (the button is a square) / ширина кнопки «more»
let moreWidth = 0;
let measureQueued = false;
let resizeObserver: ResizeObserver | undefined;

function register(unit: ToolbarUnit) {
    units.push(unit);
    schedule();
    return () => {
        units.splice(units.indexOf(unit), 1);
        schedule();
    };
}

provide(toolbarKey, { orientation: toRef(props, 'orientation'), overflow: managed, menuEl, register });

function outerWidth(el: HTMLElement): number {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width + (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0);
}

function observeUnits() {
    if (!resizeObserver) {
        return;
    }
    for (const unit of units) {
        // a group host has no box (display: contents): its first child is the thing that has a size / у хоста группы нет бокса
        const target = unit.kind === 'group' ? unit.el.value?.firstElementChild : unit.el.value;
        if (target) {
            resizeObserver.observe(target);
        }
    }
}

/** Looks at the row, decides which groups stay, writes it to the units. Safe to call any time: same row, same answer. */
async function measure() {
    const el = root.value;
    if (!managed.value || !el || el.clientWidth === 0) {
        return;
    }
    const style = getComputedStyle(el);
    const gap = parseFloat(style.columnGap) || 0;
    const available = el.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
    if (moreHost.value && !moreHost.value.hasAttribute('data-tao-away')) {
        moreWidth = outerWidth(moreHost.value);
    }
    const more = moreWidth || parseFloat(style.getPropertyValue('--tao-control-height')) || 36;

    const found: { unit?: ToolbarUnit }[] = [];
    const entries: OverflowEntry[] = [];
    for (const child of Array.from(el.children) as HTMLElement[]) {
        if (child === moreHost.value) {
            continue;
        }
        const unit = units.find((u) => u.el.value === child);
        if (unit) {
            // a unit in the row is measured; one that went keeps the width it had (its box is gone)
            // часть в строке мерим; ушедшая помнит прежнюю ширину (её бокса больше нет)
            const inner = unit.kind === 'group' ? child.firstElementChild : child;
            if (!unit.away.value && inner instanceof HTMLElement) {
                unit.width = outerWidth(inner);
            }
            found.push({ unit });
            entries.push({ kind: unit.kind, width: unit.width, pinned: unit.pinned.value });
        } else {
            const width = outerWidth(child);
            if (width > 0) {
                found.push({});
                entries.push({ kind: 'loose', width });
            }
        }
    }

    const plan = planOverflow(entries, available, gap, more);
    const active = document.activeElement;
    const hadFocus = Boolean(active && active !== document.body && (el.contains(active) || panel.value?.contains(active)));

    let order = 0;
    found.forEach(({ unit }, i) => {
        if (!unit) {
            return;
        }
        const away = plan.has(i);
        if (unit.away.value !== away) {
            unit.away.value = away;
        }
        if (away && unit.kind === 'group') {
            unit.order.value = order;
            unit.first.value = order === 0;
            order += 1;
        }
    });
    if (anyAway.value !== plan.size > 0) {
        anyAway.value = plan.size > 0;
    }
    observeUnits();

    await nextTick();
    // a button that had the focus went into the menu (or came back): the move drops the focus, so give it back to the bar
    // кнопка с фокусом ушла в меню (или вернулась): перенос роняет фокус, возвращаем его панели
    const now = document.activeElement;
    if (hadFocus && (!now || now === document.body || now.closest('[data-tao-away]'))) {
        const button = moreHost.value?.querySelector<HTMLElement>('button');
        if (anyAway.value && button) {
            button.focus({ preventScroll: true });
        } else {
            bar.focusFirst();
        }
    }
    bar.refresh();
    menu.refresh();
    if (moreHost.value && !moreHost.value.hasAttribute('data-tao-away') && outerWidth(moreHost.value) !== moreWidth) {
        // the button showed up with a width that was a guess: once more with the real one / кнопка появилась, ширина была догадкой
        schedule();
    }
}

function schedule() {
    if (measureQueued || typeof window === 'undefined') {
        return;
    }
    measureQueued = true;
    void nextTick(() => {
        measureQueued = false;
        void measure();
    });
}

function reset() {
    open.value = false;
    for (const unit of units) {
        unit.away.value = false;
    }
    anyAway.value = false;
}

/** After a change that makes every remembered width wrong (the size): everything back in the row, then measure. */
async function remeasureAll() {
    reset();
    await nextTick();
    void measure();
}

watch(managed, (on) => {
    if (on) {
        schedule();
    } else {
        reset();
    }
});
watch(() => props.size, () => managed.value && void remeasureAll());
watch(anyAway, (any) => {
    if (!any) {
        open.value = false;
    }
});

// ── the menu ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function focusMore() {
    moreHost.value?.querySelector<HTMLElement>('button')?.focus();
}

function close() {
    open.value = false;
}

function toggle() {
    open.value = !open.value;
}

const { style: panelStyle, update } = useFloating(moreHost, panel, open, { placement: 'bottom-end' });
const layer = useLayer(open, {
    onEscape: () => {
        close();
        focusMore();
    },
});
// a pointer down inside a panel that opened from a button of a hidden group (a colour list) is not «outside»: that panel is above
// this one, and so is anything the app marks with `data-tao-keep-open`
// нажатие внутри панели, открытой кнопкой скрытой группы (список цветов), не «снаружи»: она выше этой, как и всё,
// что приложение пометило `data-tao-keep-open`
useDismiss(
    open,
    () => [
        moreHost.value,
        panel.value,
        ...(layer.isTop() ? Array.from(document.querySelectorAll('[data-tao-keep-open]')) : [document.body]),
    ],
    close,
);

watch(open, async (isOpen) => {
    if (!isOpen) {
        return;
    }
    panelSize.value = resolveSize(root.value);
    panelDensity.value = resolveDensity(root.value);
    // the panel is drawn, then the groups move into it, then it is measured and the first button gets the focus
    // панель рисуется, потом в неё переезжают группы, потом она измеряется и первая кнопка получает фокус
    await nextTick();
    await nextTick();
    menu.refresh();
    update();
    if (!menu.focusFirst()) {
        panel.value?.focus({ preventScroll: true });
    }
});

let menuObserver: MutationObserver | undefined;
watch(menuEl, (el) => {
    menuObserver?.disconnect();
    menuObserver = undefined;
    if (el && typeof MutationObserver !== 'undefined') {
        menuObserver = new MutationObserver(() => menu.refresh());
        menuObserver.observe(el, { childList: true, subtree: true, attributeFilter: ['disabled', 'aria-disabled'] });
    }
});

/**
 * Makes a control of the bar visible and returns it: a control of a group that went under «more» opens the menu first. The element
 * is the same one in both places, so an app that anchors a list to a button anchors it to what the person sees.
 * Делает элемент панели видимым и возвращает его: элемент группы, ушедшей под «more», сначала открывает меню. Элемент один и
 * тот же в обоих местах, поэтому список, привязанный к кнопке, привязан к тому, что видит человек.
 */
async function reveal<T extends HTMLElement>(el: T): Promise<T> {
    if (root.value?.contains(el) && el.closest('[data-tao-away]')) {
        open.value = true;
        await nextTick();
        await nextTick();
    }
    return el;
}

defineExpose({ reveal });

let observer: MutationObserver | undefined;

onMounted(() => {
    bar.refresh();
    if (typeof MutationObserver !== 'undefined' && root.value) {
        // items come and go with the slot, and a button turns disabled / элементы приходят со слотом, кнопки выключаются
        observer = new MutationObserver(() => {
            bar.refresh();
            if (managed.value) {
                schedule();
            }
        });
        observer.observe(root.value, { childList: true, subtree: true, attributeFilter: ['disabled', 'aria-disabled'] });
    }
    if (typeof ResizeObserver !== 'undefined' && root.value) {
        resizeObserver = new ResizeObserver(() => schedule());
        resizeObserver.observe(root.value);
    }
    if (managed.value) {
        // before the first paint: the bar is measured in the same task it is mounted in, so it never shows «all, then folded»
        // до первой отрисовки: панель мерится в той же задаче, где смонтирована, поэтому не мигает «всё, потом свернулось»
        void measure();
    }
});

onBeforeUnmount(() => {
    observer?.disconnect();
    menuObserver?.disconnect();
    resizeObserver?.disconnect();
});
</script>

<template>
    <div
        ref="root"
        class="tao-toolbar"
        :class="[sizeClass(size), `tao-toolbar--${variant}`, `tao-toolbar--${orientation}`, { 'tao-toolbar--overflow': managed }]"
        role="toolbar"
        :aria-label="label"
        :aria-orientation="orientation"
        :style="frameStyle(bordered)"
        @focusin="bar.onFocusin"
        @keydown="bar.onKeydown"
    >
        <slot />
        <div v-if="managed" ref="moreHost" class="tao-toolbar__more" :data-tao-away="anyAway ? undefined : ''">
            <TaoButton
                variant="ghost"
                tone="neutral"
                icon="tao-more-vertical"
                :aria-label="overflowLabel ?? l10n.overflowLabel"
                aria-haspopup="dialog"
                :aria-expanded="open"
                @click="toggle"
            />
        </div>

        <Teleport v-if="managed" to="body">
            <div
                v-if="open && anyAway"
                ref="panel"
                class="tao-toolbar__menu"
                :class="[sizeClass(panelSize), densityClass(panelDensity)]"
                role="dialog"
                tabindex="-1"
                :aria-label="overflowLabel ?? l10n.overflowLabel"
                :style="panelStyle"
            >
                <div
                    ref="menuEl"
                    class="tao-toolbar__menu-body"
                    role="toolbar"
                    :aria-label="overflowLabel ?? l10n.overflowLabel"
                    @focusin="menu.onFocusin"
                    @keydown="menu.onKeydown"
                />
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.tao-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--tao-space-1);
    color: var(--tao-color-text);
}

.tao-toolbar--vertical {
    flex-direction: column;
    align-items: stretch;
}

.tao-toolbar--panel {
    padding: var(--tao-space-1);
    background: var(--tao-color-surface-raised);
    border: 1px solid color-mix(in srgb, var(--tao-color-border) var(--tao-frame-alpha, 100%), transparent);
    /* concentric corners: the controls' radius plus the padding / концентричные углы: радиус контролов плюс отступ */
    border-radius: calc(var(--tao-radius-control) + var(--tao-space-1));
}

.tao-toolbar--horizontal.tao-toolbar--panel {
    width: fit-content;
    max-width: 100%;
}

/* one row; what does not fit is folded by the script, and what still sticks out (pinned groups) is clipped, not wrapped */
/* одна строка; что не влезло, сворачивает скрипт, а что всё равно торчит (закреплённые), обрезается, а не переносится */
/* it fills the width it is given: that width is what it measures, so it must not depend on what is left in it (fit-content would
   shrink with the folded groups and never unfold them) / занимает выданную ширину: её и меряет, поэтому она не должна зависеть
   от того, что в панели осталось (fit-content сжимался бы вместе со свёрнутыми группами и никогда не разворачивал их) */
.tao-toolbar--horizontal.tao-toolbar--overflow {
    box-sizing: border-box;
    flex-wrap: nowrap;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: clip;
    overflow-clip-margin: 4px;
}

.tao-toolbar__more {
    flex: none;
}

.tao-toolbar__more[data-tao-away] {
    display: none;
}

.tao-toolbar__menu {
    z-index: var(--tao-z-popup);
    position: fixed;
    max-width: min(360px, calc(100vw - 16px));
    padding: var(--tao-space-2);
    overflow: auto;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-overlay);
}

.tao-toolbar__menu:focus {
    outline: none;
}

.tao-toolbar__menu-body {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
}
</style>
