<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import TaoButton from './TaoButton.vue';
import { useLocaleText } from '../locale';
import { applyTaoMode, readTaoMode, type TaoMode } from '../themeMode';
import type { TaoSize } from '../size';

defineOptions({ name: 'TaoThemeToggle' });

const props = withDefaults(
    defineProps<{
        /** The mode, `v-model`. Without it the button reads the mode of `<html>` and follows it. / Режим, `v-model`. Без него кнопка читает режим `<html>` и следует за ним. */
        modelValue?: TaoMode;
        /** Write the mode to `<html>` (`data-tao-mode`). Turn it off to do it yourself from `v-model`. / Писать режим в `<html>`. Выключите, чтобы делать это самим из `v-model`. */
        apply?: boolean;
        size?: TaoSize;
        variant?: 'primary' | 'secondary' | 'ghost' | 'text';
        /** aria-label while the page is dark (what a click does). / aria-label в тёмной теме (что сделает клик). */
        toLightLabel?: string;
        /** aria-label while the page is light. / aria-label в светлой теме. */
        toDarkLabel?: string;
    }>(),
    {
        modelValue: undefined,
        apply: true,
        size: undefined,
        variant: 'ghost',
        toLightLabel: undefined,
        toDarkLabel: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [mode: TaoMode];
    change: [mode: TaoMode];
}>();

const l10n = useLocaleText(props, 'themeToggle');

// what the page shows now; the server and the first paint assume the default (dark), `onMounted` reads the page
// что показывает страница сейчас; сервер и первый кадр считают тёмный (по умолчанию), `onMounted` читает страницу
const own = ref<TaoMode>('dark');
const mode = computed<TaoMode>(() => props.modelValue ?? own.value);

let observer: MutationObserver | null = null;

onMounted(() => {
    const root = document.documentElement;
    if (props.modelValue === undefined) {
        own.value = readTaoMode(root);
        // somebody else changes the mode (the system, another switch): follow it
        // режим меняет кто-то другой (система, другой переключатель): идём следом
        observer = new MutationObserver(() => {
            if (props.modelValue === undefined) {
                own.value = readTaoMode(root);
            }
        });
        observer.observe(root, { attributes: true, attributeFilter: ['data-tao-mode', 'data-tao-theme'] });
    } else if (props.apply) {
        applyTaoMode(root, props.modelValue);
    }
});

onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
});

// a controlled mode reaches the page too / управляемый режим доходит и до страницы
watch(
    () => props.modelValue,
    (value) => {
        if (value && props.apply && typeof document !== 'undefined') {
            applyTaoMode(document.documentElement, value);
        }
    },
);

function toggle() {
    const next: TaoMode = mode.value === 'dark' ? 'light' : 'dark';
    own.value = next;
    if (props.apply && typeof document !== 'undefined') {
        applyTaoMode(document.documentElement, next);
    }
    emit('update:modelValue', next);
    emit('change', next);
}

// the icon is the theme the click leads to; the label says it in words
// иконка — тема, к которой ведёт клик; подпись говорит это словами
const icon = computed(() => (mode.value === 'dark' ? 'tao-sun' : 'tao-moon'));
const label = computed(() => (mode.value === 'dark' ? l10n.value.toLightLabel : l10n.value.toDarkLabel));
</script>

<template>
    <TaoButton class="tao-theme-toggle" :icon="icon" :size="size" :variant="variant" :aria-label="label" @click="toggle" />
</template>
