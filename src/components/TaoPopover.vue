<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { densityClass, resolveDensity, type TaoResolvedDensity } from '../density';
import { useDismiss } from '../dismiss';
import { useFloating, type TaoPlacement } from '../floating';
import { useLayer } from '../layers';
import { resolveSize, sizeClass, type TaoSize } from '../size';

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
// The panel is teleported to body, where the size and the density of the trigger's surroundings are not inherited: they are read
// when it opens and put on the panel, so the controls inside keep the scale of the place the popover hangs from.
// Панель телепортирована в body, где размер и плотность окружения триггера не наследуются: читаются при открытии и
// ставятся на панель, чтобы контролы внутри держали масштаб места, откуда она висит.
const panelSize = ref<TaoSize>('medium');
const panelDensity = ref<TaoResolvedDensity>('default');

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
        panelSize.value = resolveSize(triggerRef.value);
        panelDensity.value = resolveDensity(triggerRef.value);
        void nextTick(() => panelRef.value?.focus({ preventScroll: true }));
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
                :class="[sizeClass(panelSize), densityClass(panelDensity)]"
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
