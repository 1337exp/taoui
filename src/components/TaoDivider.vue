<script lang="ts" setup>
import { computed, useSlots } from 'vue';

defineOptions({ name: 'TaoDivider' });

const props = withDefaults(
    defineProps<{
        /** `solid` — обычная линия. `dashed` — пунктир. `colored` — акцент. `gap` — пустой отступ. */
        variant?: 'solid' | 'dashed' | 'colored' | 'gap';
        size?: 'small' | 'medium' | 'large' | 'big';
        /** Подпись посередине. Не меняет стиль линии — для этого `variant`. */
        text?: string;
        /** Плавные края линии. У `gap` ничего не делает. */
        fade?: boolean;
    }>(),
    {
        variant: 'solid',
        size: 'medium',
        text: '',
        fade: false,
    },
);

const slots = useSlots();
const gapSize = computed(() => (props.size === 'big' ? 'large' : props.size));
const hasLabel = computed(() => Boolean(props.text) || Boolean(slots.default));
</script>

<template>
    <div
        class="tao-divider"
        :class="[
            `tao-divider--${variant}`,
            {
                'tao-divider--labeled': hasLabel,
                'tao-divider--fade': fade && variant !== 'gap',
                [`tao-divider--gap-${gapSize}`]: variant === 'gap',
            },
        ]"
        :role="variant === 'gap' && !hasLabel ? undefined : 'separator'"
        :aria-hidden="variant === 'gap' && !hasLabel ? true : undefined"
    >
        <span
            v-if="variant !== 'gap'"
            class="tao-divider__line"
            :class="{ 'tao-divider__line--start': hasLabel }"
        />
        <span v-if="hasLabel" class="tao-divider__text">
            <slot>{{ text }}</slot>
        </span>
        <span
            v-if="variant !== 'gap' && hasLabel"
            class="tao-divider__line tao-divider__line--end"
        />
    </div>
</template>

<style scoped>
.tao-divider {
    margin: var(--tao-space-5) 0;
}

.tao-divider--labeled {
    display: flex;
    align-items: center;
}

.tao-divider__line {
    box-sizing: content-box;
    display: block;
    height: 0;
    min-width: 0;
}

.tao-divider--labeled .tao-divider__line {
    flex: 1;
}

.tao-divider:not(.tao-divider--labeled) .tao-divider__line {
    width: 100%;
}

.tao-divider__text {
    margin: 0 var(--tao-space-4);
    font-size: var(--tao-font-size-xs);
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    color: var(--tao-color-text-muted);
}

.tao-divider--labeled:not(.tao-divider--gap) .tao-divider__text {
    height: 1px;
    display: flex;
    align-items: center;
    overflow: visible;
}

.tao-divider--solid .tao-divider__line {
    border-top: 1px solid var(--tao-color-border);
}

.tao-divider--dashed .tao-divider__line {
    border-top: 1px dashed var(--tao-color-border-strong);
    opacity: 0.45;
}

.tao-divider--colored .tao-divider__line {
    height: 1px;
    background: var(--tao-color-accent);
}

.tao-divider--colored.tao-divider--fade:not(.tao-divider--labeled) .tao-divider__line {
    background: linear-gradient(to right, transparent, var(--tao-color-accent), transparent);
}

.tao-divider--colored.tao-divider--fade.tao-divider--labeled .tao-divider__line--start {
    background: linear-gradient(to right, transparent, var(--tao-color-accent));
}

.tao-divider--colored.tao-divider--fade.tao-divider--labeled .tao-divider__line--end {
    background: linear-gradient(to left, transparent, var(--tao-color-accent));
}

.tao-divider--fade:not(.tao-divider--colored):not(.tao-divider--labeled) .tao-divider__line {
    mask: linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%);
}

.tao-divider--fade:not(.tao-divider--colored) .tao-divider__line--start {
    mask: linear-gradient(90deg, transparent 0%, black 30%);
}

.tao-divider--fade:not(.tao-divider--colored) .tao-divider__line--end {
    mask: linear-gradient(90deg, black 70%, transparent 100%);
}

.tao-divider--gap {
    margin: 0;
}

.tao-divider--gap:not(.tao-divider--labeled) {
    height: 40px;
}

.tao-divider--gap-small:not(.tao-divider--labeled) {
    height: 20px;
}

.tao-divider--gap-large:not(.tao-divider--labeled),
.tao-divider--gap-big:not(.tao-divider--labeled) {
    height: 60px;
}

.tao-divider--gap.tao-divider--labeled {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
}

.tao-divider--gap-small.tao-divider--labeled {
    min-height: 20px;
}

.tao-divider--gap-large.tao-divider--labeled,
.tao-divider--gap-big.tao-divider--labeled {
    min-height: 60px;
}
</style>
