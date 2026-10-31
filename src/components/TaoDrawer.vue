<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed, nextTick, ref, useId, watch } from 'vue';
import { getFocusable, trapTab } from '../focusTrap';
import { useLayer } from '../layers';
import { useLocaleText } from '../locale';
import { releaseVelocity, sheetOffset, shouldDismissSheet, type SheetSample } from '../sheetDrag';
import { surfaceClass, type TaoSurface } from '../surface';

// class, style and the other attributes go to the panel, not to the layer around it
// class, style и остальные атрибуты — панели, а не слою вокруг неё
defineOptions({ name: 'TaoDrawer', inheritAttrs: false });

const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        title?: string;
        /**
         * `bottom` is a sheet: it rises from the bottom edge, as wide as the screen up to 640px, as tall as its content up
         * to 90% of the screen, above the safe area. The phone's own way to show options and a form.
         * `bottom` — нижний лист: поднимается от нижнего края, во всю ширину до 640px, по высоте содержимого до 90%
         * экрана, над безопасной зоной. Телефонный способ показать параметры и форму.
         */
        side?: 'left' | 'right' | 'bottom';
        /**
         * What the panel is made of, as on TaoCard: `grain` (a film grain over a solid fill), `glass` (blurred,
         * translucent; solid where blur is off).
         * Из чего сделана панель, как у TaoCard: `grain` — плёночное зерно поверх сплошной заливки, `glass` — размытое
         * стекло (сплошное, где размытия нет).
         */
        surface?: TaoSurface;
        /**
         * The user can close it: the cross, a click on the backdrop, Escape and the pull-down of a sheet. `false`: only the
         * parent closes it.
         * Пользователь может его закрыть: крестик, клик по подложке, Escape и жест «потянуть вниз» у листа. `false`: закрывает только родитель.
         */
        closable?: boolean;
        /**
         * The cross in the header. `false` hides only the cross: the backdrop, Escape and the pull-down still close it.
         * Крестик в шапке. `false` прячет только крестик: подложка, Escape и жест «вниз» по-прежнему закрывают.
         */
        showClose?: boolean;
        /**
         * `side="bottom"`: the sheet is pulled down by its grip and header, and closes when pulled far enough or flung; it
         * comes back otherwise. Needs `closable`.
         * `side="bottom"`: лист тянут вниз за ручку и шапку; он закрывается, если утянут далеко или брошен, иначе возвращается. Нужен `closable`.
         */
        swipeToClose?: boolean;
        closeLabel?: string;
    }>(),
    {
        title: '',
        side: 'right',
        surface: 'flat',
        closable: true,
        showClose: true,
        swipeToClose: true,
    },
);
const l10n = useLocaleText(props, 'drawer');

const emit = defineEmits(['update:modelValue', 'close']);

const panelRef = ref<HTMLElement | null>(null);
const rootRef = ref<HTMLElement | null>(null);
const titleId = useId();
const showCloseButton = computed(() => props.closable && props.showClose);

function close() {
    if (!props.closable) {
        return;
    }
    emit('update:modelValue', false);
    emit('close');
}

// The pull-down of a sheet: from the grip and the header (not from a button or a field in it), so the content still scrolls.
// Жест «вниз» у листа: от ручки и шапки (не от кнопки или поля в ней), поэтому содержимое по-прежнему прокручивается.
const SWIPE_FROM = '.tao-drawer__grip, .tao-drawer__header';
const SWIPE_NOT_FROM = 'button, a, input, select, textarea, label, [role="button"], [contenteditable]';
const swipeable = computed(() => props.side === 'bottom' && props.swipeToClose && props.closable);

interface SheetDrag {
    pointerId: number;
    startY: number;
    moved: boolean;
    offset: number;
    samples: SheetSample[];
}
let drag: SheetDrag | null = null;

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

function setSheet(offset: number | null, animate: boolean) {
    const panel = panelRef.value;
    if (!panel) {
        return;
    }
    panel.style.transition = animate && !reducedMotion() ? 'transform var(--tao-duration-base) var(--tao-ease-base)' : 'none';
    panel.style.transform = offset === null ? '' : `translateY(${offset}px)`;
    const height = panel.offsetHeight;
    rootRef.value?.style.setProperty('--_sheet-progress', offset && height ? String(Math.min(1, offset / height)) : '0');
}

function settleSheet() {
    setSheet(null, true);
    window.setTimeout(() => {
        if (panelRef.value && !drag) {
            panelRef.value.style.transition = '';
        }
    }, 250);
}

// keeping the pointer while it leaves the header; it may be gone already (a cancelled touch), then there is nothing to keep
// держим указатель, пока он выходит за шапку; он мог уже пропасть (отменённое касание), тогда держать нечего
function capture(pointerId: number, on: boolean) {
    try {
        if (on) {
            panelRef.value?.setPointerCapture?.(pointerId);
        } else {
            panelRef.value?.releasePointerCapture?.(pointerId);
        }
    } catch {
        /* no such pointer */
    }
}

function onPointerDown(event: PointerEvent) {
    if (!swipeable.value || drag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) {
        return;
    }
    const target = event.target as Element | null;
    if (!target?.closest(SWIPE_FROM) || target.closest(SWIPE_NOT_FROM)) {
        return;
    }
    drag = { pointerId: event.pointerId, startY: event.clientY, moved: false, offset: 0, samples: [{ t: event.timeStamp, y: event.clientY }] };
    capture(event.pointerId, true);
}

function onPointerMove(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) {
        return;
    }
    const delta = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(delta) < 4) {
        return;
    }
    drag.moved = true;
    drag.offset = sheetOffset(delta);
    drag.samples.push({ t: event.timeStamp, y: event.clientY });
    if (drag.samples.length > 8) {
        drag.samples.shift();
    }
    setSheet(drag.offset, false);
}

async function onPointerEnd(event: PointerEvent) {
    const current = drag;
    if (!current || event.pointerId !== current.pointerId) {
        return;
    }
    drag = null;
    capture(event.pointerId, false);
    if (!current.moved) {
        return;
    }
    const height = panelRef.value?.offsetHeight ?? 0;
    if (event.type === 'pointerup' && shouldDismissSheet(current.offset, height, releaseVelocity(current.samples))) {
        setSheet(height, true);
        close();
        await nextTick();
        // the parent kept it open (it refused to close): the sheet comes back / родитель оставил открытым: лист возвращается
        if (props.modelValue) {
            settleSheet();
        }
    } else {
        settleSheet();
    }
}

async function focusPanel() {
    await nextTick();
    const panel = panelRef.value;
    if (!panel) {
        return;
    }
    const first = getFocusable(panel)[0];
    (first ?? panel).focus();
}

function onKeydown(event: KeyboardEvent) {
    if (panelRef.value) {
        trapTab(event, panelRef.value);
    }
}

// Escape, the page scroll lock and the focus return belong to the layer stack (see layers.ts)
useLayer(() => props.modelValue, { lockScroll: true, restoreFocus: true, onEscape: close });

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen) {
            void focusPanel();
        }
    },
    { immediate: true },
);
</script>

<template>
    <Teleport to="body">
        <Transition :name="`tao-drawer-${side}`">
            <div v-if="modelValue" ref="rootRef" class="tao-drawer" :class="`tao-drawer--${side}`" @keydown="onKeydown">
                <div class="tao-drawer__overlay" @click="close"></div>
                <aside
                    v-bind="$attrs"
                    ref="panelRef"
                    class="tao-drawer__panel"
                    :class="surfaceClass(surface)"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="title ? titleId : undefined"
                    tabindex="-1"
                    @pointerdown="onPointerDown"
                    @pointermove="onPointerMove"
                    @pointerup="onPointerEnd"
                    @pointercancel="onPointerEnd"
                >
                    <!-- the sheet's grip: only a sign that it is a sheet / ручка листа: только знак, что это лист -->
                    <span v-if="side === 'bottom'" class="tao-drawer__grip" aria-hidden="true" />
                    <div v-if="$slots.header || title || showCloseButton" class="tao-drawer__header">
                        <!-- #header takes the whole header (a title with a counter, a filter, your own cross): `close` is the way out
                             #header занимает всю шапку (заголовок со счётчиком, фильтр, свой крестик): `close` — выход -->
                        <slot name="header" :close="close">
                            <h2 v-if="title" :id="titleId" class="tao-drawer__title">{{ title }}</h2>
                            <span v-else></span>
                            <button
                                v-if="showCloseButton"
                                type="button"
                                class="tao-drawer__close"
                                :aria-label="l10n.closeLabel"
                                @click="close"
                            >
                                <span aria-hidden="true">
                                    <slot name="close-icon"><TaoIcon name="tao-close" /></slot>
                                </span>
                            </button>
                        </slot>
                    </div>
                    <div class="tao-drawer__content">
                        <slot />
                    </div>
                    <div v-if="$slots.footer" class="tao-drawer__footer">
                        <slot name="footer" />
                    </div>
                </aside>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.tao-drawer {
    position: fixed;
    inset: 0;
    z-index: var(--tao-z-modal);
    display: flex;
}

.tao-drawer--right {
    justify-content: flex-end;
}

.tao-drawer--left {
    justify-content: flex-start;
}

.tao-drawer--bottom {
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
}

.tao-drawer__overlay {
    position: absolute;
    inset: 0;
    background: var(--tao-color-overlay);
    /* the backdrop lets go as the sheet is pulled down / подложка отпускает по мере того, как лист тянут вниз */
    opacity: calc(1 - var(--_sheet-progress, 0));
}

.tao-drawer__panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(360px, 100%);
    height: 100%;
    /* the panel colour for what sticks inside it; the surface fill when it is glass or grain
       цвет панели для того, что липнет внутри; заливка поверхности у стекла и зерна */
    --tao-drawer-bg: var(--tao-surface-fill, var(--tao-color-surface-raised));
    background-color: var(--tao-drawer-bg);
    background-image: var(--tao-surface-image, none);
    background-size: var(--tao-surface-image-size, auto);
    -webkit-backdrop-filter: var(--tao-surface-backdrop, none);
    backdrop-filter: var(--tao-surface-backdrop, none);
    box-shadow: var(--tao-surface-inset, 0 0 #0000), var(--tao-shadow-overlay);
}

.tao-drawer__panel:focus {
    outline: none;
}

/* the sheet: rounded top corners, its content's height up to 90% of the screen, the last line above the home indicator
   лист: скруглённый верх, высота по содержимому до 90% экрана, последняя строка над индикатором «домой» */
.tao-drawer--bottom .tao-drawer__panel {
    width: min(640px, 100%);
    height: auto;
    max-height: 90dvh;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    border-radius: var(--tao-radius-panel) var(--tao-radius-panel) 0 0;
}

.tao-drawer__grip {
    position: relative;
    flex: none;
    width: 36px;
    height: 4px;
    margin: var(--tao-space-2) auto 0;
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-border-strong);
}

/* a finger is wider than 4px: the grip is caught from a generous patch around it / палец шире 4px: ручку берут с щедрой площадки вокруг неё */
.tao-drawer__grip::before {
    content: '';
    position: absolute;
    inset: calc(var(--tao-space-3) * -1) calc(var(--tao-space-6) * -1);
}

/* the pull-down starts here, so the browser must not take the gesture for a scroll or a pull-to-refresh
   жест начинается здесь, и браузер не должен принимать его за прокрутку или обновление свайпом */
.tao-drawer--bottom .tao-drawer__grip,
.tao-drawer--bottom .tao-drawer__header {
    touch-action: none;
}

.tao-drawer--bottom .tao-drawer__header {
    padding-top: var(--tao-space-2);
}

.tao-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--tao-space-3);
    padding: var(--tao-space-4);
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-drawer__title {
    margin: 0;
    font-size: var(--tao-font-size-lg);
    font-weight: 600;
    color: var(--tao-color-text-strong);
}

.tao-drawer__close {
    /* the icon is an inline SVG: as a plain block the button was as tall as a text line (24px icon + the gap under the
       baseline = 28px), so the focus ring came out as a rectangle; a flex box of exactly the icon's size is square
       иконка — инлайн-SVG: простым блоком кнопка была высотой в строку текста (24px + зазор под базовой линией = 28px),
       и кольцо фокуса выходило прямоугольным; flex-бокс ровно по размеру иконки квадратный */
    /* a grid, not a flex box: inside a button Chrome keeps the icon's span `inline-flex`, and `align-items: center` put
       it 2px above the middle of the button; `place-items: center` keeps it in the middle
       сетка, а не flex: внутри button Chrome оставляет span иконки `inline-flex`, и `align-items: center` ставил её на
       2px выше середины кнопки; `place-items: center` держит её посередине */
    display: inline-grid;
    place-items: center;
    width: 1em;
    height: 1em;
    background: none;
    border: none;
    padding: 0;
    font-size: 24px;
    line-height: 1;
    color: var(--tao-color-text);
    cursor: pointer;
}

.tao-drawer__close:hover {
    color: var(--tao-color-text-strong);
}

.tao-drawer__close:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
    border-radius: var(--tao-radius-control);
}

.tao-drawer__content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--tao-space-4);
}

.tao-drawer__footer {
    padding: var(--tao-space-4);
    border-top: 1px solid var(--tao-color-border);
    display: flex;
    gap: var(--tao-space-3);
    justify-content: flex-end;
}

.tao-drawer-right-enter-active,
.tao-drawer-right-leave-active,
.tao-drawer-left-enter-active,
.tao-drawer-left-leave-active,
.tao-drawer-bottom-enter-active,
.tao-drawer-bottom-leave-active {
    transition: opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-drawer-right-enter-active .tao-drawer__panel,
.tao-drawer-right-leave-active .tao-drawer__panel,
.tao-drawer-left-enter-active .tao-drawer__panel,
.tao-drawer-left-leave-active .tao-drawer__panel,
.tao-drawer-bottom-enter-active .tao-drawer__panel,
.tao-drawer-bottom-leave-active .tao-drawer__panel {
    transition: transform var(--tao-duration-slow) var(--tao-ease-base);
}

.tao-drawer-right-enter-from,
.tao-drawer-right-leave-to,
.tao-drawer-left-enter-from,
.tao-drawer-left-leave-to,
.tao-drawer-bottom-enter-from,
.tao-drawer-bottom-leave-to {
    opacity: 0;
}

.tao-drawer-right-enter-from .tao-drawer__panel,
.tao-drawer-right-leave-to .tao-drawer__panel {
    transform: translateX(100%);
}

.tao-drawer-left-enter-from .tao-drawer__panel,
.tao-drawer-left-leave-to .tao-drawer__panel {
    transform: translateX(-100%);
}

.tao-drawer-bottom-enter-from .tao-drawer__panel,
.tao-drawer-bottom-leave-to .tao-drawer__panel {
    transform: translateY(100%);
}
</style>
