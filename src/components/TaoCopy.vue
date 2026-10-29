<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useFloating } from '../floating';
import { useLocaleText, useTaoLocale } from '../locale';

defineOptions({ name: 'TaoCopy' });

const appLocale = useTaoLocale();

const props = withDefaults(
    defineProps<{
        text: string;
        /** Visible text after copying. / Видимый текст после копирования. */
        successText?: string;
        copyLabel?: string;
        /** Показать подсказку над кнопкой после копирования. */
        tip?: boolean;
    }>(),
    {
        successText: undefined,
        tip: true,
    },
);
const l10n = useLocaleText(props, 'copy');

const copied = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const tipRef = ref<HTMLElement | null>(null);
const { style: tipStyle } = useFloating(triggerRef, tipRef, () => copied.value && props.tip, { placement: 'top', gap: 8 });

let hideTimer = 0;
let visibleObserver: IntersectionObserver | null = null;

function hideTip() {
    copied.value = false;
    window.clearTimeout(hideTimer);
    hideTimer = 0;
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
    visibleObserver?.disconnect();
    visibleObserver = null;
});

const doneText = computed(() => props.successText ?? appLocale.value.copy.successText);
</script>

<template>
    <span ref="triggerRef" class="tao-copy" :class="{ 'tao-copy--button': !$slots.default }">
        <slot :copy="copy" :copied="copied">
            <button
                type="button"
                class="tao-copy__button"
                :class="{ 'tao-copy__button--copied': copied }"
                :aria-label="copied ? doneText : l10n.copyLabel"
                @click="copy"
            >
                <TaoIcon name="tao-copy" :size="16" />
            </button>
        </slot>

        <Teleport to="body">
            <div
                v-if="copied && tip && doneText"
                ref="tipRef"
                class="tao-copy__tip"
                role="status"
                :style="tipStyle"
            >
                {{ doneText }}
            </div>
        </Teleport>
    </span>
</template>

<style>
.tao-copy__tip {
    z-index: var(--tao-z-tooltip);
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
}

.tao-copy--button {
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
    /* selecting the text around must not catch the button label / выделение текста вокруг не захватывает подпись кнопки */
    user-select: none;
}

.tao-copy__button .tao-icon {
    display: block;
}

.tao-copy__button:hover {
    color: var(--tao-color-accent);
    background: var(--tao-color-hover);
}

.tao-copy__button--copied {
    color: var(--tao-color-accent);
}

.tao-copy__button:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}
</style>
