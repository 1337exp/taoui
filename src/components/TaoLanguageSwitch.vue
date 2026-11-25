<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { taoLanguageName, type TaoLanguageOption } from '../languageName';
import { useLocaleText } from '../locale';
import type { TaoMenuItem } from '../menu';
import type { TaoPlacement } from '../floating';
import { sizeClass, type TaoSize } from '../size';
import TaoDropdownMenu from './TaoDropdownMenu.vue';
import TaoIcon from './TaoIcon.vue';

defineOptions({ name: 'TaoLanguageSwitch' });

const props = withDefaults(
    defineProps<{
        /** The code of the language in use, `v-model`. / Код языка, который сейчас включён, `v-model`. */
        /** The languages: codes (`'ru'`) or `{ code, label }`. The name of a code is the language in itself (`Русский`, `English`). / Языки: коды или `{ code, label }`. Название кода — сам язык на себе. */
        languages: readonly (string | TaoLanguageOption)[];
        /** Write the language to `<html lang>` (the browser, a screen reader and the hyphenation take it from there). Turn it off to do it yourself. / Писать язык в `<html lang>`. Выключите, чтобы делать это самим. */
        apply?: boolean;
        /** Only the globe, no name beside it: a phone, a narrow rail. The name stays in the accessible name. / Только глобус, без названия рядом: телефон, узкая рейка. Название остаётся в доступном имени. */
        iconOnly?: boolean;
        size?: TaoSize;
        /** Where the list opens against the button. / Где открывается список. */
        placement?: TaoPlacement;
        /** The name of the switch (the label of the button and of the list); the built-in text is «Language». / Имя переключателя. */
        label?: string;
    }>(),
    {
        apply: true,
        iconOnly: false,
        size: undefined,
        placement: 'bottom-end',
        label: undefined,
    },
);

const l10n = useLocaleText(props, 'languageSwitch');

const options = computed(() =>
    props.languages.map((entry) => {
        const code = typeof entry === 'string' ? entry : entry.code;
        const label = typeof entry === 'string' ? undefined : entry.label;
        return { code, label: label ?? taoLanguageName(code) };
    }),
);

// without `v-model` the switch keeps the choice itself, and starts on the first language
// без `v-model` переключатель сам держит выбор и начинает с первого языка
const model = defineModel<string>();
const current = computed(() => model.value ?? options.value[0]?.code ?? '');
const currentName = computed(() => options.value.find((o) => o.code === current.value)?.label ?? taoLanguageName(current.value));

const items = computed<TaoMenuItem[]>(() =>
    options.value.map((o) => ({ type: 'radio', id: o.code, group: 'language', label: o.label, lang: o.code, checked: o.code === current.value })),
);

function write(code: string) {
    if (props.apply && code && typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', code);
    }
}

function pick(code: string) {
    if (code === current.value) {
        return;
    }
    write(code);
    model.value = code;
}

// the page learns the language on mount (not on the server, where there is no `<html>` to write to) and when it changes from outside
// страница узнаёт язык при монтировании (не на сервере: писать некуда) и когда он меняется снаружи
onMounted(() => write(current.value));
watch(current, write);
</script>

<template>
    <TaoDropdownMenu
        class="tao-language-switch"
        :class="sizeClass(size)"
        :items="items"
        :menu-label="l10n.label"
        :placement="placement"
        @select="pick"
    >
        <template #button>
            <span class="tao-language-switch__face" :class="{ 'tao-language-switch__face--icon': iconOnly }">
                <TaoIcon name="tao-globe" />
                <!-- the name of the switch, then the language: «Language: English», and the visible word is inside it -->
                <span class="tao-language-switch__sr">{{ l10n.label }}: </span>
                <span class="tao-language-switch__name" :class="{ 'tao-language-switch__sr': iconOnly }">{{ currentName }}</span>
            </span>
        </template>
    </TaoDropdownMenu>
</template>

<style scoped>
.tao-language-switch__face {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    /* the button of the menu adds space-2 on every side: the face fills the rest of the control height / кнопка меню добавляет space-2 со всех сторон: грань занимает остаток высоты контрола */
    min-height: calc(var(--tao-control-height) - var(--tao-space-2) * 2);
    font-size: var(--tao-control-font-size-secondary);
    font-weight: 500;
    line-height: 1.25;
    white-space: nowrap;
}

.tao-language-switch__face--icon {
    justify-content: center;
    min-width: calc(var(--tao-control-height) - var(--tao-space-2) * 2);
}

/*
 * In a TaoNav the name folds where the navigation is compact (the rail; the bar has no footer) and shows on the side
 * panel: --tao-nav-compact is 1 or 0 there and 0 everywhere else. Folded by width, not hidden: it stays in the name of
 * the button («Language: English»), as with icon-only.
 * В TaoNav название сворачивается там, где навигация компактная (рейка), и видно в боковой панели: --tao-nav-compact
 * там 1 или 0, а везде ещё 0. Сворачивается по ширине, а не прячется: остаётся в имени кнопки, как с icon-only.
 */
.tao-language-switch__face:not(.tao-language-switch__face--icon) {
    justify-content: center;
    gap: calc((1 - var(--tao-nav-compact, 0)) * var(--tao-space-2));
    min-width: calc(var(--tao-nav-compact, 0) * (var(--tao-control-height) - var(--tao-space-2) * 2));
}

.tao-language-switch__face:not(.tao-language-switch__face--icon) .tao-language-switch__name {
    max-width: calc((1 - var(--tao-nav-compact, 0)) * 20em);
    overflow: hidden;
}

.tao-language-switch__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
}
</style>
