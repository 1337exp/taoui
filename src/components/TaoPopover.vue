<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

defineOptions({ name: 'TaoPopover' });

type TaoPopoverPosition = 'top' | 'bottom' | 'left' | 'right';

const props = withDefaults(
    defineProps<{
        modelValue?: boolean;
        position?: TaoPopoverPosition;
        disabled?: boolean;
    }>(),
    {
        modelValue: undefined,
        position: 'bottom',
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
const panelStyle = ref({ top: '0px', left: '0px' });
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
    void applyOpen(!open.value);
}

function close() {
    void applyOpen(false);
}

async function applyOpen(next: boolean) {
    setOpen(next);
    if (!next) {
        return;
    }

    await nextTick();
    updatePosition();
    panelRef.value?.focus();
}

function focusTrigger() {
    const root = triggerRef.value;
    const focusable = root?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? root)?.focus?.();
}

function updatePosition() {
    const trigger = triggerRef.value;
    const panel = panelRef.value;
    if (!trigger || !panel) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const gap = 4;
    const pad = 8;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    const space = {
        bottom: viewH - rect.bottom - gap - pad,
        top: rect.top - gap - pad,
        right: viewW - rect.right - gap - pad,
        left: rect.left - gap - pad,
    };
    const opposite: Record<TaoPopoverPosition, TaoPopoverPosition> = {
        bottom: 'top',
        top: 'bottom',
        left: 'right',
        right: 'left',
    };

    let side = props.position;
    const need = side === 'top' || side === 'bottom' ? height : width;
    if (space[side] < need && space[opposite[side]] > space[side]) {
        side = opposite[side];
    }

    let top = 0;
    let left = 0;
    if (side === 'bottom') {
        top = rect.bottom + gap;
        left = rect.left;
    } else if (side === 'top') {
        top = rect.top - height - gap;
        left = rect.left;
    } else if (side === 'right') {
        top = rect.top;
        left = rect.right + gap;
    } else {
        top = rect.top;
        left = rect.left - width - gap;
    }

    if (left + width > viewW - pad) {
        left = viewW - pad - width;
    }
    if (left < pad) {
        left = pad;
    }
    if (top + height > viewH - pad) {
        top = viewH - pad - height;
    }
    if (top < pad) {
        top = pad;
    }

    panelStyle.value = { top: `${top}px`, left: `${left}px` };
}

function onTriggerClick() {
    if (props.disabled) {
        return;
    }
    toggle();
}

function onDocumentPointer(event: PointerEvent) {
    const target = event.target as Node;
    if (triggerRef.value?.contains(target) || panelRef.value?.contains(target)) {
        return;
    }
    close();
}

function onDocumentKey(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
        return;
    }
    event.preventDefault();
    close();
    focusTrigger();
}

function onViewportChange() {
    if (open.value) {
        updatePosition();
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        document.addEventListener('pointerdown', onDocumentPointer);
        document.addEventListener('keydown', onDocumentKey);
        window.addEventListener('resize', onViewportChange);
        window.addEventListener('scroll', onViewportChange, true);
        return;
    }

    document.removeEventListener('pointerdown', onDocumentPointer);
    document.removeEventListener('keydown', onDocumentKey);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointer);
    document.removeEventListener('keydown', onDocumentKey);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});
</script>

<template>
    <div class="tao-popover">
        <div ref="triggerRef" class="tao-popover__trigger" @click="onTriggerClick">
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
    z-index: 1050;
    position: fixed;
    min-width: 200px;
    max-width: min(360px, calc(100vw - 16px));
    padding: var(--tao-space-3);
    overflow: auto;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-control);
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
