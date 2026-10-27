<script lang="ts" setup>
import { computed } from 'vue';
import { toCssBox, toCssLength, type TaoLength } from '../length';
import { stripeClasses, type TaoStripe, type TaoStripeTone } from '../stripe';
import { surfaceClass, type TaoSurface } from '../surface';

defineOptions({ name: 'TaoBlock' });

interface Props {
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    padding?: TaoLength | TaoLength[];
    /** Number — px, string — any CSS length. / Число — px, строка — любая CSS-длина. */
    radius?: TaoLength;
    shadow?: boolean;
    hover?: boolean;
    /** `flat` fill, `grain` film grain, `glass` blurred translucent. / Из чего сделана панель. */
    surface?: TaoSurface;
    /** A coloured stripe on one side; the corners clip it. / Цветная полоса с одной стороны; углы её обрезают. */
    stripe?: TaoStripe;
    /** The stripe colour: a tone or `gradient`; accent by default. / Цвет полосы: тон или `gradient`. */
    stripeTone?: TaoStripeTone;
}

const props = withDefaults(defineProps<Props>(), {
    padding: undefined,
    radius: undefined,
    shadow: true,
    hover: false,
    surface: 'flat',
    stripe: undefined,
    stripeTone: 'accent',
});

// Only what the user passed goes inline; the defaults come from tokens (see .tao-panel in styles/contexts/surface.css).
// В inline уходит только то, что передал пользователь; значения по умолчанию — из токенов.
const panelStyle = computed(() => {
    const pad = props.padding;
    const first = Array.isArray(pad) ? pad[0] : pad;
    return {
        padding: pad === undefined ? undefined : toCssBox(pad),
        '--tao-pad': first === undefined ? undefined : toCssLength(first),
        '--tao-radius': toCssLength(props.radius),
    };
});
</script>

<template>
    <div
        class="tao-block tao-panel"
        :class="[surfaceClass(surface), stripeClasses(stripe, stripeTone), { 'tao-block--shadow': shadow, 'tao-block--hover': hover }]"
        :style="panelStyle"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-block {
    padding: var(--tao-pad);
    background-color: var(--tao-surface-fill, var(--tao-color-surface));
    background-image: var(--tao-surface-image, none);
    background-size: var(--tao-surface-image-size, auto);
    box-shadow: var(--tao-surface-inset, 0 0 #0000);
    -webkit-backdrop-filter: var(--tao-surface-backdrop, none);
    backdrop-filter: var(--tao-surface-backdrop, none);
    color: var(--tao-color-text);
    transition: var(--tao-transition-base);
}

.tao-block--shadow {
    box-shadow: var(--tao-surface-inset, 0 0 #0000), var(--tao-shadow-panel);
}

.tao-block--hover {
    cursor: pointer;
}

.tao-block--hover:hover {
    box-shadow: var(--tao-surface-inset, 0 0 #0000), var(--tao-shadow-md);
}
</style>
