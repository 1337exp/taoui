<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { densityClass, resolveDensity, type TaoResolvedDensity } from '../density';
import { useDismiss } from '../dismiss';
import { isVirtualAnchor, useFloating, type TaoAnchor, type TaoPlacement } from '../floating';
import { useLayer } from '../layers';
import { resolveSize, sizeClass, type TaoSize } from '../size';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoPopover' });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoPopover', { onChange: 'use `v-model` (`update:modelValue`): `change` is not emitted' });

const props = withDefaults(
    defineProps<{
        /** Side and alignment against the trigger; flips when there is no room. / Сторона и выравнивание; при нехватке места переворачивается. */
        placement?: TaoPlacement;
        disabled?: boolean;
        /**
         * A virtual anchor: a point `{ x, y }` in viewport coordinates (optionally `width` / `height`) or an element to hang from
         * instead of the trigger. A point stays at its screen point; the focus goes back to what had it before opening.
         * Виртуальный якорь: точка `{ x, y }` в координатах окна (при желании `width` / `height`) или элемент вместо триггера.
         * Точка стоит на своём месте экрана; фокус возвращается туда, где был до открытия.
         */
        anchor?: TaoAnchor | null;
    }>(),
    {
        anchor: null,
        placement: 'bottom-start',
        disabled: false,
    },
);

const emit = defineEmits<{
}>();

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
// open or closed: `v-model` when the parent keeps it, a state of its own when it does not
// открыт или закрыт: `v-model`, если его держит родитель, и собственное состояние, если нет
const open = defineModel<boolean>({ default: false });
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

    open.value = next;
}

function toggle() {
    setOpen(!open.value);
}

function close() {
    setOpen(false);
}

function focusTrigger() {
    if (isVirtualAnchor(props.anchor)) {
        returnTo?.focus?.({ preventScroll: true });
        return;
    }
    const root = triggerRef.value;
    const focusable = root?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? root)?.focus?.();
}

// with a point there is no trigger to return to: remember who had the focus
// у точки нет триггера, куда вернуть фокус: запоминаем, у кого он был
let returnTo: HTMLElement | null = null;

const { style: panelStyle } = useFloating(() => props.anchor ?? triggerRef.value, panelRef, open, { placement: () => props.placement });
useDismiss(open, () => [triggerRef.value, props.anchor instanceof Element ? props.anchor : null, panelRef.value], close);
useLayer(open, {
    onEscape: () => {
        close();
        focusTrigger();
    },
});

watch(open, (isOpen) => {
    if (isOpen) {
        const host = props.anchor instanceof Element ? props.anchor : triggerRef.value;
        returnTo = isVirtualAnchor(props.anchor) && document.activeElement instanceof HTMLElement ? document.activeElement : null;
        panelSize.value = resolveSize(host);
        panelDensity.value = resolveDensity(host);
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
    /* the wheel at the end does not go on to scroll the page behind / колесо в конце не листает страницу за окном */
    overscroll-behavior: contain;
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
