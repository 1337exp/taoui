<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import type { TaoDropdownAction } from '../dropdown';

defineOptions({ name: 'TaoDropdownMenu' });

const props = withDefaults(
    defineProps<{
        actions?: TaoDropdownAction[];
        menuLabel?: string;
    }>(),
    {
        actions: () => [],
        menuLabel: 'Меню',
    },
);

const emit = defineEmits(['selected']);

const menuRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const isOpen = ref(false);
const activeIndex = ref(0);
const listPosition = reactive({ top: '0', left: '0' });

function updatePosition() {
    const trigger = triggerRef.value;
    const list = listRef.value;
    if (!trigger || !list || !isOpen.value) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const listWidth = list.offsetWidth;
    const listHeight = list.offsetHeight;
    let left = rect.right - listWidth;
    let top = rect.bottom + 4;

    if (left < 8) {
        left = rect.left;
    }
    if (left + listWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - listWidth - 8);
    }
    if (top + listHeight > window.innerHeight - 8 && rect.top > listHeight) {
        top = rect.top - listHeight - 4;
    }

    listPosition.top = `${top}px`;
    listPosition.left = `${left}px`;
}

async function setOpen(next: boolean) {
    isOpen.value = next;
    if (!next) {
        return;
    }
    activeIndex.value = 0;
    await nextTick();
    updatePosition();
    listRef.value?.focus();
}

function toggleMenu() {
    void setOpen(!isOpen.value);
}

function closeMenu() {
    if (!isOpen.value) {
        return;
    }
    isOpen.value = false;
    triggerRef.value?.focus();
}

function emitAction(id: string) {
    isOpen.value = false;
    emit('selected', id);
    triggerRef.value?.focus();
}

function onDocumentPointer(event: PointerEvent) {
    const target = event.target as Node;
    if (menuRef.value?.contains(target) || listRef.value?.contains(target)) {
        return;
    }
    isOpen.value = false;
}

function onWinScroll() {
    if (isOpen.value) {
        updatePosition();
    }
}

function onListKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!props.actions.length) {
            return;
        }
        activeIndex.value = (activeIndex.value + 1) % props.actions.length;
        return;
    }
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!props.actions.length) {
            return;
        }
        activeIndex.value = (activeIndex.value - 1 + props.actions.length) % props.actions.length;
        return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const action = props.actions[activeIndex.value];
        if (action) {
            emitAction(action.id);
        }
    }
}

onMounted(() => {
    document.addEventListener('pointerdown', onDocumentPointer);
    window.addEventListener('scroll', onWinScroll, true);
    window.addEventListener('resize', updatePosition);
});

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointer);
    window.removeEventListener('scroll', onWinScroll, true);
    window.removeEventListener('resize', updatePosition);
});
</script>

<template>
    <div ref="menuRef" class="tao-dropdown-menu">
        <button
            ref="triggerRef"
            type="button"
            class="tao-dropdown-menu__button"
            aria-haspopup="menu"
            :aria-expanded="isOpen"
            @click="toggleMenu"
        >
            <slot v-if="$slots.button" name="button" />
            <span v-else :aria-label="menuLabel">⋮</span>
        </button>

        <Teleport to="body">
            <div
                v-if="isOpen"
                ref="listRef"
                class="tao-dropdown-menu__list"
                role="menu"
                tabindex="-1"
                :style="listPosition"
                @keydown="onListKeydown"
            >
                <button
                    v-for="(action, index) in actions"
                    :key="action.id"
                    type="button"
                    class="tao-dropdown-menu__item"
                    :class="{ 'tao-dropdown-menu__item--active': index === activeIndex }"
                    role="menuitem"
                    @click="emitAction(action.id)"
                    @mouseenter="activeIndex = index"
                >
                    <slot v-if="$slots.item" name="item" :id="action.id" :ico="action.ico" :text="action.name" />
                    <span v-else>{{ action.name }}</span>
                </button>
            </div>
        </Teleport>
    </div>
</template>

<style>
.tao-dropdown-menu__list {
    z-index: 1050;
    position: fixed;
    min-width: 120px;
    display: flex;
    flex-direction: column;
    font-size: var(--tao-font-size-md);
    color: var(--tao-color-text);
    background-color: var(--tao-color-surface-raised);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-control);
    box-shadow: var(--tao-shadow-md);
}

.tao-dropdown-menu__list:focus {
    outline: none;
}

.tao-dropdown-menu__list .tao-dropdown-menu__item {
    padding: var(--tao-space-2) var(--tao-space-4);
    border: none;
    border-radius: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: var(--tao-transition-base);
}

.tao-dropdown-menu__list .tao-dropdown-menu__item:not(:last-child) {
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-dropdown-menu__list .tao-dropdown-menu__item:hover,
.tao-dropdown-menu__list .tao-dropdown-menu__item--active {
    color: var(--tao-color-accent);
    background-color: var(--tao-color-surface-hover);
}
</style>

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
    background: var(--tao-color-surface-hover);
}

.tao-dropdown-menu__button:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}
</style>
