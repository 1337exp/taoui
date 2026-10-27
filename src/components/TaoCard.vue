<script lang="ts" setup>
import { computed, useSlots } from 'vue';
import { useLocaleText } from '../locale';
import { toCssBox, toCssLength, type TaoLength } from '../length';
import { surfaceClass, type TaoSurface } from '../surface';
import TaoIcon from './TaoIcon.vue';

defineOptions({ name: 'TaoCard' });

interface Props {
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    padding?: TaoLength | TaoLength[];
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    radius?: TaoLength;
    shadow?: boolean;
    shadowBottomOnly?: boolean;
    hover?: boolean;
    active?: boolean;
    overflow?: boolean;
    /** Плитка: без отступа и без тени, cover/body тянутся на ячейку. */
    flush?: boolean;
    /** `flat` fill, `grain` film grain, `glass` blurred translucent. / Из чего сделана панель. */
    surface?: TaoSurface;
    /** A close button in the top right corner; the parent removes the card on `close`. / Кнопка закрытия в правом верхнем углу; карточку убирает родитель по `close`. */
    closable?: boolean;
    /** Screen-reader name of the close button. / Имя кнопки закрытия для скринридера. */
    closeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    padding: undefined,
    radius: undefined,
    shadow: true,
    shadowBottomOnly: false,
    hover: false,
    active: false,
    overflow: false,
    flush: false,
    surface: 'flat',
    closable: false,
});
const l10n = useLocaleText(props, 'card');

const emit = defineEmits<{
    /** The close button was pressed. / Нажата кнопка закрытия. */
    close: [];
}>();

defineSlots<{
    /** A picture or a carousel at the top. / Картинка или карусель сверху. */
    media?(): unknown;
    /** A scrim over the media (or over the whole tile). / Подложка поверх media (или всей плитки). */
    overlay?(): unknown;
    /** The top row: anything, laid out as you like. / Верхняя строка: что угодно, раскладка ваша. */
    header?(): unknown;
    title?(): unknown;
    sub?(): unknown;
    default?(): unknown;
    footer?(): unknown;
    /** The top right corner of the card (a tag, a menu button); the title leaves room for it. / Правый верхний угол (тег, кнопка меню); заголовок оставляет ему место. */
    corner?(): unknown;
}>();

const slots = useSlots();

const hasContent = computed(
    () =>
        Boolean(slots.header) ||
        Boolean(slots.title) ||
        Boolean(slots.sub) ||
        Boolean(slots.default) ||
        Boolean(slots.footer),
);

const mediaOnly = computed(() => Boolean(slots.media) && !hasContent.value);
const hasCorner = computed(() => Boolean(slots.corner) || props.closable);

// Only what the user passed goes inline; the defaults come from tokens (see .tao-panel in styles/contexts/surface.css).
// В inline уходит только то, что передал пользователь; значения по умолчанию — из токенов.
const paddingStyle = computed(() => (props.padding === undefined || props.flush ? undefined : { padding: toCssBox(props.padding) }));

const radiusStyle = computed(() => {
    const pad = props.padding;
    const first = Array.isArray(pad) ? pad[0] : pad;
    return {
        '--tao-radius': toCssLength(props.radius),
        '--tao-pad': first === undefined ? undefined : toCssLength(first),
    };
});
const showPanelShadow = computed(() => props.shadow && !props.shadowBottomOnly && !props.flush);
</script>

<template>
    <div
        class="tao-card tao-panel"
        :class="[surfaceClass(surface), {
            'tao-card--shadow': showPanelShadow,
            'tao-card--shadow-bottom': shadowBottomOnly,
            'tao-card--hover': hover,
            'tao-card--active': active,
            'tao-card--overflow': overflow,
            'tao-card--flush': flush,
            'tao-card--media-only': mediaOnly,
            'tao-card--has-corner': hasCorner,
        }]"
        :style="radiusStyle"
    >
        <div v-if="$slots.media" class="tao-card__media">
            <slot name="media" />
            <div v-if="$slots.overlay" class="tao-card__overlay">
                <slot name="overlay" />
            </div>
        </div>
        <div v-else-if="$slots.overlay" class="tao-card__overlay">
            <slot name="overlay" />
        </div>

        <div v-if="hasContent" class="tao-card__content" :style="paddingStyle">
            <div v-if="$slots.header" class="tao-card__header"><slot name="header" /></div>

            <div v-if="$slots.title || $slots.sub" class="tao-card__title-block">
                <h2 v-if="$slots.title" class="tao-card__title"><slot name="title" /></h2>
                <div v-if="$slots.sub" class="tao-card__sub"><slot name="sub" /></div>
            </div>

            <div v-if="$slots.default" class="tao-card__body"><slot /></div>

            <div v-if="$slots.footer" class="tao-card__footer"><slot name="footer" /></div>
        </div>

        <div v-if="hasCorner" class="tao-card__corner">
            <slot name="corner" />
            <button v-if="closable" type="button" class="tao-card__close" :aria-label="l10n.closeLabel" @click="emit('close')">
                <TaoIcon name="tao-close" :size="14" />
            </button>
        </div>
    </div>
</template>

<style scoped>
.tao-card {
    --tao-pad: var(--tao-space-5);

    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    background-color: var(--tao-surface-fill, var(--tao-color-surface-raised));
    background-image: var(--tao-surface-image, none);
    background-size: var(--tao-surface-image-size, auto);
    box-shadow: var(--tao-surface-inset, 0 0 #0000);
    -webkit-backdrop-filter: var(--tao-surface-backdrop, none);
    backdrop-filter: var(--tao-surface-backdrop, none);
    color: var(--tao-color-text);
    transition: var(--tao-transition-base);
}

.tao-card--overflow {
    overflow: visible;
}

.tao-card:not(.tao-card--overflow) {
    overflow: hidden;
}

.tao-card--shadow {
    box-shadow: var(--tao-surface-inset, 0 0 #0000), var(--tao-shadow-panel);
}

.tao-card--shadow-bottom {
    box-shadow: var(--tao-surface-inset, 0 0 #0000), 0 1px 0 0 var(--tao-color-border-strong);
}

.tao-card--hover {
    cursor: pointer;
}

.tao-card--hover:hover,
.tao-card--hover.tao-card--active {
    box-shadow: var(--tao-surface-inset, 0 0 #0000), 0 0 0 1px var(--tao-color-accent), var(--tao-shadow-lg);
}

.tao-card__media {
    position: relative;
    overflow: hidden;
}

.tao-card--cover-only .tao-card__media {
    flex: 1 1 auto;
    min-height: 0;
}

.tao-card--media-only .tao-card__media > :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.tao-card__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.tao-card__content {
    padding: var(--tao-pad);
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--tao-space-3);
    min-height: 0;
}

.tao-card--flush {
    --tao-pad: 0px;
}

.tao-card--flush .tao-card__content {
    padding: 0;
}

.tao-card__header {
    margin-top: -6px;
    padding: 2px 0 var(--tao-space-2);
    font-size: var(--tao-font-size-sm);
    font-weight: 700;
}

/* the corner floats over the card; the header and the title keep out of its way / угол плавает поверх; заголовок обходит его */
.tao-card--has-corner .tao-card__header,
.tao-card--has-corner .tao-card__title-block {
    padding-right: var(--tao-card-corner-size, var(--tao-space-8));
}

.tao-card__corner {
    position: absolute;
    z-index: 1;
    top: var(--tao-space-3);
    right: var(--tao-space-3);
    display: flex;
    align-items: center;
    gap: var(--tao-space-1);
}

.tao-card__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--tao-control-height-small);
    height: var(--tao-control-height-small);
    padding: 0;
    border: none;
    /* concentric: the same corner the card has, minus the gap to it / концентрично углу карточки */
    border-radius: var(--tao-radius-inner, var(--tao-radius-control));
    background: transparent;
    color: var(--tao-color-text-muted);
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-card__close:hover {
    color: var(--tao-color-text-strong);
    background: var(--tao-color-surface-hover);
}

.tao-card__close:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
}

.tao-card__title {
    margin: 0 0 2px;
    color: var(--tao-color-text-strong);
}

.tao-card__sub {
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-text-muted);
}

.tao-card__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    font-size: var(--tao-font-size-md);
}

.tao-card__footer {
    margin-top: auto;
}
</style>
