<script lang="ts" setup>
import { ref } from 'vue';

defineOptions({ name: 'TaoCopy' });

interface Props {
    text: string;
    successMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
    successMessage: 'Скопировано!',
});

const copied = ref(false);
let timeoutId: ReturnType<typeof setTimeout>;

async function copy() {
    try {
        await navigator.clipboard.writeText(props.text);
        copied.value = true;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}
</script>

<template>
    <div class="tao-copy">
        <slot :copy="copy" :copied="copied">
            <button type="button" class="tao-copy__button" @click="copy" :class="{ 'tao-copy__button--copied': copied }">
                {{ copied ? successMessage : 'Копировать' }}
            </button>
        </slot>
    </div>
</template>

<style scoped>
.tao-copy {
    display: inline-block;
}

.tao-copy__button {
    padding: var(--tao-space-2) var(--tao-space-3);
    background: var(--tao-color-surface-sunken);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    color: var(--tao-color-text);
    font-size: var(--tao-font-size-sm);
    font-family: inherit;
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-copy__button:hover {
    background: var(--tao-color-surface-hover);
    border-color: var(--tao-color-accent);
    color: var(--tao-color-accent);
}

.tao-copy__button--copied {
    background: var(--tao-color-accent);
    border-color: var(--tao-color-accent);
    color: var(--tao-color-on-accent);
}
</style>
