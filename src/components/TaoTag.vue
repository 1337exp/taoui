<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed, useSlots } from 'vue';
import { sizeClass, type TaoSize } from '../size';
import { toneClass, type TaoTone } from '../tone';
import { useLocaleText } from '../locale';

defineOptions({ name: 'TaoTag' });

interface Props {
    /** Status color. / Цвет статуса. */
    tone?: TaoTone;
    color?: string;
    background?: string;
    borderColor?: string;
    /** Pointer cursor, same as TaoListItem / TaoTable. / Курсор-рука, как у TaoListItem / TaoTable. */
    clickable?: boolean;
    closable?: boolean;
    closeLabel?: string;
    /** Без рамки, заливка остаётся. Высота как у обычного тега. */
    flat?: boolean;
    /** Size; without it — the size of ancestors. / Размер; без него — размер предков. */
    size?: TaoSize;
}

const props = withDefaults(defineProps<Props>(), {
    tone: undefined,
    clickable: false,
    closable: false,
    flat: false,
});
const l10n = useLocaleText(props, 'tag');

const emit = defineEmits<{
    close: [event: MouseEvent];
}>();

const slots = useSlots();
const style = computed(() => ({
    color: props.color || '',
    background: props.background || '',
    'border-color': props.flat ? 'transparent' : props.borderColor || '',
}));

function onClose(event: MouseEvent) {
    emit('close', event);
}
</script>

<template>
    <span
        class="tao-tag"
        :class="[
            props.tone ? [toneClass(props.tone), 'tao-tag--toned'] : '',
            sizeClass(size),
            {
                'tao-tag--pointer': clickable,
                'tao-tag--closable': closable,
                'tao-tag--prefix': Boolean(slots.prefix),
                'tao-tag--flat': flat,
            },
        ]"
        :style="style"
    >
        <span v-if="$slots.prefix" class="tao-tag__prefix">
            <slot name="prefix" />
        </span>
        <span class="tao-tag__text"><slot /></span>
        <button
            v-if="closable"
            type="button"
            class="tao-tag__close"
            :aria-label="l10n.closeLabel"
            @click.stop="onClose"
        >
            <span aria-hidden="true">
                <slot name="close-icon"><TaoIcon name="tao-close" /></slot>
            </span>
        </button>
    </span>
</template>

<style scoped>
.tao-tag {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    /* a tag stretched wider than its text (a grid, a fixed width) keeps the text in the middle
       тег шире своего текста (сетка, заданная ширина) держит текст посередине */
    justify-content: center;
    gap: 6px;
    max-width: 100%;
    /* min: an avatar in #prefix makes it taller / min — аватар в #prefix делает тег выше */
    min-height: var(--tao-tag-height);
    margin: 0;
    padding: 0 var(--tao-tag-padding-x);
    vertical-align: middle;
    white-space: nowrap;
    text-align: center;
    font-size: var(--tao-tag-font-size);
    /* the line is as tall as the inside of the tag (height minus the two borders): the text then sits a whole pixel from
       the edge. At 1.25 it was 15px in 16px, 1.5px from the edge, and on a fractional position of the page the box
       and the text rounded to different pixels, so the text jumped up and down from one tag to the next.
       строка ровно по внутренней высоте тега (высота минус две рамки): текст отстоит от края на целый пиксель. При 1.25
       она была 15px в 16px, то есть 1.5px от края, и на дробной позиции страницы рамка и текст округлялись к разным
       пикселям: текст «прыгал» вверх-вниз от тега к тегу. */
    line-height: calc(var(--tao-tag-height) - 2px);
    color: var(--tao-color-accent);
    background: var(--tao-color-accent-subtle);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-sm);
    transition: var(--tao-transition-base);
}

.tao-tag--pointer {
    cursor: pointer;
    user-select: none;
}

.tao-tag--prefix {
    padding-block: 2px;
    padding-inline-start: 3px;
}

.tao-tag--closable {
    padding-inline-end: 2px;
}

.tao-tag__prefix {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
}

.tao-tag__prefix :deep(.tao-avatar) {
    display: block;
}

.tao-tag__text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Optical centring: the line box is centred, but a font puts more room above its letters than below (Segoe UI, Roboto),
   so the body of the lowercase letters sat about half a pixel low. Trimmed to the x-height and the baseline, the
   letters themselves are centred, in any font; the padding gives the ascenders and descenders their room back, or the
   ellipsis clip would cut them. A browser without text-box keeps the line box centring.
   Оптическое центрирование: центрируется строка, но шрифт оставляет над буквами больше места, чем под ними, и тело
   строчных сидело на полпикселя ниже. Обрезка по высоте строчных и базовой линии центрирует сами буквы, в любом
   шрифте; отступ возвращает место выносным элементам, иначе обрезка многоточия срезала бы их. Без text-box — как было. */
@supports (text-box: trim-both ex alphabetic) {
    .tao-tag__text {
        text-box: trim-both ex alphabetic;
        padding-block: 0.3em;
    }
}

.tao-tag__close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    /* fits the tag: border + 1px gap on each side / влезает в тег: рамка + 1px с каждой стороны */
    width: calc(var(--tao-tag-height) - 4px);
    height: calc(var(--tao-tag-height) - 4px);
    margin: 0;
    padding: 0;
    border: none;
    border-radius: var(--tao-radius-full);
    background: transparent;
    color: currentColor;
    opacity: 0.72;
    font-family: inherit;
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
}

.tao-tag__close:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 14%, transparent);
}

.tao-tag__close:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
}

.tao-tag--toned {
    color: var(--tao-tone-text);
    background: var(--tao-tone-subtle);
    border-color: color-mix(in srgb, var(--tao-tone) 30%, transparent);
}

/* Neutral keeps its own quiet frame: the muted fill would be too faint. / У нейтрального своя тихая рамка. */
.tao-tag--toned.tao-tone-neutral {
    color: var(--tao-color-text);
    background: var(--tao-color-surface-sunken);
    border-color: var(--tao-color-border-strong);
}

.tao-tag--flat,
.tao-tag--flat.tao-tag--toned {
    border-color: transparent;
}
</style>
