<script lang="ts" setup>
import { ref } from 'vue';
import type { TaoPlacement } from '../floating';
import { useLocaleText } from '../locale';
import { menuReturnsFocus, type TaoMenuCloseReason, type TaoMenuItem } from '../menu';
import TaoIcon from './TaoIcon.vue';
import TaoMenu from './TaoMenu.vue';

defineOptions({ name: 'TaoDropdownMenu' });

const props = withDefaults(
    defineProps<{
        /** Entries: items, submenus, checkboxes, radios, separators (see TaoMenuItem). / Пункты: обычные, подменю, чекбоксы, радио, разделители. */
        items?: TaoMenuItem[];
        /** Where the list opens against the button; flips when there is no room. / Где открывается список; при нехватке места переворачивается. */
        placement?: TaoPlacement;
        menuLabel?: string;
        /** Close when the page scrolls (the menu otherwise follows its button). / Закрывать при прокрутке страницы (иначе меню едет за кнопкой). */
        closeOnScroll?: boolean;
    }>(),
    {
        items: () => [],
        placement: 'bottom-end',
        closeOnScroll: false,
    },
);
const l10n = useLocaleText(props, 'dropdownMenu');

const emit = defineEmits<{
    /** The id of the picked item. / id выбранного пункта. */
    select: [id: string];
}>();

defineSlots<{
    /** The whole trigger content, replaces the button face. / Всё содержимое кнопки. */
    button?(): unknown;
    /** The default button face (three dots). / Вид кнопки по умолчанию. */
    icon?(): unknown;
    /** Replaces the text of one item. / Заменяет содержимое пункта. */
    item?(props: { item: TaoMenuItem; id: string; label: string; icon?: string }): unknown;
}>();

const triggerRef = ref<HTMLButtonElement | null>(null);
const isOpen = ref(false);

function toggleMenu() {
    isOpen.value = !isOpen.value;
}

function onClose(reason: TaoMenuCloseReason) {
    isOpen.value = false;
    // a press elsewhere leaves the focus where the user put it / нажатие в другом месте оставляет фокус там, куда его поставили
    if (menuReturnsFocus(reason)) {
        triggerRef.value?.focus();
    }
}

function onTriggerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        isOpen.value = true;
    }
}
</script>

<template>
    <div class="tao-dropdown-menu">
        <button
            ref="triggerRef"
            type="button"
            class="tao-dropdown-menu__button"
            aria-haspopup="menu"
            :aria-expanded="isOpen"
            :aria-label="$slots.button ? undefined : l10n.menuLabel"
            @click="toggleMenu"
            @keydown="onTriggerKeydown"
        >
            <slot v-if="$slots.button" name="button" />
            <span v-else aria-hidden="true">
                <slot name="icon"><TaoIcon name="tao-more-vertical" /></slot>
            </span>
        </button>

        <TaoMenu
            :items="items"
            :open="isOpen"
            :anchor="triggerRef"
            :placement="placement"
            :label="menuLabel ?? l10n.menuLabel"
            :close-on-scroll="closeOnScroll"
            @select="emit('select', $event)"
            @close="onClose"
        >
            <template v-if="$slots.item" #item="slotProps">
                <slot name="item" v-bind="slotProps" />
            </template>
        </TaoMenu>
    </div>
</template>

<style scoped>
.tao-dropdown-menu {
    position: relative;
    display: inline-block;
}

.tao-dropdown-menu__button {
    padding: var(--tao-space-2);
    color: var(--tao-color-text);
    border: none;
    border-radius: var(--tao-radius-control);
    background: none;
    cursor: pointer;
    user-select: none;
    font: inherit;
    line-height: 1;
    transition: var(--tao-transition-base);
}

.tao-dropdown-menu__button:hover {
    background: var(--tao-color-hover);
}

.tao-dropdown-menu__button:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}
</style>
