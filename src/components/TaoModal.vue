<script lang="ts" setup>
import { watch, onBeforeUnmount } from 'vue';

interface Props {
    modelValue: boolean;
    title?: string;
    closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    closable: true,
});

const emit = defineEmits(['update:modelValue', 'close']);

function close() {
    emit('update:modelValue', false);
    emit('close');
}

// Блокируем скролл страницы за модалкой, пока она открыта. Скролл
// самого контента модалки не трогаем — он остаётся на .tao-modal
// (overflow-y: auto) и работает независимо.
let previousOverflow = '';

function lockBodyScroll() {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
    document.body.style.overflow = previousOverflow;
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen) {
            lockBodyScroll();
        } else {
            unlockBodyScroll();
        }
    },
    { immediate: true }
);

onBeforeUnmount(() => {
    if (props.modelValue) {
        unlockBodyScroll();
    }
});
</script>

<template>
    <Teleport to="body">
        <Transition name="tao-modal-fade">
            <div v-if="modelValue" class="tao-modal-overlay" @click.self="closable && close()">
                <div class="tao-modal">
                    <div v-if="title || $slots.header" class="tao-modal__header">
                        <slot name="header">
                            <h2 class="tao-modal__title">{{ title }}</h2>
                        </slot>
                        <button v-if="closable" class="tao-modal__close" @click="close">&times;</button>
                    </div>
                    <div class="tao-modal__content">
                        <slot />
                    </div>
                    <div v-if="$slots.footer" class="tao-modal__footer">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.tao-modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--tao-color-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--tao-space-5);
}

.tao-modal {
    background: var(--tao-color-surface-raised);
    border-radius: var(--tao-radius-panel);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--tao-shadow-overlay);
}

.tao-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--tao-space-4) var(--tao-space-5);
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-modal__title {
    margin: 0;
    font-size: var(--tao-font-size-xl);
    font-weight: 600;
    color: var(--tao-color-text-strong);
}

.tao-modal__close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--tao-color-text);
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.tao-modal__close:hover {
    color: var(--tao-color-text-strong);
}

.tao-modal__content {
    padding: var(--tao-space-5);
}

.tao-modal__footer {
    padding: var(--tao-space-4) var(--tao-space-5);
    border-top: 1px solid var(--tao-color-border);
    display: flex;
    gap: var(--tao-space-3);
    justify-content: flex-end;
}

.tao-modal-fade-enter-active,
.tao-modal-fade-leave-active {
    transition: opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-modal-fade-enter-from,
.tao-modal-fade-leave-to {
    opacity: 0;
}
</style>
