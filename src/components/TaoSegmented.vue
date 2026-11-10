<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, useId, watch } from 'vue';
import { useField } from '../formField';
import { type TaoRadioValue } from '../radio';
import { segmentedKey } from '../segmented';
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoSegmented' });

const props = withDefaults(
    defineProps<{
        modelValue?: TaoRadioValue;
        name?: string;
        legend?: string;
        disabled?: boolean;
        /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
        error?: boolean;
        /** Without it the group takes the size of its ancestors. / Без него — размер предков. */
        size?: TaoSize;
        block?: boolean;
        /** Minimum width of every option (number = px). Same as the `--tao-segmented-option-min-width` variable. / Минимальная ширина каждого варианта (число = px). То же, что переменная `--tao-segmented-option-min-width`. */
        minWidth?: number | string;
    }>(),
    {
        disabled: false,
        error: false,
        block: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: TaoRadioValue];
    change: [value: TaoRadioValue];
}>();

const { field, invalid, describedBy } = useField(props);
const autoName = useId();
const groupName = computed(() => props.name || autoName);
const model = computed(() => props.modelValue);
const groupDisabled = computed(() => props.disabled);
const minWidthStyle = computed(() =>
    props.minWidth === undefined
        ? undefined
        : { '--tao-segmented-option-min-width': typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth },
);

const trackRef = ref<HTMLElement | null>(null);
const thumbStyle = ref<Record<string, string>>({ opacity: '0' });
let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;

function setValue(value: TaoRadioValue) {
    emit('update:modelValue', value);
    emit('change', value);
}

function updateThumb() {
    const track = trackRef.value;
    if (!track) {
        return;
    }

    const selected = track.querySelector<HTMLElement>('.tao-segmented-option--checked');
    if (!selected) {
        if (thumbStyle.value.opacity !== '0') {
            thumbStyle.value = { opacity: '0' };
        }
        return;
    }

    // The boxes are in screen px, the thumb is drawn in layout px: inside a scaled parent (a zoomed canvas, a CSS transform) they
    // differ by the scale, which is the screen size of the track over its layout size. Without a layout (SSR, jsdom) it is 1.
    // Рамки в экранных px, а плашка рисуется в px вёрстки: внутри масштабированного предка (холст с зумом, CSS transform) они
    // отличаются на масштаб: экранный размер трека к его размеру в вёрстке. Без раскладки (SSR, jsdom) масштаб 1.
    const trackBox = track.getBoundingClientRect();
    const optionBox = selected.getBoundingClientRect();
    const scaleX = track.offsetWidth > 0 && trackBox.width > 0 ? trackBox.width / track.offsetWidth : 1;
    const scaleY = track.offsetHeight > 0 && trackBox.height > 0 ? trackBox.height / track.offsetHeight : 1;
    const next = {
        width: `${optionBox.width / scaleX}px`,
        height: `${optionBox.height / scaleY}px`,
        transform: `translate(${(optionBox.left - trackBox.left) / scaleX - track.clientLeft}px, ${(optionBox.top - trackBox.top) / scaleY - track.clientTop}px)`,
        opacity: '1',
    };

    const prev = thumbStyle.value;
    if (
        prev.width === next.width &&
        prev.height === next.height &&
        prev.transform === next.transform &&
        prev.opacity === next.opacity
    ) {
        return;
    }

    thumbStyle.value = next;
}

provide(segmentedKey, {
    name: groupName,
    model,
    disabled: groupDisabled,
    setValue,
});

onMounted(() => {
    const track = trackRef.value;
    void nextTick(updateThumb);

    if (!track) {
        return;
    }

    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => updateThumb());
        resizeObserver.observe(track);
    }

    mutationObserver = new MutationObserver(() => updateThumb());
    mutationObserver.observe(track, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
    });
});

watch(
    () => [props.modelValue, props.size, props.block, props.disabled] as const,
    () => {
        void nextTick(updateThumb);
    },
);

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    mutationObserver?.disconnect();
    mutationObserver = null;
});
</script>

<template>
    <fieldset
        class="tao-segmented"
        :class="[
            sizeClass(size),
            {
                'tao-segmented--block': block,
                'tao-segmented--disabled': disabled,
                'tao-segmented--invalid': invalid,
            },
        ]"
        :disabled="disabled"
        :style="minWidthStyle"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
        :aria-labelledby="legend ? undefined : (field ? `${field.id}-label` : undefined)"
        :id="field?.id"
    >
        <legend v-if="legend" class="tao-segmented__legend">{{ legend }}</legend>
        <div ref="trackRef" class="tao-segmented__track">
            <div class="tao-segmented__thumb" :style="thumbStyle" aria-hidden="true"></div>
            <slot />
        </div>
    </fieldset>
</template>

<style scoped>
.tao-segmented {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0;
    padding: 0;
    border: none;
    min-width: 0;
    vertical-align: top;
    /* a switch keeps the width of its options: beside a field that takes the room (a select is 100% wide) in a flex row it must
       not be squeezed until the last option is cut off. A `block` one fills its container instead (below).
       переключатель держит ширину своих вариантов: рядом с полем, берущим всё место (select — 100%), в flex-ряду его нельзя
       сжимать, пока последний вариант не обрежется. `block` заполняет контейнер (ниже). */
    flex: 0 0 auto;
}

.tao-segmented--block {
    flex: 1 1 auto;
    display: flex;
    width: 100%;
    align-items: stretch;
}

.tao-segmented__legend {
    padding: 0;
    margin-bottom: var(--tao-space-2);
    font-size: var(--tao-font-size-sm);
    font-weight: 500;
    color: var(--tao-color-text);
}

.tao-segmented__track {
    position: relative;
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: stretch;
    max-width: 100%;
    padding: 2px;
    overflow: hidden;
    background: var(--tao-color-surface-sunken);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
}

.tao-segmented--block .tao-segmented__track {
    display: flex;
    width: 100%;
}

.tao-segmented--block .tao-segmented__track > :deep(.tao-segmented-option) {
    flex: 1 1 0;
    min-width: var(--tao-segmented-option-min-width, 0);
}

.tao-segmented--block .tao-segmented__track > :deep(.tao-segmented-option__label) {
    overflow: hidden;
    text-overflow: ellipsis;
}

.tao-segmented__thumb {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    background: var(--tao-color-surface-raised);
    border: 1px solid var(--tao-color-border);
    border-radius: calc(var(--tao-radius-control) - 1px);
    box-shadow: var(--tao-shadow-sm);
    pointer-events: none;
    transition:
        transform var(--tao-duration-base) var(--tao-ease-base),
        width var(--tao-duration-base) var(--tao-ease-base),
        height var(--tao-duration-base) var(--tao-ease-base),
        opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-segmented--invalid .tao-segmented__track {
    border-color: var(--tao-color-danger);
}

.tao-segmented--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
    .tao-segmented__thumb {
        transition: none;
    }
}
</style>
