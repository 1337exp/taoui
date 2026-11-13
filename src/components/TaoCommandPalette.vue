<script lang="ts" setup>
import type { TaoCommandItem } from '../commandPalette';
import { useLayer } from '../layers';
import { useLocaleText } from '../locale';
import { surfaceClass, type TaoSurface } from '../surface';
import TaoCommandList from './TaoCommandList.vue';

// A dialog around TaoCommandList: the overlay, the page scroll lock, Escape and the focus return. The search, the rows
// and the keys of the list are TaoCommandList's.
// Диалог вокруг TaoCommandList: подложка, запрет прокрутки страницы, Esc и возврат фокуса. Поиск, строки и клавиши списка
// принадлежат TaoCommandList.
// class, style and the other attributes go to the dialog panel, not to the overlay around it
// class, style и остальные атрибуты — панели окна, а не подложке вокруг неё
defineOptions({ name: 'TaoCommandPalette', inheritAttrs: false });

interface Props {
    /** Open or closed (`v-model`). / Открыта или закрыта. */
    modelValue: boolean;
    /** The commands. The palette only searches and shows them: running one is `@select`. / Команды. */
    items: readonly TaoCommandItem[];
    /** The hint in the empty field. / Подсказка в пустом поле. */
    placeholder?: string;
    /** What is shown when nothing fits. / Что показано, когда ничего не подошло. */
    emptyText?: string;
    /** The name of the dialog for a screen reader. / Имя окна для скринридера. */
    label?: string;
    /** The most rows shown. Default 50. / Сколько строк показывать не больше. По умолчанию 50. */
    limit?: number;
    /** What the panel is made of, as on TaoModal. / Из чего сделана панель, как у TaoModal. */
    surface?: TaoSurface;
}

const props = withDefaults(defineProps<Props>(), { limit: 50, surface: 'flat' });
const l10n = useLocaleText(props, 'commandPalette');

const emit = defineEmits<{
    'update:modelValue': [open: boolean];
    /** The user picked a command (Enter or a click). The palette closes itself after it. / Выбрана команда. */
    select: [item: TaoCommandItem];
    close: [];
}>();

function close() {
    emit('update:modelValue', false);
    emit('close');
}

function onSelect(item: TaoCommandItem) {
    emit('select', item);
    close();
}

let pointerDownOnOverlay = false;
const onOverlayPointerDown = (event: PointerEvent) => (pointerDownOnOverlay = event.target === event.currentTarget);
function onOverlayPointerUp(event: PointerEvent) {
    if (pointerDownOnOverlay && event.target === event.currentTarget) close();
    pointerDownOnOverlay = false;
}

// Escape, the page scroll lock and the focus return belong to the layer stack (see layers.ts)
useLayer(() => props.modelValue, { lockScroll: true, restoreFocus: true, onEscape: close });
</script>

<template>
    <Teleport to="body">
        <Transition name="tao-command-palette-fade">
            <div v-if="modelValue" class="tao-command-palette-overlay" @pointerdown="onOverlayPointerDown" @pointerup="onOverlayPointerUp">
                <div v-bind="$attrs" class="tao-command-palette" :class="surfaceClass(surface)" role="dialog" aria-modal="true" :aria-label="label ?? l10n.label">
                    <!-- the list is made when the palette opens, so every opening starts with an empty query and the focus in the field -->
                    <TaoCommandList :items="items" :placeholder="placeholder" :empty-text="emptyText" :label="label" :limit="limit" autofocus @select="onSelect">
                        <template v-if="$slots.item" #item="slotProps"><slot name="item" v-bind="slotProps" /></template>
                        <template v-if="$slots.empty" #empty><slot name="empty" /></template>
                    </TaoCommandList>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.tao-command-palette-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--tao-z-modal);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 12vh var(--tao-space-5) var(--tao-space-5);
    background: var(--tao-color-overlay);
}

.tao-command-palette {
    --tao-command-palette-bg: var(--tao-surface-fill, var(--tao-color-surface-raised));
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 560px;
    max-height: min(480px, 70vh);
    overflow: hidden;
    border-radius: var(--tao-radius-panel);
    background-color: var(--tao-command-palette-bg);
    background-image: var(--tao-surface-image, none);
    background-size: var(--tao-surface-image-size, auto);
    -webkit-backdrop-filter: var(--tao-surface-backdrop, none);
    backdrop-filter: var(--tao-surface-backdrop, none);
    box-shadow: var(--tao-surface-inset, 0 0 #0000), var(--tao-shadow-overlay);
}

.tao-command-palette-fade-enter-active,
.tao-command-palette-fade-leave-active {
    transition: opacity var(--tao-duration-fast, 120ms) ease;
}

.tao-command-palette-fade-enter-from,
.tao-command-palette-fade-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .tao-command-palette-fade-enter-active,
    .tao-command-palette-fade-leave-active {
        transition: none;
    }
}
</style>
