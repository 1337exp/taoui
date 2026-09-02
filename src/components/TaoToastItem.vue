<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import TaoButton from './TaoButton.vue';
import TaoIcon from './TaoIcon.vue';
import { listenFocusLoss } from '../focusLoss';
import { removeToast } from '../toast/store';
import type { TaoToastRecord } from '../toast/types';

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

function close() {
    clearTimer();
    removeToast(props.toast.id);
}

function runAction(onClick: () => void) {
    onClick();
    close();
}

startTimer();

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
        :class="[`tao-toast--${toast.type}`, { 'tao-toast--paused': paused }]"
        :role="toast.type === 'error' || toast.type === 'danger' || toast.type === 'warning' ? 'alert' : 'status'"
        aria-live="polite"
        @mouseenter="pause"
        @mouseleave="resume"
    >
        <span class="tao-toast__accent" aria-hidden="true"></span>

        <span class="tao-toast__icon" aria-hidden="true">
            <TaoIcon v-if="toast.icon" :name="toast.icon" :size="18" />
            <svg v-else-if="toast.type === 'success'" viewBox="0 0 20 20" width="18" height="18" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.6" />
                <path d="M6 10.2 8.6 12.8 14 7.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else-if="toast.type === 'error' || toast.type === 'danger'" viewBox="0 0 20 20" width="18" height="18" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.6" />
                <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <svg v-else-if="toast.type === 'warning'" viewBox="0 0 20 20" width="18" height="18" fill="none">
                <path d="M10 3.5 17.5 16.5H2.5L10 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                <path d="M10 8.2v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <circle cx="10" cy="14.4" r="0.8" fill="currentColor" />
            </svg>
            <svg v-else viewBox="0 0 20 20" width="18" height="18" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.6" />
                <path d="M10 9v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <circle cx="10" cy="6.4" r="0.8" fill="currentColor" />
            </svg>
        </span>

        <div class="tao-toast__body">
            <strong v-if="toast.title" class="tao-toast__title">{{ toast.title }}</strong>
            <p v-if="toast.message" class="tao-toast__message">{{ toast.message }}</p>
            <div v-if="toast.actions.length" class="tao-toast__actions">
                <TaoButton
                    v-for="action in toast.actions"
                    :key="action.label"
                    size="small"
                    variant="secondary"
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
            aria-label="Закрыть уведомление"
            @click="close"
        >
            &times;
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
    --tao-toast-tone: var(--tao-color-accent);

    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--tao-space-3);
    width: min(470px, calc(100vw - 32px));
    padding: var(--tao-space-3) var(--tao-space-4);
    overflow: hidden;
    background: color-mix(in srgb, var(--tao-toast-tone) 8%, var(--tao-color-surface-raised));
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-overlay);
    pointer-events: auto;
}

.tao-toast--success {
    --tao-toast-tone: var(--tao-color-success);
}

.tao-toast--error,
.tao-toast--danger {
    --tao-toast-tone: var(--tao-color-danger);
}

.tao-toast--warning {
    --tao-toast-tone: var(--tao-color-warning);
}

.tao-toast--info {
    --tao-toast-tone: var(--tao-color-info);
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

.tao-toast__body {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    min-width: 0;
    flex: 1;
    padding-right: var(--tao-space-4);
}

.tao-toast__title {
    font-size: var(--tao-font-size-md);
    font-weight: 600;
    color: var(--tao-color-text-strong);
    line-height: 1.3;
}

.tao-toast__message {
    margin: 0;
    font-size: var(--tao-font-size-sm);
    line-height: 1.45;
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
