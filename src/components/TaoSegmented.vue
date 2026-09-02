<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';
import { type TaoRadioValue } from '../radio';
import { segmentedKey, type TaoSegmentedSize } from '../segmented';

defineOptions({ name: 'TaoSegmented' });

const props = withDefaults(
    defineProps<{
        modelValue?: TaoRadioValue;
        name?: string;
        legend?: string;
        disabled?: boolean;
        size?: TaoSegmentedSize;
        block?: boolean;
    }>(),
    {
        disabled: false,
        size: 'medium',
        block: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: TaoRadioValue];
    change: [value: TaoRadioValue];
}>();

const field = inject(formFieldKey, null);
const autoName = useId();
const groupName = computed(() => props.name || autoName);
const model = computed(() => props.modelValue);
const groupDisabled = computed(() => props.disabled);
const groupSize = computed(() => props.size);
const invalid = computed(() => Boolean(field?.invalid.value));
const describedBy = computed(() => field?.describedBy.value);

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

    const trackBox = track.getBoundingClientRect();
    const optionBox = selected.getBoundingClientRect();
    const next = {
        width: `${optionBox.width}px`,
        height: `${optionBox.height}px`,
        transform: `translate(${optionBox.left - trackBox.left - track.clientLeft}px, ${optionBox.top - trackBox.top - track.clientTop}px)`,
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
    size: groupSize,
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
            `tao-segmented--${size}`,
            {
                'tao-segmented--block': block,
                'tao-segmented--disabled': disabled,
                'tao-segmented--invalid': invalid,
            },
        ]"
        :disabled="disabled"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
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
}

.tao-segmented--block {
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
    min-width: 0;
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
