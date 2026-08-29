<script lang="ts" setup>
interface Props {
    variant?: 'gap' | 'line' | 'text';
    size?: 'small' | 'medium' | 'big';
}

withDefaults(defineProps<Props>(), {
    variant: 'line',
    size: 'medium',
});
</script>

<template>
    <div v-if="variant === 'gap'" class="tao-divider-gap" :class="`tao-divider-gap--${size}`"></div>

    <div v-else-if="variant === 'text'" class="tao-divider-text">
        <span class="tao-divider-text__line tao-divider-text__line--left"></span>
        <span class="tao-divider-text__value"><slot /></span>
        <span class="tao-divider-text__line tao-divider-text__line--right"></span>
    </div>

    <div v-else class="tao-divider-line"></div>
</template>

<style scoped>
/* variant="gap" — пустой отступ заданной высоты, без линии */
.tao-divider-gap {
    height: 40px;
}

.tao-divider-gap--small {
    height: 20px;
}

.tao-divider-gap--big {
    height: 60px;
}

/* variant="text" — линия с текстом посередине, затухающая по краям */
.tao-divider-text {
    display: flex;
    align-items: center;
    margin: var(--tao-space-5) 0;
    padding: 0 var(--tao-space-4);
    opacity: 0.3;
}

.tao-divider-text__line {
    flex: 1;
    height: 1px;
    border-top: 1px dashed var(--tao-color-border-strong);
}

.tao-divider-text__line--left {
    mask: linear-gradient(90deg, transparent 0%, black 30%);
}

.tao-divider-text__line--right {
    mask: linear-gradient(90deg, black 70%, transparent 100%);
}

.tao-divider-text__value {
    padding: 0 var(--tao-space-4);
    font-size: var(--tao-font-size-xs);
    font-weight: 500;
    white-space: nowrap;
    color: var(--tao-color-text-muted);
}

/* variant="line" (по умолчанию) — тонкая линия с акцентным свечением по центру */
.tao-divider-line {
    position: relative;
    width: 100%;
    height: 1px;
    margin: var(--tao-space-5) auto;
}

.tao-divider-line::before {
    content: '';
    position: absolute;
    top: 0;
    left: 5%;
    right: 5%;
    width: 90%;
    height: 1px;
    background-image: linear-gradient(to right, transparent, var(--tao-color-accent), transparent);
}
</style>
