<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';

interface Action {
    id: string;
    name: string;
    ico?: string;
}

interface Props {
    actions?: Action[];
}

withDefaults(defineProps<Props>(), {
    actions: () => [],
});

const emit = defineEmits(['selected']);

let animationFrameId = 0;

const menuRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const listPosition = reactive({ top: '0', left: '0' });

function updatePosition() {
    const elMenu = menuRef.value;
    const elList = listRef.value;

    if (elMenu && elList && isOpen.value) {
        const rect = elMenu.getBoundingClientRect();
        const rectList = elList.getBoundingClientRect();

        let px = rect.right;
        let py = rect.top;

        if (px + rectList.width > window.innerWidth) {
            px = rect.left - rectList.width;
        }
        if (py + rectList.height > window.innerHeight) {
            py = rect.bottom - rectList.height;
        }

        listPosition.top = `${py + window.scrollY}px`;
        listPosition.left = `${px}px`;
    }
}

function toggleMenu() {
    isOpen.value = !isOpen.value;

    if (isOpen.value) {
        animationFrameId = requestAnimationFrame(function render() {
            updatePosition();
            animationFrameId = requestAnimationFrame(render);
        });
    } else {
        cancelAnimationFrame(animationFrameId);
    }
}

function closeMenu(event: MouseEvent) {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
        isOpen.value = false;
    }
}

function emitAction(id: string) {
    isOpen.value = false;
    emit('selected', id);
}

function onWinScroll() {
    isOpen.value = false;
}

onMounted(() => {
    document.addEventListener('click', closeMenu);
    window.addEventListener('scroll', onWinScroll);
});

onUnmounted(() => {
    document.removeEventListener('click', closeMenu);
    window.removeEventListener('scroll', onWinScroll);
    cancelAnimationFrame(animationFrameId);
});
</script>

<template>
    <div ref="menuRef" class="tao-dropdown-menu">
        <div class="tao-dropdown-menu__button" @click="toggleMenu">
            <slot v-if="$slots.button" name="button" />
            <span v-else>⋮</span>
        </div>

        <Teleport to="body">
            <div
                v-if="isOpen"
                ref="listRef"
                class="tao-dropdown-menu__list"
                :style="listPosition"
            >
                <div
                    v-for="action in actions"
                    :key="action.id"
                    class="tao-dropdown-menu__item"
                    @click="emitAction(action.id)"
                >
                    <slot v-if="$slots.item" name="item" :id="action.id" :ico="action.ico" :text="action.name" />
                    <span v-else>{{ action.name }}</span>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style>
/* .tao-dropdown-menu__list телепортируется в body, поэтому не может
   быть scoped — стилизуем его глобально, но с уникальным неймспейсом. */
.tao-dropdown-menu__list {
    z-index: 999999;
    position: absolute;
    top: 100%;
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

.tao-dropdown-menu__list .tao-dropdown-menu__item {
    padding: var(--tao-space-2) var(--tao-space-4);
    border: none;
    border-radius: var(--tao-radius-sm);
    background: none;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: var(--tao-transition-base);
}

.tao-dropdown-menu__list .tao-dropdown-menu__item:not(:last-child) {
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-dropdown-menu__list .tao-dropdown-menu__item:hover {
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
    transition: var(--tao-transition-base);
}

.tao-dropdown-menu__button:hover {
    background: var(--tao-color-surface-hover);
}
</style>
