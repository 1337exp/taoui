<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue';
import { useLocaleText } from '../locale';
import type { TaoMenuCloseReason, TaoMenuItem } from '../menu';
import TaoMenu from './TaoMenu.vue';

defineOptions({ name: 'TaoContextMenu' });

// A menu on the right click (and on the Menu key / Shift+F10) over whatever the default slot holds. It opens at the
// pointer, flips at the screen edge, and gives the focus back when it closes. The panel is TaoMenu.
// Меню по правой кнопке (и по клавише Menu / Shift+F10) над содержимым слота. Открывается у указателя, у края экрана
// переворачивается, при закрытии возвращает фокус. Панель — TaoMenu.
const props = withDefaults(
    defineProps<{
        items: TaoMenuItem[];
        /** Leave the browser's own menu alone. / Не трогать меню браузера. */
        disabled?: boolean;
        /** Accessible name of the menu. / Имя меню для скринридера. */
        menuLabel?: string;
        /**
         * Close when the page (or a scroll container) scrolls: the point the menu was opened for moves away under it.
         * false keeps it at the screen point. Scrolling inside the menu never closes it.
         * Закрывать при прокрутке страницы (или контейнера): точка, для которой открыли меню, уезжает из-под него.
         * false оставляет его в точке экрана. Прокрутка внутри самого меню его не закрывает.
         */
        closeOnScroll?: boolean;
    }>(),
    {
        disabled: false,
        menuLabel: undefined,
        closeOnScroll: true,
    },
);
const l10n = useLocaleText(props, 'contextMenu');

const emit = defineEmits<{
    /** The id of the picked item. / id выбранного пункта. */
    select: [id: string];
    /** Where it opened (viewport coordinates), for your own bookkeeping. / Где открылось (координаты окна). */
    open: [point: { x: number; y: number }];
}>();

defineSlots<{
    default?(): unknown;
    /** Replaces the text of one item. / Заменяет содержимое пункта. */
    item?(props: { item: TaoMenuItem; id: string; label: string; icon?: string }): unknown;
}>();

const isOpen = ref(false);
const anchor = ref<HTMLElement | null>(null);
const point = ref({ x: 0, y: 0 });
let returnTo: HTMLElement | null = null;

async function onContextMenu(event: MouseEvent) {
    if (props.disabled || !props.items.length) {
        return;
    }
    event.preventDefault();
    returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // the keyboard sends the event with no pointer: open at the element that has the focus
    const target = event.target instanceof HTMLElement ? event.target : null;
    const fromKeyboard = event.clientX === 0 && event.clientY === 0 && target;
    const rect = fromKeyboard ? target.getBoundingClientRect() : null;
    point.value = rect ? { x: rect.left + 8, y: rect.top + rect.height / 2 } : { x: event.clientX, y: event.clientY };
    isOpen.value = false;
    await nextTick();
    isOpen.value = true;
    emit('open', { ...point.value });
}

function onClose(reason: TaoMenuCloseReason) {
    isOpen.value = false;
    // a press elsewhere leaves the focus where the user put it / нажатие в другом месте оставляет фокус там, куда его поставили
    if (reason !== 'outside') {
        returnTo?.focus?.();
    }
    returnTo = null;
}

watch(isOpen, (open, _was, onCleanup) => {
    if (!open || !props.closeOnScroll || typeof window === 'undefined') {
        return;
    }
    const onScroll = (event: Event) => {
        // the long menu scrolls its own list: that is not the page moving away
        // длинное меню прокручивает свой список: это не уезжающая страница
        if (event.target instanceof Element && event.target.closest('.tao-menu')) {
            return;
        }
        onClose('outside');
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    onCleanup(() => window.removeEventListener('scroll', onScroll, true));
});
</script>

<template>
    <div class="tao-context-menu" @contextmenu="onContextMenu">
        <slot />
        <!-- the menu hangs from a point: an empty fixed element at the pointer -->
        <span
            ref="anchor"
            class="tao-context-menu__anchor"
            aria-hidden="true"
            :style="{ left: `${point.x}px`, top: `${point.y}px` }"
        />
        <TaoMenu
            :items="items"
            :open="isOpen"
            :anchor="anchor"
            placement="bottom-start"
            :label="menuLabel ?? l10n.menuLabel"
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
/* it does not take part in the layout: the content looks as if it were not wrapped */
.tao-context-menu {
    display: contents;
}

.tao-context-menu__anchor {
    position: fixed;
    width: 0;
    height: 0;
    pointer-events: none;
}
</style>
