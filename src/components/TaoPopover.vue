<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useDismiss } from '../dismiss';
import { useFloating, type TaoPlacement } from '../floating';
import { useLayer } from '../layers';

defineOptions({ name: 'TaoPopover' });

const props = withDefaults(
    defineProps<{
        modelValue?: boolean;
        /** Side and alignment against the trigger; flips when there is no room. / Сторона и выравнивание; при нехватке места переворачивается. */
        placement?: TaoPlacement;
        disabled?: boolean;
    }>(),
    {
        modelValue: undefined,
        placement: 'bottom-start',
        disabled: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    change: [value: boolean];
}>();

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const internal = ref(false);
const isControlled = computed(() => props.modelValue !== undefined);
const open = computed(() => (isControlled.value ? Boolean(props.modelValue) : internal.value));

function setOpen(next: boolean) {
    if (props.disabled && next) {
        return;
    }

    if (!isControlled.value) {
        internal.value = next;
    }
    emit('update:modelValue', next);
    emit('change', next);
}

function toggle() {
    setOpen(!open.value);
}

function close() {
    setOpen(false);
}

function focusTrigger() {
    const root = triggerRef.value;
    const focusable = root?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? root)?.focus?.();
}

const { style: panelStyle } = useFloating(triggerRef, panelRef, open, { placement: () => props.placement });
useDismiss(open, () => [triggerRef.value, panelRef.value], close);
useLayer(open, {
    onEscape: () => {
        close();
        focusTrigger();
    },
});

watch(open, (isOpen) => {
    if (isOpen) {
        void nextTick(() => panelRef.value?.focus());
    }
});
</script>

<template>
    <div class="tao-popover">
        <div ref="triggerRef" class="tao-popover__trigger" @click="toggle">
            <slot name="trigger" :open="open" :toggle="toggle" />
        </div>

        <Teleport to="body">
            <div
                v-if="open"
                ref="panelRef"
                class="tao-popover__panel"
                role="dialog"
                tabindex="-1"
                :style="panelStyle"
            >
                <slot />
            </div>
        </Teleport>
    </div>
</template>

<style>
.tao-popover__panel {
    z-index: var(--tao-z-popup);
    position: fixed;
    min-width: 200px;
    max-width: min(360px, calc(100vw - 16px));
    padding: var(--tao-space-3);
    overflow: auto;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-overlay);
}

.tao-popover__panel:focus {
    outline: none;
}

.tao-popover__panel:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}
</style>

<style scoped>
.tao-popover {
    display: inline-block;
}

.tao-popover__trigger {
    display: inline-block;
}
</style>
