<script lang="ts" setup>
import { computed, nextTick, ref, useId, useSlots, watch } from 'vue';
import { formatText, useLocaleText } from '../locale';
import { slotHas } from '../slots';
import { nextRegion, toggleTool, type TaoWorkbenchSide, type TaoWorkbenchTool } from '../workbench';
import TaoIcon from './TaoIcon.vue';
import TaoSplit from './TaoSplit.vue';
import TaoTooltip from './TaoTooltip.vue';

defineOptions({ name: 'TaoWorkbench' });

// The frame of an editor, as in an IDE: a top bar, a left, a right and a bottom bar (the bottom one is the status bar), tool windows that the
// rails open, and the workspace in the middle. Every bar has a start and an end (the slots `top-start`, `top-end`, ...); a rail also carries
// its tools, buttons that open panels. The panels and the workspace are darker blocks over a soft glow in the top left corner, and they are
// divided by `TaoSplit`, so each can be resized.
// Рамка редактора, как в IDE: верхняя полоса, левая, правая и нижняя (нижняя это строка состояния), окна инструментов, которые открывают
// рейки, и рабочая область посередине. У каждой полосы есть начало и конец (слоты `top-start`, `top-end` и так далее); рейка ещё несёт свои
// инструменты, кнопки, открывающие панели. Панели и рабочая область — более тёмные блоки над мягким свечением в левом верхнем углу, их делит
// `TaoSplit`, поэтому у каждой можно менять размер.
const props = withDefaults(
    defineProps<{
        /** The tools of the left rail. / Инструменты левой рейки. */
        leftTools?: TaoWorkbenchTool[];
        /** The tools of the right rail. / Инструменты правой рейки. */
        rightTools?: TaoWorkbenchTool[];
        /** The tools of the bottom bar (panels under the workspace). / Инструменты нижней полосы (панели под рабочей областью). */
        bottomTools?: TaoWorkbenchTool[];
        /** The least width of a side panel and the least height of the bottom one, px. / Наименьшая ширина боковой панели и высота нижней, px. */
        panelMin?: number;
        /** The least size the workspace is squeezed to, px. / До чего сжимается рабочая область, px. */
        centerMin?: number;
        /** The glow in the top left corner. Off: a plain background. / Свечение в левом верхнем углу. Выключено: ровный фон. */
        glow?: boolean;
        /** Names of the landmarks; the locale text by default. / Имена областей; по умолчанию текст локали. */
        topLabel?: string;
        leftLabel?: string;
        rightLabel?: string;
        bottomLabel?: string;
        mainLabel?: string;
        skipLabel?: string;
        closePanelLabel?: string;
    }>(),
    {
        leftTools: () => [],
        rightTools: () => [],
        bottomTools: () => [],
        panelMin: 160,
        centerMin: 240,
        glow: true,
    },
);

/** The id of the tool whose panel is open on the left; `null` closes it. / id инструмента, чья панель открыта слева; `null` закрывает. */
const left = defineModel<string | null>('left', { default: null });
const right = defineModel<string | null>('right', { default: null });
const bottom = defineModel<string | null>('bottom', { default: null });
/** The width of the left panel, px (the width of the right one, the height of the bottom one). / Ширина левой панели, px (ширина правой, высота нижней). */
const leftSize = defineModel<number>('leftSize', { default: 280 });
const rightSize = defineModel<number>('rightSize', { default: 280 });
const bottomSize = defineModel<number>('bottomSize', { default: 220 });

const emit = defineEmits<{
    /**
     * The user finished changing the size of a panel (the end of a drag, a key): the name of the size, as `v-model` has it, and its value. The
     * `v-model` follows the pointer all the time; this is the one moment to write the layout to storage.
     * Пользователь закончил менять размер панели (конец протяжки, клавиша): имя размера, как у `v-model`, и его значение. `v-model` идёт за
     * указателем всё время; это единственный момент, чтобы записать раскладку в хранилище.
     */
    commit: [part: 'leftSize' | 'rightSize' | 'bottomSize', value: number];
}>();

defineSlots<{
    /** The workspace: your editor, a scene, a canvas. / Рабочая область: ваш редактор, сцена, холст. */
    default?(): unknown;
    /** The bars. `start` is the first end (the left of the top and the bottom bars, the top of a rail), `end` the other. A rail puts its tools between. / Полосы. `start` — первый конец, `end` — другой; рейка ставит свои инструменты между ними. */
    'top-start'?(): unknown;
    'top-end'?(): unknown;
    'left-start'?(): unknown;
    'left-end'?(): unknown;
    'right-start'?(): unknown;
    'right-end'?(): unknown;
    'bottom-start'?(): unknown;
    'bottom-end'?(): unknown;
    /** The content of the open tool. / Содержимое открытого инструмента. */
    'left-panel'?(props: { tool: TaoWorkbenchTool }): unknown;
    'right-panel'?(props: { tool: TaoWorkbenchTool }): unknown;
    'bottom-panel'?(props: { tool: TaoWorkbenchTool }): unknown;
    /** Beside the title of a panel, before its close button (a filter, a menu). / Рядом с заголовком панели, перед кнопкой закрытия (фильтр, меню). */
    'panel-actions'?(props: { tool: TaoWorkbenchTool; side: TaoWorkbenchSide }): unknown;
}>();

const l10n = useLocaleText(props, 'workbench');
const slots = useSlots();
const has = (name: string) => slotHas(slots, name);

const toolOf = (tools: TaoWorkbenchTool[], id: string | null) => tools.find((tool) => tool.id === id) ?? null;
const openLeft = computed(() => toolOf(props.leftTools, left.value));
const openRight = computed(() => toolOf(props.rightTools, right.value));
const openBottom = computed(() => toolOf(props.bottomTools, bottom.value));

function press(side: TaoWorkbenchSide, tool: TaoWorkbenchTool) {
    if (tool.disabled) {
        return;
    }
    const model = side === 'left' ? left : side === 'right' ? right : bottom;
    model.value = toggleTool(model.value, tool.id);
}

const closeText = (tool: TaoWorkbenchTool) => formatText(l10n.value.closePanelLabel, { name: tool.label });

// The name of a tool button: its label, then the badge, so a screen reader hears the count (an `aria-label` replaces what is inside the
// button, a hidden text in it would be lost). The key goes to `aria-keyshortcuts`.
// Имя кнопки инструмента: подпись, затем бейдж, чтобы скринридер прочёл счётчик (`aria-label` заменяет содержимое кнопки, скрытый текст в ней
// пропал бы). Клавиша — в `aria-keyshortcuts`.
function toolName(tool: TaoWorkbenchTool): string {
    const badge = tool.badgeLabel ?? (typeof tool.badge === 'number' || typeof tool.badge === 'string' ? String(tool.badge) : '');
    return badge ? `${tool.label}, ${badge}` : tool.label;
}

// A panel that closes takes the focus with it when the focus is inside (its own close button, or whatever the user was in): the focus goes to
// the tool that opened it, as a dialog does. A parent that sets the model to `null` is the same case as a click, so it is the models that are watched.
// Панель, которая закрывается, уносит фокус, если он внутри (её кнопка закрытия или то, где был пользователь): фокус уходит к инструменту,
// открывшему панель, как у диалога. Родитель, обнуляющий модель, — тот же случай, что клик, поэтому следим за моделями.
function closePanel(side: TaoWorkbenchSide) {
    (side === 'left' ? left : side === 'right' ? right : bottom).value = null;
}
watch(
    [left, right, bottom],
    (now, before) => {
        (['left', 'right', 'bottom'] as const).forEach((side, i) => {
            const id = before[i];
            if (!id || now[i]) {
                return;
            }
            const panel = rootRef.value?.querySelector(`[data-tao-panel="${side}"]`);
            if (!panel?.contains(document.activeElement)) {
                return;
            }
            void nextTick(() => {
                const tool = [...(rootRef.value?.querySelectorAll<HTMLElement>('[data-tao-tool]') ?? [])].find((el) => el.dataset.taoTool === `${side}:${id}`);
                (tool && !(tool as HTMLButtonElement).disabled ? tool : mainRef.value)?.focus();
            });
        });
    },
    { flush: 'pre' },
);

// each frame has its own landmark id: two workbenches on a page must not share one
// у каждой рамки свой id области: две рамки на странице не должны делить один
const mainId = `tao-workbench-main-${useId()}`;

// The gutter of the inner split (`--tao-workbench-gap`, the space token 2 = 8px): the left split's end pane holds that split, and the workspace
// keeps `centerMin` only if the gutter is counted too
// Зазор внутреннего сплита (`--tao-workbench-gap`, токен отступа 2 = 8px): в конечной панели левого сплита лежит тот сплит, и рабочая область
// держит `centerMin`, только если зазор тоже посчитан
const GUTTER = 8;

// F6 / Shift+F6 go round the regions, as in an IDE (a keyboard user does not tab through a whole rail to reach the workspace)
// F6 / Shift+F6 идут по областям по кругу, как в IDE (пользователь клавиатуры не листает табом всю рейку, чтобы дойти до рабочей области)
const rootRef = ref<HTMLElement | null>(null);
function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'F6' || event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }
    // only the regions of THIS frame: a workbench inside a workbench has its own F6 ring
    // только области ЭТОЙ рамки: у рамки внутри рамки своё кольцо F6
    const regions = [...(rootRef.value?.querySelectorAll<HTMLElement>('[data-tao-region]') ?? [])].filter((region) => region.closest('.tao-workbench') === rootRef.value);
    const at = regions.findIndex((region) => region.contains(document.activeElement));
    const to = nextRegion(regions.length, at, event.shiftKey ? -1 : 1);
    if (to >= 0) {
        event.preventDefault();
        // a workbench inside a workbench: the inner one has moved the focus, the outer one must not move it again
        // рамка в рамке: внутренняя уже сдвинула фокус, внешняя не должна двигать его снова
        event.stopPropagation();
        regions[to]!.focus();
    }
}

function skip() {
    mainRef.value?.focus();
}
const mainRef = ref<HTMLElement | null>(null);
</script>

<template>
    <div
        ref="rootRef"
        class="tao-workbench"
        :class="{ 'tao-workbench--glow': glow }"
        @keydown="onKeydown"
    >
        <a class="tao-workbench__skip" :href="`#${mainId}`" @click.prevent="skip">{{ l10n.skipLabel }}</a>

        <header class="tao-workbench__bar tao-workbench__bar--top" data-tao-region tabindex="-1" role="region" :aria-label="topLabel ?? l10n.topLabel">
            <div class="tao-workbench__start"><slot name="top-start" /></div>
            <div class="tao-workbench__end"><slot name="top-end" /></div>
        </header>

        <nav class="tao-workbench__rail tao-workbench__rail--left" data-tao-region tabindex="-1" :aria-label="leftLabel ?? l10n.leftLabel">
            <div class="tao-workbench__start">
                <template v-for="tool in leftTools" :key="tool.id"><span v-if="tool.separator" class="tao-workbench__sep tao-workbench__sep--horizontal" role="separator" aria-orientation="horizontal" /><TaoTooltip :content="tool.label" :shortcut="tool.shortcut" placement="right" variant="raised">
                    <button
                        type="button"
                        class="tao-workbench__tool"
                        :class="{ 'tao-workbench__tool--on': left === tool.id }"
                        :aria-pressed="left === tool.id"
                        :aria-label="toolName(tool)"
                        :aria-keyshortcuts="tool.shortcut"
                        :disabled="tool.disabled"
                        :data-tao-tool="`left:${tool.id}`"
                        @click="press('left', tool)"
                    >
                        <TaoIcon v-if="tool.icon" :name="tool.icon" :size="20" />
                        <span v-if="tool.badge !== undefined && tool.badge !== false" class="tao-workbench__badge" :class="{ 'tao-workbench__badge--dot': tool.badge === true }">
                            <span aria-hidden="true">{{ tool.badge === true ? '' : tool.badge }}</span>
                        </span>
                    </button>
                </TaoTooltip></template>
                <slot name="left-start" />
            </div>
            <div class="tao-workbench__end"><slot name="left-end" /></div>
        </nav>

        <div class="tao-workbench__body">
            <TaoSplit
                v-model="leftSize"
                @commit="(value: number) => emit('commit', 'leftSize', value)"
                unit="px"
                :min="panelMin"
                :min-end="centerMin + (openRight ? panelMin + GUTTER : 0)"
                :label="openLeft?.label"
                :collapsed="openLeft ? false : 'start'"
                class="tao-workbench__split"
            >
                <template #start>
                    <section v-if="openLeft" class="tao-workbench__block tao-workbench__panel" data-tao-region tabindex="-1" :aria-label="openLeft.label" data-tao-panel="left">
                        <header class="tao-workbench__panel-head">
                            <TaoIcon v-if="openLeft.icon" :name="openLeft.icon" :size="16" />
                            <div class="tao-workbench__panel-title" role="heading" aria-level="2">{{ openLeft.label }}</div>
                            <span class="tao-workbench__panel-actions"><slot name="panel-actions" :tool="openLeft" side="left" /></span>
                            <button type="button" class="tao-workbench__close" :aria-label="closeText(openLeft)" @click="closePanel('left')"><TaoIcon name="tao-close" :size="14" /></button>
                        </header>
                        <div class="tao-workbench__panel-body"><slot name="left-panel" :tool="openLeft" /></div>
                    </section>
                </template>
                <template #end>
                    <TaoSplit
                        v-model="rightSize"
                        @commit="(value: number) => emit('commit', 'rightSize', value)"
                        unit="px"
                        anchor="end"
                        :min="panelMin"
                        :min-end="centerMin"
                        :collapsed="openRight ? false : 'end'"
                        :label="openRight?.label"
                        class="tao-workbench__split"
                    >
                        <template #start>
                            <TaoSplit
                                v-model="bottomSize"
                                @commit="(value: number) => emit('commit', 'bottomSize', value)"
                                unit="px"
                                direction="column"
                                anchor="end"
                                :min="panelMin"
                                :min-end="centerMin"
                                :collapsed="openBottom ? false : 'end'"
                                :label="openBottom?.label"
                                class="tao-workbench__split"
                            >
                                <template #start>
                                    <main :id="mainId" ref="mainRef" class="tao-workbench__block tao-workbench__main" data-tao-region tabindex="-1" :aria-label="mainLabel ?? l10n.mainLabel">
                                        <slot />
                                    </main>
                                </template>
                                <template #end>
                                    <section v-if="openBottom" class="tao-workbench__block tao-workbench__panel" data-tao-region tabindex="-1" :aria-label="openBottom.label" data-tao-panel="bottom">
                                        <header class="tao-workbench__panel-head">
                                            <TaoIcon v-if="openBottom.icon" :name="openBottom.icon" :size="16" />
                                            <div class="tao-workbench__panel-title" role="heading" aria-level="2">{{ openBottom.label }}</div>
                                            <span class="tao-workbench__panel-actions"><slot name="panel-actions" :tool="openBottom" side="bottom" /></span>
                                            <button type="button" class="tao-workbench__close" :aria-label="closeText(openBottom)" @click="closePanel('bottom')"><TaoIcon name="tao-close" :size="14" /></button>
                                        </header>
                                        <div class="tao-workbench__panel-body"><slot name="bottom-panel" :tool="openBottom" /></div>
                                    </section>
                                </template>
                            </TaoSplit>
                        </template>
                        <template #end>
                            <section v-if="openRight" class="tao-workbench__block tao-workbench__panel" data-tao-region tabindex="-1" :aria-label="openRight.label" data-tao-panel="right">
                                <header class="tao-workbench__panel-head">
                                    <TaoIcon v-if="openRight.icon" :name="openRight.icon" :size="16" />
                                    <div class="tao-workbench__panel-title" role="heading" aria-level="2">{{ openRight.label }}</div>
                                    <span class="tao-workbench__panel-actions"><slot name="panel-actions" :tool="openRight" side="right" /></span>
                                    <button type="button" class="tao-workbench__close" :aria-label="closeText(openRight)" @click="closePanel('right')"><TaoIcon name="tao-close" :size="14" /></button>
                                </header>
                                <div class="tao-workbench__panel-body"><slot name="right-panel" :tool="openRight" /></div>
                            </section>
                        </template>
                    </TaoSplit>
                </template>
            </TaoSplit>
        </div>

        <nav class="tao-workbench__rail tao-workbench__rail--right" data-tao-region tabindex="-1" :aria-label="rightLabel ?? l10n.rightLabel">
            <div class="tao-workbench__start">
                <template v-for="tool in rightTools" :key="tool.id"><span v-if="tool.separator" class="tao-workbench__sep tao-workbench__sep--horizontal" role="separator" aria-orientation="horizontal" /><TaoTooltip :content="tool.label" :shortcut="tool.shortcut" placement="left" variant="raised">
                    <button
                        type="button"
                        class="tao-workbench__tool"
                        :class="{ 'tao-workbench__tool--on': right === tool.id }"
                        :aria-pressed="right === tool.id"
                        :aria-label="toolName(tool)"
                        :aria-keyshortcuts="tool.shortcut"
                        :disabled="tool.disabled"
                        :data-tao-tool="`right:${tool.id}`"
                        @click="press('right', tool)"
                    >
                        <TaoIcon v-if="tool.icon" :name="tool.icon" :size="20" />
                        <span v-if="tool.badge !== undefined && tool.badge !== false" class="tao-workbench__badge" :class="{ 'tao-workbench__badge--dot': tool.badge === true }">
                            <span aria-hidden="true">{{ tool.badge === true ? '' : tool.badge }}</span>
                        </span>
                    </button>
                </TaoTooltip></template>
                <slot name="right-start" />
            </div>
            <div class="tao-workbench__end"><slot name="right-end" /></div>
        </nav>

        <footer class="tao-workbench__bar tao-workbench__bar--bottom" data-tao-region tabindex="-1" role="region" :aria-label="bottomLabel ?? l10n.bottomLabel">
            <div class="tao-workbench__start">
                <template v-for="tool in bottomTools" :key="tool.id"><span v-if="tool.separator" class="tao-workbench__sep tao-workbench__sep--vertical" role="separator" aria-orientation="vertical" /><TaoTooltip :content="tool.label" :shortcut="tool.shortcut" placement="top" variant="raised">
                    <button
                        type="button"
                        class="tao-workbench__tool tao-workbench__tool--bar"
                        :class="{ 'tao-workbench__tool--on': bottom === tool.id }"
                        :aria-pressed="bottom === tool.id"
                        :aria-label="toolName(tool)"
                        :aria-keyshortcuts="tool.shortcut"
                        :disabled="tool.disabled"
                        :data-tao-tool="`bottom:${tool.id}`"
                        @click="press('bottom', tool)"
                    >
                        <TaoIcon v-if="tool.icon" :name="tool.icon" :size="16" />
                        <span v-if="tool.badge !== undefined && tool.badge !== false" class="tao-workbench__badge tao-workbench__badge--inline" :class="{ 'tao-workbench__badge--dot': tool.badge === true }">
                            <span aria-hidden="true">{{ tool.badge === true ? '' : tool.badge }}</span>
                        </span>
                    </button>
                </TaoTooltip></template>
                <slot name="bottom-start" />
            </div>
            <div class="tao-workbench__end"><slot name="bottom-end" /></div>
        </footer>
    </div>
</template>

<style scoped>
.tao-workbench {
    --tao-workbench-bar: calc(var(--tao-control-height) + var(--tao-space-1));
    --tao-workbench-rail: calc(var(--tao-control-height) + var(--tao-space-2));
    --tao-workbench-gap: var(--tao-space-2);
    --tao-workbench-glow: var(--tao-glow, var(--tao-color-accent));

    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-areas:
        'top top top'
        'left body right'
        'bottom bottom bottom';
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    isolation: isolate;
    /* the chrome: the page colour in the dark theme, a little grey in the light one, so the white blocks stand out on it */
    /* оправа: цвет страницы в тёмной теме, чуть серая в светлой, чтобы на ней выделялись белые блоки */
    background-color: light-dark(color-mix(in srgb, var(--tao-color-bg) 93%, var(--tao-color-text-strong)), var(--tao-color-bg));
    color: var(--tao-color-text);
}

/* the glow: a soft light from the top left corner, the colour of the palette (`--tao-workbench-glow`) / свечение из левого верхнего угла, цвета палитры */
.tao-workbench--glow {
    background-image: radial-gradient(
        ellipse 55% 60% at 0% 0%,
        color-mix(in srgb, var(--tao-workbench-glow) 32%, transparent),
        color-mix(in srgb, var(--tao-workbench-glow) 10%, transparent) 45%,
        transparent 75%
    );
    background-repeat: no-repeat;
}

.tao-workbench__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--tao-space-2);
    min-height: var(--tao-workbench-bar);
    padding: 0 var(--tao-space-2);
}

.tao-workbench__bar--top {
    grid-area: top;
}

.tao-workbench__bar--bottom {
    grid-area: bottom;
    font-size: var(--tao-control-font-size-secondary);
    color: var(--tao-color-text-muted);
}

/* the two ends of a bar: the first at the start, the other at the far end / два конца полосы: первый в начале, другой у дальнего края */
.tao-workbench__start,
.tao-workbench__end {
    display: flex;
    align-items: center;
    gap: var(--tao-space-1);
    min-width: 0;
}

.tao-workbench__rail {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: var(--tao-workbench-rail);
    padding: var(--tao-space-1) 0;
}

.tao-workbench__rail--left {
    grid-area: left;
}

.tao-workbench__rail--right {
    grid-area: right;
}

.tao-workbench__rail > .tao-workbench__start,
.tao-workbench__rail > .tao-workbench__end {
    flex-direction: column;
}

/* a line before a tool that starts a new group of buttons (`separator`): across a rail, upright in the bottom bar / линия перед инструментом, с которого начинается новая группа кнопок (`separator`): поперёк рейки, стоймя в нижней полосе */
.tao-workbench__sep {
    flex: none;
    background: var(--tao-color-border-strong);
}

.tao-workbench__sep--horizontal {
    align-self: stretch;
    height: 1px;
    margin: var(--tao-space-1) var(--tao-space-2);
}

.tao-workbench__sep--vertical {
    align-self: center;
    width: 1px;
    height: 1em;
    margin: 0 var(--tao-space-1);
}

/* a tool: an icon button; lit while its panel is open / инструмент: кнопка-иконка; подсвечена, пока открыта его панель */
.tao-workbench__tool {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--tao-control-height);
    height: var(--tao-control-height);
    padding: 0;
    border: 0;
    border-radius: var(--tao-radius-control);
    background: transparent;
    color: var(--tao-color-text-muted);
    cursor: pointer;
}

.tao-workbench__tool:hover:not(:disabled):not(.tao-workbench__tool--on) {
    background: var(--tao-color-hover);
    color: var(--tao-color-text-strong);
}

.tao-workbench__tool:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-workbench__tool:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.tao-workbench__tool--on {
    background: var(--tao-color-accent-subtle);
    color: var(--tao-color-accent-text);
}

.tao-workbench__tool--bar {
    width: auto;
    height: calc(var(--tao-control-height) - var(--tao-space-1));
    padding: 0 var(--tao-space-2);
    gap: var(--tao-space-1);
}

.tao-workbench__badge {
    position: absolute;
    top: 2px;
    right: 2px;
    min-width: 14px;
    padding: 0 var(--tao-space-1);
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-accent);
    color: var(--tao-color-accent-on, var(--tao-color-bg));
    font-size: 10px;
    line-height: 14px;
    text-align: center;
}

.tao-workbench__badge--dot {
    min-width: 8px;
    width: 8px;
    height: 8px;
    padding: 0;
}

.tao-workbench__badge--inline {
    position: static;
}

/* the blocks: darker than the page, rounded, over the glow; the gutter of the split is the gap between them (no line) / блоки: темнее страницы, скруглённые, над свечением; зазор между ними это зазор split (без линии) */
.tao-workbench__body {
    grid-area: body;
    min-width: 0;
    min-height: 0;
    padding: 0 var(--tao-workbench-gap) 0 0;
}

.tao-workbench__rail--left + .tao-workbench__body {
    padding-inline: 0 var(--tao-workbench-gap);
}

.tao-workbench__split {
    --tao-split-gutter: var(--tao-workbench-gap);
    --tao-split-line: 0px;
}

.tao-workbench__block {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--tao-color-border) var(--tao-frame-alpha, 100%), transparent);
    border-radius: var(--tao-radius-panel);
    /* darker than the chrome in the dark theme; white on the grey chrome in the light one (as in an IDE) / темнее оправы в тёмной теме; белые на серой оправе в светлой (как в IDE) */
    background: light-dark(var(--tao-color-bg), color-mix(in srgb, var(--tao-color-bg) 55%, black));
}

.tao-workbench__block:focus {
    outline: none;
}

.tao-workbench__block:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-workbench__main {
    display: block;
}

.tao-workbench__panel-head {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--tao-space-2);
    min-height: var(--tao-control-height);
    padding: 0 var(--tao-space-2) 0 var(--tao-space-3);
    color: var(--tao-color-text-muted);
}

.tao-workbench__panel-title {
    flex: 1;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    font-size: var(--tao-control-font-size-secondary);
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--tao-color-text);
}

.tao-workbench__panel-actions {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-1);
}

.tao-workbench__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: var(--tao-radius-control);
    background: transparent;
    color: inherit;
    cursor: pointer;
}

.tao-workbench__close:hover {
    background: var(--tao-color-hover);
    color: var(--tao-color-text-strong);
}

.tao-workbench__panel-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
}

/* out of the way until it takes the focus / не мешает, пока не получит фокус */
.tao-workbench__skip {
    position: fixed;
    top: var(--tao-space-2);
    left: var(--tao-space-2);
    z-index: var(--tao-z-toast);
    padding: var(--tao-space-2) var(--tao-space-3);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
    box-shadow: var(--tao-shadow-overlay);
    transform: translateY(-200%);
}

.tao-workbench__skip:focus {
    transform: none;
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .tao-workbench__tool,
    .tao-workbench__close {
        transition: none;
    }
}
</style>
