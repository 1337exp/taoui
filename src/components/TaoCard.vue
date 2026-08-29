<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
    padding?: number | number[];
    radius?: number;
    shadow?: boolean;
    shadowBottomOnly?: boolean;
    hover?: boolean;
    active?: boolean;
    overflow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    padding: 20,
    radius: 8,
    shadow: true,
    shadowBottomOnly: false,
    hover: false,
    active: false,
    overflow: false,
});

const paddingStyle = computed(() => {
    if (Array.isArray(props.padding)) {
        return { padding: `${props.padding.map((p) => `${p}px`).join(' ')}` };
    }
    return { padding: `${props.padding}px` };
});

const radiusStyle = computed(() => ({ borderRadius: `${props.radius}px` }));
</script>

<template>
    <div
        class="tao-card"
        :class="{
            'tao-card--shadow': shadow && !shadowBottomOnly,
            'tao-card--shadow-bottom': shadowBottomOnly,
            'tao-card--hover': hover,
            'tao-card--active': active,
            'tao-card--overflow': overflow,
        }"
        :style="radiusStyle"
    >
        <div v-if="$slots.cover" class="tao-card__cover">
            <slot name="cover" />
        </div>

        <div class="tao-card__content" :style="paddingStyle">
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
    width: 100%;
    background: var(--tao-color-surface-raised);
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
    box-shadow: var(--tao-shadow-panel);
}

.tao-card--shadow-bottom {
    box-shadow: 0 1px 0 0 var(--tao-color-border-strong);
}

.tao-card--hover {
    cursor: pointer;
}

.tao-card--hover:hover,
.tao-card--hover.tao-card--active {
    box-shadow: 0 0 0 1px var(--tao-color-accent), var(--tao-shadow-lg);
}

.tao-card__cover {
    overflow: hidden;
}

.tao-card__content {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-3);
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
    font-size: var(--tao-font-size-md);
}
</style>
