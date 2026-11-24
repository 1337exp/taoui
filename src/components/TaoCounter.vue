<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { createRollGate, rollRanks } from '../counterRoll';
import { counterLayout } from '../counterFormat';

defineOptions({ name: 'TaoCounter' });

const props = withDefaults(
    defineProps<{
        value?: number;
        /** The minimum width in digits when there is no `format`; a longer number grows the counter. / Наименьшая ширина в цифрах, когда нет `format`; число длиннее растит счётчик. */
        maxDigits?: number;
        /**
         * A mask, as in TaoPinCode: `#` is a digit, any other character is drawn as it is (`##:##:##` a clock, `#,###,###`,
         * `+7 ###`, `### ###₽`). The mask fixes the number of digits: a number that does not fit is shown as the largest one it
         * holds (all nines), the counter does not grow. Without it the counter is grouped by thousands.
         * Маска, как в TaoPinCode: `#` — цифра, любой другой символ рисуется как есть (`##:##:##` часы, `#,###,###`, `+7 ###`,
         * `### ###₽`). Маска задаёт число цифр: число, которое не влезло, показано наибольшим из возможных (одни девятки),
         * счётчик не растёт. Без неё счётчик группирует по тысячам.
         */
        format?: string;
        /**
         * Dim the zeros that only pad the number on the left. Turn it off for a clock, where `00:03:30` has no padding.
         * Приглушать нули, которые лишь добивают число слева. Для часов выключить: в `00:03:30` добивки нет.
         */
        muteZeros?: boolean;
    }>(),
    {
        value: 0,
        maxDigits: 9,
        muteZeros: true,
    },
);

const layoutOptions = computed(() => ({ format: props.format, maxDigits: props.maxDigits, muteZeros: props.muteZeros }));

// what a screen reader says: the real value at once (the wheels may still be rolling); with a mask the number as drawn
// что читает скринридер: настоящее значение сразу (колёсики могут ещё катиться); с маской — число как нарисовано
const label = computed(() => {
    const layout = counterLayout(props.value, layoutOptions.value);
    return layout.masked ? layout.text : String(props.value);
});

// what the wheels show lags behind `value` while digits are rolling: the parent already holds the sum of the increments,
// so the wheels take the latest value once the last digit has landed, and roll to it in one go
// то, что показывают колёсики, отстаёт от `value`, пока цифры катятся: родитель уже держит сумму прибавок, поэтому
// колёсики берут последнее значение, когда встала последняя цифра, и катятся к нему за один раз
const shown = ref(props.value);

function catchUp() {
    if (!gate.busy && shown.value !== props.value) {
        shown.value = props.value;
    }
}

const gate = createRollGate(catchUp);
watch(() => props.value, catchUp);

type Slot = {
    /** a digit rolls, the sign comes and goes like one, a gap is empty, a text is a fixed character of the mask / цифра катится, знак приходит и уходит как она, gap пуст, text — постоянный символ маски */
    kind: 'digit' | 'sign' | 'gap' | 'text';
    value: string;
    isLeadingZero: boolean;
    key: string;
    /** the turn of the digit to roll: 0 goes first, 1 follows it / очередь цифры: 0 катится первой, 1 следом */
    rank: number;
};

const isDigit = (slot: Slot) => slot.kind === 'digit';

// the previous slots come as the argument: the digits that changed roll in turn from the right, not all at once
// прежние слоты приходят аргументом: изменившиеся цифры катятся по очереди справа, а не разом
const slots = computed<Slot[]>((previous) => {
    const layout = counterLayout(shown.value, layoutOptions.value);
    const result: Slot[] = [];

    if (layout.negative) {
        result.push({ kind: 'sign', value: '−', isLeadingZero: false, key: 'sign', rank: 0 });
    }

    layout.cells.forEach((cell, index) => {
        result.push({
            kind: cell.kind,
            value: cell.value,
            isLeadingZero: cell.leadingZero,
            key: cell.kind === 'digit' ? `${index}-${cell.value}` : `${cell.kind}-${index}`,
            rank: 0,
        });
    });

    const digits = result.filter(isDigit);
    const ranks = rollRanks(previous?.filter(isDigit).map((slot) => slot.value), digits.map((slot) => slot.value));
    digits.forEach((slot, index) => {
        slot.rank = ranks[index] ?? 0;
    });

    return result;
});
</script>

<template>
    <div class="tao-counter" role="img" :aria-label="label">
        <div class="tao-counter__row" aria-hidden="true">
            <div
                v-for="(slot, index) in slots"
                :key="`${index}-${slot.kind === 'digit' || slot.kind === 'sign' ? 'd' : slot.kind}`"
                class="tao-counter__slot"
                :class="{ 'tao-counter__slot--space': slot.kind === 'gap', 'tao-counter__slot--text': slot.kind === 'text' }"
                :style="{ '--_rank': slot.rank }"
            >
                <span v-if="slot.kind === 'text'" class="tao-counter__text">{{ slot.value }}</span>
                <TransitionGroup
                    v-else
                    name="tao-digit"
                    @before-enter="gate.start()"
                    @after-enter="gate.end()"
                    @enter-cancelled="gate.end()"
                    @before-leave="gate.start()"
                    @after-leave="gate.end()"
                    @leave-cancelled="gate.end()"
                >
                    <span
                        v-if="slot.kind !== 'gap'"
                        :key="slot.key"
                        class="tao-counter__digit"
                        :class="{ 'tao-counter__digit--muted': slot.isLeadingZero }"
                    >
                        {{ slot.value }}
                    </span>
                </TransitionGroup>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tao-counter {
    display: inline-flex;
    color: var(--tao-color-accent-text);
    font-size: 28px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
}

.tao-counter__row {
    display: inline-flex;
    gap: 3px;
}

.tao-counter__slot {
    position: relative;
    overflow: hidden;
    width: 1.15em;
    height: 1.55em;
    border-radius: var(--tao-radius-sm);
    background: var(--tao-color-surface-sunken);
}

.tao-counter__slot--space {
    width: 0.28em;
    background: transparent;
}

/* a fixed character of the mask (a colon, a comma, a unit): no wheel, no frame, quieter than the digits */
/* постоянный символ маски (двоеточие, запятая, единица): без колёсика и рамки, тише цифр */
.tao-counter__slot--text {
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-width: 0.3em;
    overflow: visible;
    background: transparent;
    color: var(--tao-color-text-muted);
}

.tao-counter__digit {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    /* a digit is its own layer before it moves, not from the moment it starts: a text that is promoted to a layer when the transform and the
       blur begin is drawn on whole pixels, and it jumps a pixel; drawn on a layer from the start, it does not
       цифра — свой слой ещё до движения, а не с его начала: текст, ставший слоем в момент начала transform и blur, рисуется по целым
       пикселям и прыгает на пиксель; нарисованный слоем с самого начала — не прыгает */
    will-change: transform, opacity, filter;
}

.tao-counter__digit--muted {
    color: var(--tao-color-text-muted);
    opacity: 0.45;
}

.tao-digit-enter-from {
    transform: translateY(100%) rotateX(-90deg);
    filter: blur(8px);
    opacity: 0;
}

.tao-digit-leave-to {
    transform: translateY(-100%) rotateX(90deg);
    filter: blur(8px);
    opacity: 0;
}

/* the digits that change start one after another from the right, `--tao-counter-stagger` apart (0 — all at once); the
   rank sits on the slot, which stays, so a digit that is leaving reads the turn of the new one
   изменившиеся цифры стартуют одна за другой справа через `--tao-counter-stagger` (0 — все разом); очередь лежит на
   слоте, который остаётся, поэтому уходящая цифра читает очередь новой */
.tao-digit-enter-active,
.tao-digit-leave-active {
    transition:
        transform var(--tao-duration-slow) cubic-bezier(0.68, -0.55, 0.265, 1.55),
        filter var(--tao-duration-slow) var(--tao-ease-base),
        opacity var(--tao-duration-slow) var(--tao-ease-base);
    transition-delay: calc(var(--_rank, 0) * var(--tao-counter-stagger, 55ms));
}

@media (prefers-reduced-motion: reduce) {
    .tao-digit-enter-active,
    .tao-digit-leave-active {
        transition: none;
    }
}

@media (max-width: 450px) {
    .tao-counter {
        font-size: 22px;
    }
}
</style>
