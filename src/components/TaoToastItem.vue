<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import TaoButton from './TaoButton.vue';
import TaoIcon from './TaoIcon.vue';
import { useTaoLocale } from '../locale';
import { removeToast, toastDefaults } from '../toast/store';
import type { TaoToastRecord } from '../toast/types';
import { surfaceClass } from '../surface';
import { toneClass } from '../tone';

defineOptions({ name: 'TaoToastItem' });

const props = defineProps<{
    toast: TaoToastRecord;
}>();

// the label of the cross: `toast.defaults({ closeLabel })`, otherwise the locale in effect where the viewport stands
// подпись крестика: `toast.defaults({ closeLabel })`, иначе локаль, действующая там, где стоит viewport
const locale = useTaoLocale();
const closeLabel = computed(() => toastDefaults.closeLabel ?? locale.value.toast.closeLabel);

const paused = ref(false);
let remaining = props.toast.timeout;
let startedAt = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

function clearTimer() {
    if (timer !== null) {
        clearTimeout(timer);
        timer = null;
    }
}

function startTimer() {
    if (!props.toast.timeout) {
        return;
    }

    startedAt = Date.now();
    clearTimer();
    timer = setTimeout(() => removeToast(props.toast.id), remaining);
}

function pause() {
    if (paused.value || !props.toast.timeout) {
        return;
    }

    remaining = Math.max(0, remaining - (Date.now() - startedAt));
    paused.value = true;
    clearTimer();
}

function resume() {
    if (!paused.value || !props.toast.timeout) {
        return;
    }

    paused.value = false;
    startTimer();
}

// WCAG 2.2.1 (timing adjustable): the time stops while the pointer is over the toast and while the focus is inside it (the close button,
// an action), so a keyboard user is not outrun either; it runs again when both have left
// WCAG 2.2.1 (настраиваемое время): время стоит, пока над тостом указатель и пока в нём фокус (кнопка закрытия, действие), чтобы
// пользователь клавиатуры тоже не опоздал; оно идёт снова, когда ушли и указатель, и фокус
const hovered = ref(false);
const focusedInside = ref(false);
function onEnter() {
    hovered.value = true;
    pause();
}
function onLeave() {
    hovered.value = false;
    if (!focusedInside.value && !away.value) {
        resume();
    }
}
function onFocusIn() {
    focusedInside.value = true;
    pause();
}
function onFocusOut(event: FocusEvent) {
    if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
        return;
    }
    focusedInside.value = false;
    if (!hovered.value && !away.value) {
        resume();
    }
}

// a snackbar: no title and an action — the text and the action share one line, the action at the end, as a text
// button (Material, iOS); a long text wraps and the action goes under it, still at the end
// snackbar: без заголовка и с действием — текст и действие в одной строке, действие в конце, текстовой кнопкой; длинный
// текст переносится, и действие уходит под него, всё так же в конце
const inline = computed(() => !props.toast.title && props.toast.actions.length > 0);
// a neutral toast has no icon of its own: «Note deleted» needs none / у нейтрального тоста нет своей иконки
const hasIcon = computed(() => props.toast.loading || Boolean(props.toast.icon) || props.toast.type !== 'neutral');

function close() {
    clearTimer();
    removeToast(props.toast.id);
}

function runAction(onClick: () => void) {
    onClick();
    close();
}

startTimer();

// replaced in place (a loading toast finished): the new content gets its own full time
// заменён на месте (тост загрузки завершился): у нового содержимого своё полное время
watch(
    () => props.toast,
    (next, prev) => {
        if (next === prev) return;
        clearTimer();
        remaining = next.timeout;
        paused.value = false;
        startTimer();
        // the new content is as much under the pointer, the focus or the absence as the old one was
        // новое содержимое так же под указателем, фокусом или отсутствием, как было старое
        if (hovered.value || focusedInside.value || away.value) {
            pause();
        }
    },
);

// While the user cannot see the page (the tab is hidden, the window lost the focus) the time stands, as in Sonner: coming back to an empty corner
// would take away the extension the hover gave. A hover that the window swallowed (no `mouseleave` comes) is asked again on return.
// Пока пользователь не видит страницу (вкладка скрыта, окно потеряло фокус), время стоит, как у Sonner: вернуться к пустому углу значило бы
// отнять продление, которое давало наведение. Наведение, проглоченное окном (`mouseleave` не придёт), на возврате спрашивается заново.
const rootEl = ref<HTMLElement | null>(null);
const away = ref(false);
const isAway = () => document.hidden || !document.hasFocus();
function goAway() {
    away.value = true;
    hovered.value = false;
    pause();
}
function comeBack() {
    if (isAway()) {
        return;
    }
    away.value = false;
    hovered.value = Boolean(rootEl.value?.matches(':hover'));
    if (!hovered.value && !focusedInside.value) {
        resume();
    }
}
function onVisibility() {
    if (document.hidden) {
        goAway();
    } else {
        comeBack();
    }
}
onMounted(() => {
    // a toast that appears in a window nobody looks at (a background tab) does not count its time down: the user comes back to it whole
    // тост, возникший в окне, на которое никто не смотрит (фоновая вкладка), не отсчитывает время: пользователь вернётся к целому
    if (isAway()) {
        goAway();
    }
    window.addEventListener('blur', goAway);
    window.addEventListener('pagehide', goAway);
    window.addEventListener('pageshow', comeBack);
    window.addEventListener('focus', comeBack);
    document.addEventListener('visibilitychange', onVisibility);
});

onBeforeUnmount(() => {
    window.removeEventListener('blur', goAway);
    window.removeEventListener('pagehide', goAway);
    window.removeEventListener('pageshow', comeBack);
    window.removeEventListener('focus', comeBack);
    document.removeEventListener('visibilitychange', onVisibility);
    clearTimer();
});
</script>

<template>
    <div
        ref="rootEl"
        class="tao-toast"
        :class="[toneClass(toast.type === 'neutral' ? undefined : toast.type), surfaceClass(toast.surface), { 'tao-toast--paused': paused }]"
        :role="toast.type === 'danger' || toast.type === 'warning' ? 'alert' : 'status'"
        :aria-busy="toast.loading || undefined"
        @mouseenter="onEnter"
        @mouseleave="onLeave"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
    >
        <span v-if="hasIcon" class="tao-toast__icon" aria-hidden="true">
            <span v-if="toast.loading" class="tao-toast__spinner"></span>
            <TaoIcon v-else-if="toast.icon" :name="toast.icon" :size="18" />
            <TaoIcon v-else-if="toast.type === 'success'" name="tao-check-circle" :size="18" />
            <TaoIcon v-else-if="toast.type === 'danger'" name="tao-x-circle" :size="18" />
            <TaoIcon v-else-if="toast.type === 'warning'" name="tao-alert-triangle" :size="18" />
            <TaoIcon v-else name="tao-info" :size="18" />
        </span>

        <div class="tao-toast__body" :class="{ 'tao-toast__body--inline': inline, 'tao-toast__body--closable': toast.closable }">
            <strong v-if="toast.title" class="tao-toast__title">{{ toast.title }}</strong>
            <p v-if="toast.message" class="tao-toast__message">{{ toast.message }}</p>
            <div v-if="toast.actions.length" class="tao-toast__actions">
                <TaoButton
                    v-for="action in toast.actions"
                    :key="action.label"
                    size="small"
                    :variant="inline ? 'text' : 'secondary'"
                    @click="runAction(action.onClick)"
                >
                    {{ action.label }}
                </TaoButton>
            </div>
        </div>

        <button
            v-if="toast.closable"
            type="button"
            class="tao-toast__close"
            :aria-label="closeLabel"
            @click="close"
        >
            <TaoIcon name="tao-close" />
        </button>

        <span
            v-if="toast.progress && toast.timeout"
            class="tao-toast__progress"
            :style="{ animationDuration: `${toast.timeout}ms` }"
        ></span>
    </div>
</template>

<style scoped>
.tao-toast {
    --tao-toast-tone: var(--tao-tone);
    /* how far the progress line stays from the rounded corners: it lies on the straight part and is not cut by the
       curve; `--tao-toast-edge: 0` brings the flush look back
       насколько шкала времени отступает от скруглённых углов: она лежит на прямой части и не режется кривой;
       `--tao-toast-edge: 0` возвращает прежний вид */
    --_edge: var(--tao-toast-edge, min(round(calc(var(--tao-radius-panel) * 0.6), 1px), var(--tao-space-6)));

    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--tao-space-3);
    width: min(470px, calc(100vw - 32px));
    /* even, so a centred toast stands on a whole pixel (see TaoToastViewport) / чётная, чтобы тост по центру стоял на целом пикселе */
    width: min(470px, round(down, 100vw - 32px, 2px));
    padding: var(--tao-space-3) var(--tao-space-4);
    overflow: hidden;
    background-color: var(--tao-surface-fill, color-mix(in srgb, var(--tao-toast-tone) 8%, var(--tao-color-surface-raised)));
    background-image: var(--tao-surface-image, none);
    background-size: var(--tao-surface-image-size, auto);
    -webkit-backdrop-filter: var(--tao-surface-backdrop, none);
    backdrop-filter: var(--tao-surface-backdrop, none);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-toast-shadow, 0 2px 8px rgb(0 0 0 / 0.12));
    pointer-events: auto;
    /* a loading toast that finishes changes its tone in place: the colours follow, they do not jump
       тост загрузки, закончившись, меняет тон на месте: цвета переходят плавно, а не прыгают */
    transition:
        background-color var(--tao-duration-slow) var(--tao-ease-base),
        border-color var(--tao-duration-slow) var(--tao-ease-base);
}

/* Glass keeps the tone tint; its own edge replaces the border. / Стекло сохраняет оттенок тона; край стекла вместо рамки. */
.tao-toast.tao-surface-glass {
    --tao-surface-fill: color-mix(in srgb, var(--tao-toast-tone) 10%, var(--tao-glass-fill));
    border-color: var(--tao-glass-border);
    box-shadow: var(--tao-toast-shadow, 0 2px 8px rgb(0 0 0 / 0.12));
}

.tao-toast__icon {
    display: inline-flex;
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--tao-toast-tone);
    transition: color var(--tao-duration-slow) var(--tao-ease-base);
}

/* the ring gives way to the result icon: it comes in, it does not pop / кольцо уступает место значку результата: он появляется плавно */
.tao-toast__icon > :not(.tao-toast__spinner) {
    animation: tao-toast-icon-in var(--tao-duration-base) var(--tao-ease-base) both;
}

@keyframes tao-toast-icon-in {
    from {
        opacity: 0;
        transform: scale(0.7);
    }
}

/* the spinner of a loading toast: a ring the size of the icons / кольцо загрузки размером с иконку */
.tao-toast__spinner {
    box-sizing: border-box;
    width: 18px;
    height: 18px;
    border: 2px solid color-mix(in srgb, var(--tao-color-accent) 25%, transparent);
    border-top-color: var(--tao-color-accent);
    border-radius: 50%;
    animation: tao-toast-spin 0.8s linear infinite;
}

@keyframes tao-toast-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .tao-toast__spinner {
        animation-duration: 2.4s;
    }

    .tao-toast,
    .tao-toast__icon {
        transition: none;
    }

    .tao-toast__icon > :not(.tao-toast__spinner) {
        animation: none;
    }
}

.tao-toast__body {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    min-width: 0;
    flex: 1;
}

/* room for the cross in the corner / место под крестик в углу */
.tao-toast__body--closable {
    padding-right: var(--tao-space-4);
}

.tao-toast__body--inline {
    flex-direction: row;
    flex-wrap: wrap;
    /* the text and the action on one baseline: centred, a 19px line and an 18px button stood half a pixel apart
       текст и действие на одной базовой линии: по центру строка 19px и кнопка 18px расходились на полпикселя */
    align-items: baseline;
    column-gap: var(--tao-space-4);
}

.tao-toast__body--inline .tao-toast__message {
    flex: 1 1 12em;
}

.tao-toast__body--inline .tao-toast__actions {
    margin-top: 0;
    margin-inline-start: auto;
}

.tao-toast__title {
    font-size: var(--tao-font-size-md);
    font-weight: 600;
    color: var(--tao-color-text-strong);
    line-height: 1.3;
    /* whole-pixel lines: see the message / строки в целых пикселях: см. текст ниже */
    line-height: round(1.3em, 1px);
}

.tao-toast__message {
    margin: 0;
    font-size: var(--tao-font-size-sm);
    line-height: 1.45;
    /* Whole-pixel lines (1.45 × 14px was 20.3px), so the toast's height is whole and a centred or bottom toast stands on
       a whole pixel: on a fractional one the text snapped by a pixel when the first hover repainted it. The plain value
       above is for a browser without round().
       Строки в целых пикселях (1.45 × 14px было 20.3px), поэтому высота тоста целая и тост по центру или снизу стоит
       на целом пикселе: на дробном текст перескакивал на пиксель, когда первое наведение его перерисовывало. Простое
       значение выше — для браузера без round(). */
    line-height: round(1.45em, 1px);
    color: var(--tao-color-text);
}

.tao-toast__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--tao-space-2);
    margin-top: var(--tao-space-1);
}

.tao-toast__close {
    position: absolute;
    top: var(--tao-space-1);
    right: var(--tao-space-2);
    /* a 24px target at least (WCAG 2.2, 2.5.8): the cross itself stays 20px / цель не меньше 24px (WCAG 2.2, 2.5.8): сам крестик остаётся 20px */
    display: inline-grid;
    place-items: center;
    min-width: 24px;
    min-height: 24px;
    padding: 0;
    border: none;
    background: none;
    color: var(--tao-color-text-muted);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
}

.tao-toast__close:hover {
    color: var(--tao-color-text-strong);
}

.tao-toast__progress {
    position: absolute;
    left: var(--_edge);
    right: var(--_edge);
    bottom: 0;
    height: 2px;
    border-radius: var(--tao-radius-full);
    transform-origin: left center;
    background: var(--tao-toast-tone);
    animation-name: tao-toast-progress;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
}

.tao-toast--paused .tao-toast__progress {
    animation-play-state: paused;
}

@keyframes tao-toast-progress {
    from {
        transform: scaleX(1);
    }
    to {
        transform: scaleX(0);
    }
}
</style>
