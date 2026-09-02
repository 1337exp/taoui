<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

defineOptions({ name: 'TaoCopy' });

const props = withDefaults(
    defineProps<{
        text: string;
        successMessage?: string;
        copyLabel?: string;
        /** Показать подсказку над кнопкой после копирования. */
        tip?: boolean;
    }>(),
    {
        successMessage: 'Скопировано!',
        copyLabel: 'Копировать',
        tip: true,
    },
);

const copied = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const tipRef = ref<HTMLElement | null>(null);
const tipStyle = ref({ top: '0px', left: '0px' });

let hideTimer = 0;
let visibleObserver: IntersectionObserver | null = null;

function hideTip() {
    copied.value = false;
    window.clearTimeout(hideTimer);
    hideTimer = 0;
}

function updateTipPosition() {
    const trigger = triggerRef.value;
    const tip = tipRef.value;
    if (!trigger || !tip) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
        hideTip();
        return;
    }

    const gap = 8;
    const pad = 8;
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let left = rect.left + rect.width / 2 - width / 2;
    let top = rect.top - height - gap;

    if (left < pad) {
        left = pad;
    }
    if (left + width > window.innerWidth - pad) {
        left = window.innerWidth - pad - width;
    }
    if (top < pad) {
        top = rect.bottom + gap;
    }

    tipStyle.value = { top: `${top}px`, left: `${left}px` };
}

function bindTipGuards() {
    window.addEventListener('scroll', updateTipPosition, true);
    window.addEventListener('resize', updateTipPosition);
}

function unbindTipGuards() {
    window.removeEventListener('scroll', updateTipPosition, true);
    window.removeEventListener('resize', updateTipPosition);
}

async function copy() {
    try {
        await navigator.clipboard.writeText(props.text);
        copied.value = true;
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(hideTip, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        hideTip();
    }
}

watch(copied, async (isCopied) => {
    if (!isCopied || !props.tip) {
        unbindTipGuards();
        return;
    }

    await nextTick();
    await nextTick();
    updateTipPosition();
    bindTipGuards();
});

onMounted(() => {
    visibleObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => !entry.isIntersecting)) {
            hideTip();
        }
    });
    if (triggerRef.value) {
        visibleObserver.observe(triggerRef.value);
    }
});

onBeforeUnmount(() => {
    hideTip();
    unbindTipGuards();
    visibleObserver?.disconnect();
    visibleObserver = null;
});
</script>

<template>
    <span ref="triggerRef" class="tao-copy">
        <slot :copy="copy" :copied="copied">
            <button
                type="button"
                class="tao-copy__button"
                :class="{ 'tao-copy__button--copied': copied }"
                :aria-label="copied ? successMessage : copyLabel"
                @click="copy"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                    <rect
                        x="8"
                        y="7"
                        width="12"
                        height="14"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                    <path
                        d="M16 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                </svg>
            </button>
        </slot>

        <Teleport to="body">
            <div
                v-if="copied && tip && successMessage"
                ref="tipRef"
                class="tao-copy__tip"
                role="status"
                :style="tipStyle"
            >
                {{ successMessage }}
            </div>
        </Teleport>
    </span>
</template>

<style>
.tao-copy__tip {
    z-index: 1060;
    position: fixed;
    padding: var(--tao-space-2) var(--tao-space-3);
    overflow: visible;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text-strong);
    font-size: var(--tao-font-size-xs);
    font-family: var(--tao-font-family);
    line-height: 1.3;
    white-space: nowrap;
    border-radius: var(--tao-radius-control);
    box-shadow: var(--tao-shadow-lg);
    pointer-events: none;
}

.tao-copy__tip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    width: 8px;
    height: 8px;
    margin-top: -4px;
    margin-left: -4px;
    background: var(--tao-color-surface-raised);
    transform: rotate(45deg);
}
</style>

<style scoped>
.tao-copy {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}

.tao-copy__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: var(--tao-radius-control);
    background: transparent;
    color: var(--tao-color-text-muted);
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-copy__button svg {
    display: block;
}

.tao-copy__button:hover {
    color: var(--tao-color-accent);
    background: var(--tao-color-surface-hover);
}

.tao-copy__button--copied {
    color: var(--tao-color-accent);
}

.tao-copy__button:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}
</style>
