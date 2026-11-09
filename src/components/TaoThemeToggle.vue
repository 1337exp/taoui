<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import TaoButton from './TaoButton.vue';
import { useLocaleText } from '../locale';
import { applyTaoMode, readTaoMode, resolveTaoMode, systemTaoMode, type TaoMode, type TaoModeChoice } from '../themeMode';
import type { TaoSize } from '../size';
import type { TaoToneName } from '../tone';

defineOptions({ name: 'TaoThemeToggle' });

const props = withDefaults(
    defineProps<{
        /** The mode, `v-model` (`'system'` too with `system`). Without it the button reads the mode of `<html>` and follows it. / Режим, `v-model` (с `system` ещё и `'system'`). Без него кнопка читает режим `<html>` и следует за ним. */
        modelValue?: TaoModeChoice;
        /** Write the mode to `<html>` (`data-tao-mode`). Turn it off to do it yourself from `v-model`. / Писать режим в `<html>`. Выключите, чтобы делать это самим из `v-model`. */
        apply?: boolean;
        /** A third state, «system»: the page follows the operating system. The click goes system → light → dark; the icon shows the state it is in (a monitor for the system). / Третье состояние, «системная»: страница идёт за операционной системой. Клик: системная → светлая → тёмная; иконка показывает текущее состояние (монитор для системной). */
        system?: boolean;
        size?: TaoSize;
        variant?: 'primary' | 'secondary' | 'ghost' | 'text';
        /** The colour of the button, as for `TaoButton`. `neutral` by default: a switch is a quiet tool, the accent is not for it. / Цвет кнопки, как у `TaoButton`. По умолчанию `neutral`: переключатель — тихий инструмент, акцент не для него. */
        tone?: TaoToneName;
        /** aria-label while a click leads to the light theme. / aria-label, пока клик ведёт к светлой теме. */
        toLightLabel?: string;
        /** aria-label while a click leads to the dark theme. / aria-label, пока клик ведёт к тёмной теме. */
        toDarkLabel?: string;
        /** aria-label while a click leads to the system theme (`system`). / aria-label, пока клик ведёт к системной теме (`system`). */
        toSystemLabel?: string;
    }>(),
    {
        modelValue: undefined,
        apply: true,
        system: false,
        size: undefined,
        variant: 'ghost',
        tone: 'neutral',
        toLightLabel: undefined,
        toDarkLabel: undefined,
        toSystemLabel: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [mode: TaoModeChoice];
    change: [mode: TaoModeChoice];
}>();

const l10n = useLocaleText(props, 'themeToggle');

// `<html>` remembers that the mode on it is the system's, so a remounted toggle can tell «system» from «dark»
// `<html>` помнит, что режим на нём системный: так перемонтированный переключатель отличает «системную» от «тёмной»
const CHOICE_ATTR = 'data-tao-mode-choice';

// what the person picked; the server and the first paint assume the default (dark), `onMounted` reads the page
// что выбрал человек; сервер и первый кадр считают тёмный (по умолчанию), `onMounted` читает страницу
const own = ref<TaoModeChoice>('dark');
const systemMode = ref<TaoMode>('dark');
// «system» without the prop is just the mode the system asks for
// «system» без пропа — просто режим, которого просит система
const choice = computed<TaoModeChoice>(() => {
    const value = props.modelValue ?? own.value;
    return value === 'system' && !props.system ? systemMode.value : value;
});
const mode = computed<TaoMode>(() => (choice.value === 'system' ? systemMode.value : choice.value));

function readChoice(root: Element): TaoModeChoice {
    const current = readTaoMode(root);
    return props.system && root.getAttribute(CHOICE_ATTR) === 'system' && current === systemTaoMode() ? 'system' : current;
}

function write(value: TaoModeChoice) {
    if (!props.apply || typeof document === 'undefined') {
        return;
    }
    const root = document.documentElement;
    applyTaoMode(root, resolveTaoMode(value));
    if (value === 'system') {
        root.setAttribute(CHOICE_ATTR, 'system');
    } else {
        root.removeAttribute(CHOICE_ATTR);
    }
}

let observer: MutationObserver | null = null;
let media: MediaQueryList | null = null;

function onSystemChange() {
    systemMode.value = systemTaoMode();
    if (choice.value === 'system') {
        write('system');
    }
}

onMounted(() => {
    const root = document.documentElement;
    systemMode.value = systemTaoMode();
    if (typeof matchMedia !== 'undefined') {
        media = matchMedia('(prefers-color-scheme: light)');
        media.addEventListener('change', onSystemChange);
    }
    if (props.modelValue === undefined) {
        own.value = readChoice(root);
        // somebody else changes the mode (the system, another switch): follow it
        // режим меняет кто-то другой (система, другой переключатель): идём следом
        observer = new MutationObserver(() => {
            if (props.modelValue === undefined) {
                own.value = readChoice(root);
                // only a toggle that knows «system» tidies the mark: a plain one on the same page must not wipe it
                // метку убирает только переключатель, который знает «системную»: простой на той же странице её не стирает
                if (props.system && own.value !== 'system' && root.hasAttribute(CHOICE_ATTR)) {
                    root.removeAttribute(CHOICE_ATTR);
                }
            }
        });
        observer.observe(root, { attributes: true, attributeFilter: ['data-tao-mode', 'data-tao-theme'] });
    } else {
        write(props.modelValue);
    }
});

onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
    media?.removeEventListener('change', onSystemChange);
    media = null;
});

// a controlled mode reaches the page too / управляемый режим доходит и до страницы
watch(
    () => props.modelValue,
    (value) => {
        if (value) {
            write(value);
        }
    },
);

// system → light → dark → system; without `system` just dark ↔ light
// системная → светлая → тёмная → системная; без `system` просто тёмная ↔ светлая
const next = computed<TaoModeChoice>(() => {
    if (!props.system) {
        return mode.value === 'dark' ? 'light' : 'dark';
    }
    return choice.value === 'system' ? 'light' : choice.value === 'light' ? 'dark' : 'system';
});

function toggle() {
    const value = next.value;
    own.value = value;
    write(value);
    emit('update:modelValue', value);
    emit('change', value);
}

// two states: the icon is the theme the click leads to; with `system` it is the state the toggle is in
// два состояния: иконка — тема, к которой ведёт клик; с `system` — состояние, в котором переключатель
const icon = computed(() => {
    if (props.system) {
        return choice.value === 'system' ? 'tao-monitor' : choice.value === 'dark' ? 'tao-moon' : 'tao-sun';
    }
    return mode.value === 'dark' ? 'tao-sun' : 'tao-moon';
});
// the label says in words where the click leads / подпись словами говорит, куда ведёт клик
const label = computed(() => {
    const t = l10n.value;
    return next.value === 'system' ? t.toSystemLabel : next.value === 'light' ? t.toLightLabel : t.toDarkLabel;
});
// with the icon slot the button stays a square of the control height
// со слотом icon кнопка остаётся квадратом высотой с контрол
</script>

<template>
    <TaoButton v-if="$slots.icon" class="tao-theme-toggle tao-theme-toggle--custom" :size="size" :variant="variant" :tone="tone" :aria-label="label" @click="toggle">
        <slot name="icon" :mode="mode" :choice="choice" :next="next" />
    </TaoButton>
    <TaoButton v-else class="tao-theme-toggle" :icon="icon" :size="size" :variant="variant" :tone="tone" :aria-label="label" @click="toggle" />
</template>

<style>
/* three classes: the scoped rules of TaoButton weigh two, and its padding and inline content line would win
   три класса: scoped-правила TaoButton весят два, и его отступ и строчный контент победили бы */
.tao-button.tao-theme-toggle.tao-theme-toggle--custom {
    width: var(--tao-control-height);
    padding: 0;
}

.tao-button.tao-theme-toggle--custom .tao-button__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>
