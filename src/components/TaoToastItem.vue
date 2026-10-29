<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import TaoButton from './TaoButton.vue';
import TaoIcon from './TaoIcon.vue';
import { listenFocusLoss } from '../focusLoss';
import { removeToast, toastDefaults } from '../toast/store';
import type { TaoToastRecord } from '../toast/types';
import { surfaceClass } from '../surface';
import { toneClass } from '../tone';

defineOptions({ name: 'TaoToastItem' });

const props = defineProps<{
    toast: TaoToastRecord;
}>();

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
    },
);

let stopFocusLoss: (() => void) | undefined;
onMounted(() => {
    stopFocusLoss = listenFocusLoss(resume);
});

onBeforeUnmount(() => {
    stopFocusLoss?.();
    clearTimer();
});
</script>

<template>
    <div
        class="tao-toast"
        :class="[toneClass(toast.type === 'neutral' ? undefined : toast.type), surfaceClass(toast.surface), { 'tao-toast--paused': paused }]"
        :role="toast.type === 'danger' || toast.type === 'warning' ? 'alert' : 'status'"
        aria-live="polite"
        :aria-busy="toast.loading || undefined"
        @mouseenter="pause"
        @mouseleave="resume"
    >
        <span class="tao-toast__accent" aria-hidden="true"></span>

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
            :aria-label="toastDefaults.closeLabel"
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

    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--tao-space-3);
    width: min(470px, calc(100vw - 32px));
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
}

/* Glass keeps the tone tint; its own edge replaces the border. / Стекло сохраняет оттенок тона; край стекла вместо рамки. */
.tao-toast.tao-surface-glass {
    --tao-surface-fill: color-mix(in srgb, var(--tao-toast-tone) 10%, var(--tao-glass-fill));
    border-color: var(--tao-glass-border);
    box-shadow: var(--tao-toast-shadow, 0 2px 8px rgb(0 0 0 / 0.12));
}

.tao-toast__accent {
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--tao-toast-tone);
}

.tao-toast__icon {
    display: inline-flex;
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--tao-toast-tone);
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
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
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
