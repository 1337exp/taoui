<script lang="ts" setup>
import { computed, useSlots } from 'vue';
import { toCssBox, toCssLength, type TaoLength } from '../length';
import { surfaceClass, type TaoSurface } from '../surface';

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
});

const slots = useSlots();

const hasContent = computed(
    () =>
        Boolean(slots.headerTitle) ||
        Boolean(slots.header) ||
        Boolean(slots.headerSecondary) ||
        Boolean(slots.title) ||
        Boolean(slots.sub) ||
        Boolean(slots.default) ||
        Boolean(slots.footer),
);

const coverOnly = computed(() => Boolean(slots.cover) && !hasContent.value);

// Only what the user passed goes inline; the defaults come from tokens (see .tao-panel in surface.css).
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
            'tao-card--cover-only': coverOnly,
        }]"
        :style="radiusStyle"
    >
        <div v-if="$slots.cover" class="tao-card__cover">
            <slot name="cover" />
            <div v-if="$slots.overlay" class="tao-card__overlay">
                <slot name="overlay" />
            </div>
        </div>
        <div v-else-if="$slots.overlay" class="tao-card__overlay">
            <slot name="overlay" />
        </div>

        <div v-if="hasContent" class="tao-card__content" :style="paddingStyle">
            <h2 v-if="$slots.headerTitle" class="tao-card__header-title">
                <slot name="headerTitle" />
            </h2>

            <div v-if="$slots.header || $slots.headerSecondary" class="tao-card__header" :class="{ 'tao-card__header--between': $slots.headerSecondary }">
                <span><slot name="header" /></span>
                <span v-if="$slots.headerSecondary"><slot name="headerSecondary" /></span>
            </div>

            <div v-if="$slots.title || $slots.sub" class="tao-card__title-block">
                <h2 v-if="$slots.title" class="tao-card__title"><slot name="title" /></h2>
                <div v-if="$slots.sub" class="tao-card__sub"><slot name="sub" /></div>
            </div>

            <div v-if="$slots.default" class="tao-card__body"><slot /></div>

            <div v-if="$slots.footer" class="tao-card__footer"><slot name="footer" /></div>
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

.tao-card__cover {
    position: relative;
    overflow: hidden;
}

.tao-card--cover-only .tao-card__cover {
    flex: 1 1 auto;
    min-height: 0;
}

.tao-card--cover-only .tao-card__cover > :deep(img) {
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

.tao-card__header-title {
    margin: 0 0 var(--tao-space-5);
    font-weight: 500;
    text-align: center;
    color: var(--tao-color-text-strong);
}

.tao-card__header {
    margin-top: -6px;
    padding: 2px 0 var(--tao-space-2);
    font-size: var(--tao-font-size-sm);
    font-weight: 700;
}

.tao-card__header--between {
    display: flex;
    justify-content: space-between;
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
