<script lang="ts" setup>
import { computed } from 'vue';
import { devWarning } from '../deprecate';
import { resolveTaoIcon, TAO_ICON_PREFIX } from '../icons';

defineOptions({ name: 'TaoIcon' });

interface Props {
    /**
     * `tao-check` and the rest of the built-in set; a name registered with `registerTaoIcons`;
     * any other name is the `icon-<name>` class of your own icon font.
     * `tao-check` и остальной встроенный набор; имя из `registerTaoIcons`; любое другое — класс `icon-<name>` вашего шрифта.
     */
    name: string;
    margin?: string;
    /** Pixels. Without it an SVG icon is 1em (follows the font size), a font icon keeps its own size. / Пиксели; без него SVG-иконка 1em. */
    size?: number;
    invert?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    margin: '0px',
});

const def = computed(() => resolveTaoIcon(props.name));

if (props.name.startsWith(TAO_ICON_PREFIX) && !def.value) {
    devWarning(`icon:${props.name}`, `TaoIcon: there is no built-in icon "${props.name}".`);
}

const box = computed(() => (props.size ? `${props.size}px` : '1em'));
</script>

<template>
    <span class="tao-icon">
        <slot name="prefix" />
        <svg
            v-if="def"
            class="tao-icon__value tao-icon__svg"
            :class="{ 'tao-icon__value--invert': props.invert, 'tao-icon__svg--grid': def.grid }"
            :viewBox="def.viewBox ?? '0 0 24 24'"
            :width="box"
            :height="box"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
            v-html="def.body"
        ></svg>
        <i
            v-else
            class="tao-icon__value"
            :class="[`icon-${props.name}`, { 'tao-icon__value--invert': props.invert }]"
            :style="props.size ? `font-size: ${props.size}px` : ''"
        />
        <slot name="postfix" />
    </span>
</template>

<style scoped>
/**
 * Built-in (`tao-*`) and registered icons are inline SVG. Any other name renders the class icon-<name> and relies on
 * an external icon font that the app brings itself; the library does not ship one (see README).
 * Встроенные и зарегистрированные иконки — inline SVG. Любое другое имя даёт класс icon-<name> и полагается на внешний
 * шрифт, который приложение подключает само; библиотека его не поставляет.
 */
.tao-icon {
    display: inline-flex;
    align-items: center;
}

.tao-icon__value {
    margin: v-bind('props.margin');
}

.tao-icon__svg {
    flex: 0 0 auto;
}

/* lines through the middle land on a pixel boundary at even sizes: 2 whole pixels across it are crisp
   линии через середину при чётном размере попадают на границу пикселей: 2 целых пикселя поперёк неё — чётко */
.tao-icon__svg--grid {
    shape-rendering: crispEdges;
}

.tao-icon__svg--grid :deep(*) {
    vector-effect: non-scaling-stroke;
    stroke-width: 2px;
}

.tao-icon__value--invert {
    filter: invert();
}
</style>
