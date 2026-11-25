<script lang="ts" setup>
import { computed } from 'vue';
import { useLocaleText } from '../locale';
import type { TaoKitPrefs } from '../kitPrefs';
import type { TaoMenuItem, TaoMenuPick } from '../menu';
import type { TaoNavItem, TaoNavLayout, TaoNavLook } from '../nav';
import TaoButton from './TaoButton.vue';
import TaoDropdownMenu from './TaoDropdownMenu.vue';
import TaoIcon from './TaoIcon.vue';
import TaoLanguageSwitch from './TaoLanguageSwitch.vue';
import TaoNav from './TaoNav.vue';
import TaoThemeToggle from './TaoThemeToggle.vue';

defineOptions({ name: 'TaoShell' });

// The shell of an app: the navigation (a side panel, a rail, a bar), the main action, the project the app works in, the language
// and the theme, and the page. Every product builds the same thing; this is it, with the phone handled: the bar has no room
// for the project and the tools, so they go up into a thin header, by a container query on TaoNav (no JavaScript, no second
// breakpoint). Give the parent the height of the window: `html, body, #app { height: 100% }`.
// Оболочка приложения: навигация (боковая панель, рейка, нижняя панель), главное действие, проект, в котором работает приложение,
// язык и тема, и страница. Каждый продукт собирает одно и то же; вот оно, и телефон учтён: в нижней панели нет места для
// проекта и инструментов, они уходят в тонкую шапку по container query на TaoNav (без JavaScript, без второго порога).
// Дайте родителю высоту окна: `html, body, #app { height: 100% }`.
const props = withDefaults(
    defineProps<{
        /** The sections. / Разделы. */
        items: TaoNavItem[];
        /** The projects the app works in: a menu with the current one checked. Without them there is no chip. / Проекты, в которых работает приложение. Без них нет и фишки. */
        projects?: readonly { id: string; title: string }[];
        /** The main action of the screen (New, Compose): its text and icon. `action` is emitted. / Главное действие экрана: текст и иконка. */
        action?: { label: string; icon?: string; shortcut?: string };
        /** The languages for the switch (codes or `{ code, label }`). Without them there is no switch. / Языки переключателя. Без них переключателя нет. */
        languages?: readonly (string | { code: string; label?: string })[];
        /** The preferences of the product (`createKitPrefs`): the theme and the language bind to them. Without it both work on their own. / Настройки продукта: тема и язык связываются с ними. Без них оба работают сами. */
        prefs?: TaoKitPrefs;
        /** Accessible name of the navigation. / Имя навигации для скринридера. */
        label?: string;
        /** The colour of the counters, as on `TaoNav`. / Цвет счётчиков, как у `TaoNav`. */
        badgeTone?: 'accent' | 'neutral';
    }>(),
    { projects: undefined, action: undefined, languages: undefined, prefs: undefined, label: undefined, badgeTone: 'neutral' },
);

/** The id of the current section. / id текущего раздела. */
const section = defineModel<string>();
/** The id of the current project. / id текущего проекта. */
const project = defineModel<string>('project');
/** The look of the navigation, as on `TaoNav`. / Вид навигации, как у `TaoNav`. */
const layout = defineModel<TaoNavLayout>('layout', { default: 'auto' });
/** The look the navigation has now, to read (`bar`, `rail`, `drawer`). / Вид навигации сейчас, для чтения. */
const look = defineModel<TaoNavLook>('look');

const emit = defineEmits<{
    /** The main action was pressed. / Нажато главное действие. */
    action: [];
    /** «New project» was chosen in the menu of the projects. / В меню проектов выбран «Новый проект». */
    'new-project': [];
}>();

defineSlots<{
    /** The page. / Страница. */
    default?(): unknown;
    /** Your own tools in the footer and the header, in place of the language and the theme. / Свои инструменты вместо языка и темы. */
    tools?(): unknown;
}>();

const l10n = useLocaleText(props, 'shell');

const NEW = '__tao-shell-new-project';
const current = computed(() => props.projects?.find((entry) => entry.id === project.value) ?? props.projects?.[0]);
const projectItems = computed<TaoMenuItem[]>(() => [
    ...(props.projects ?? []).map((entry): TaoMenuItem => ({ type: 'radio', id: entry.id, group: 'project', label: entry.title, checked: entry.id === current.value?.id })),
    { type: 'separator' },
    { id: NEW, label: l10n.value.newProjectLabel, icon: 'tao-plus' },
]);

function onProject(pick: TaoMenuPick) {
    if (pick.id === NEW) {
        emit('new-project');
    } else {
        project.value = pick.id;
    }
}

// with `prefs` the theme and the language are bound to it; without, each works on its own
// с `prefs` тема и язык связаны с ним; без него каждое работает само
const mode = computed({
    get: () => props.prefs?.mode.value,
    set: (value) => {
        if (props.prefs && value) {
            props.prefs.mode.value = value;
        }
    },
});
const locale = computed({
    get: () => props.prefs?.locale.value ?? undefined,
    set: (value) => {
        if (props.prefs && value) {
            props.prefs.locale.value = value;
        }
    },
});
</script>

<template>
    <TaoNav v-model="section" v-model:layout="layout" v-model:look="look" fill :badge-tone="badgeTone" :items="items" :label="label">
        <!-- the main action, then the project under it: on the rail both are round icons -->
        <template v-if="action || current" #action>
            <TaoButton v-if="action" :icon="action.icon ?? 'tao-plus'" :shortcut="action.shortcut" @click="emit('action')">
                <span class="tao-nav__action-label">{{ action.label }}</span>
            </TaoButton>
            <TaoDropdownMenu v-if="current" class="tao-shell__project" block :items="projectItems" :menu-label="l10n.projectsLabel" placement="bottom-start" @select="onProject">
                <template #button>
                    <span class="tao-shell__chip" :title="current.title">
                        <TaoIcon name="tao-folder" />
                        <span class="tao-sr-only">{{ l10n.projectLabel }}: </span>
                        <span class="tao-shell__chip-text">{{ current.title }}</span>
                        <TaoIcon class="tao-shell__chip-more" name="tao-chevron-down" />
                    </span>
                </template>
            </TaoDropdownMenu>
        </template>

        <template #footer>
            <div class="tao-shell__tools">
                <slot name="tools">
                    <TaoLanguageSwitch v-if="languages" v-model="locale" :languages="languages" :apply="!prefs" placement="top-start" />
                    <TaoThemeToggle v-if="prefs" v-model="mode" system :apply="false" />
                    <TaoThemeToggle v-else />
                </slot>
            </div>
        </template>

        <div class="tao-shell__page">
            <!-- a phone: the bar has no room for the project and no footer, so they go up into a thin header -->
            <header v-if="current || languages || prefs || $slots.tools" class="tao-shell__top">
                <TaoDropdownMenu v-if="current" block :items="projectItems" :menu-label="l10n.projectsLabel" placement="bottom-start" @select="onProject">
                    <template #button>
                        <span class="tao-shell__chip">
                            <TaoIcon name="tao-folder" />
                            <span class="tao-sr-only">{{ l10n.projectLabel }}: </span>
                            <span class="tao-shell__chip-text">{{ current.title }}</span>
                            <TaoIcon class="tao-shell__chip-more" name="tao-chevron-down" />
                        </span>
                    </template>
                </TaoDropdownMenu>
                <div class="tao-shell__tools">
                    <slot name="tools">
                        <TaoLanguageSwitch v-if="languages" v-model="locale" :languages="languages" :apply="!prefs" icon-only />
                        <TaoThemeToggle v-if="prefs" v-model="mode" system :apply="false" />
                        <TaoThemeToggle v-else />
                    </slot>
                </div>
            </header>
            <div class="tao-shell__main"><slot /></div>
        </div>
    </TaoNav>
</template>

<style scoped>
.tao-shell__page {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.tao-shell__top {
    display: none;
    align-items: center;
    justify-content: space-between;
    gap: var(--tao-space-2);
    padding: var(--tao-space-2) var(--tao-space-4);
    border-bottom: 1px solid var(--tao-color-border);
    background: var(--tao-color-surface);
}

/* the same breakpoint as the bar of TaoNav: the container is TaoNav itself, so it follows its width, not the window */
/* тот же порог, что у нижней панели TaoNav: контейнер — сам TaoNav, поэтому по его ширине, не окна */
@container tao-nav (width < 600px) {
    .tao-shell__top {
        display: flex;
    }

    /* doubled: the menu sets display: block with the same weight */
    .tao-shell__project.tao-shell__project {
        display: none;
    }
}

/* the page scrolls by itself, inside: nothing scrolls as a document */
.tao-shell__main {
    flex: 1;
    min-height: 0;
    overflow: auto;
}

/* the chip: the whole of it is the button of a block TaoDropdownMenu; on the rail (--tao-nav-compact: 1) the text and the
   chevron shrink to nothing and a round icon stays / фишка вся — кнопка блочного TaoDropdownMenu; на рейке текст и стрелка
   сжимаются в ничто, остаётся круглая иконка */
.tao-shell__chip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: calc((1 - var(--tao-nav-compact, 0)) * var(--tao-space-2));
    box-sizing: border-box;
    min-height: var(--tao-control-height);
    padding-inline: calc((1 - var(--tao-nav-compact, 0)) * var(--tao-space-3));
    border: calc((1 - var(--tao-nav-compact, 0)) * 1px) solid var(--tao-color-border-strong);
    border-radius: inherit;
    background: color-mix(in srgb, var(--tao-color-text) calc(var(--tao-nav-compact, 0) * 8%), transparent);
    color: var(--tao-color-text);
    font-size: var(--tao-control-font-size);
}

.tao-shell__chip-text {
    flex: 1;
    min-width: 0;
    max-width: calc((1 - var(--tao-nav-compact, 0)) * 600px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-shell__chip-more {
    flex: none;
    max-width: calc((1 - var(--tao-nav-compact, 0)) * 24px);
    overflow: hidden;
    color: var(--tao-color-text-muted);
}

.tao-shell__top .tao-shell__chip {
    max-width: 220px;
}

.tao-shell__tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--tao-space-1);
}
</style>
