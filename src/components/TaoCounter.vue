<script lang="ts" setup>
import { computed } from 'vue';
import { rollRanks } from '../counterRoll';

defineOptions({ name: 'TaoCounter' });

const props = withDefaults(
    defineProps<{
        value?: number;
        maxDigits?: number;
    }>(),
    {
        value: 0,
        maxDigits: 9,
    },
);

type Slot = {
    value: string;
    isSpace: boolean;
    isLeadingZero: boolean;
    key: string;
    /** the turn of the digit to roll: 0 goes first, 1 follows it / очередь цифры: 0 катится первой, 1 следом */
    rank: number;
};

function formatDigits(num: number, minDigits: number) {
    const abs = Math.abs(Math.trunc(num));
    return abs.toString().padStart(Math.max(1, minDigits), '0').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const isDigit = (slot: Slot) => /\d/.test(slot.value);

// the previous slots come as the argument: the digits that changed roll in turn from the right, not all at once
// прежние слоты приходят аргументом: изменившиеся цифры катятся по очереди справа, а не разом
const slots = computed<Slot[]>((previous) => {
    const formatted = formatDigits(props.value, props.maxDigits);
    const significant = Math.abs(Math.trunc(props.value)).toString();
    const leadingZeros = Math.max(0, props.maxDigits - significant.length);
    const result: Slot[] = [];
    let digitCount = 0;

    if (props.value < 0) {
        result.push({
            value: '−',
            isSpace: false,
            isLeadingZero: false,
            key: 'sign',
            rank: 0,
        });
    }

    for (let index = 0; index < formatted.length; index += 1) {
        const char = formatted[index] ?? '';
        if (char === ' ') {
            result.push({
                value: ' ',
                isSpace: true,
                isLeadingZero: false,
                key: `space-${index}`,
                rank: 0,
            });
            continue;
        }

        result.push({
            value: char,
            isSpace: false,
            isLeadingZero: digitCount < leadingZeros,
            key: `${index}-${char}`,
            rank: 0,
        });
        digitCount += 1;
    }

    const digits = result.filter(isDigit);
    const ranks = rollRanks(previous?.filter(isDigit).map((slot) => slot.value), digits.map((slot) => slot.value));
    digits.forEach((slot, index) => {
        slot.rank = ranks[index] ?? 0;
    });

    return result;
});
</script>

<template>
    <div class="tao-counter" role="img" :aria-label="String(value)">
        <div class="tao-counter__row" aria-hidden="true">
            <div
                v-for="(slot, index) in slots"
                :key="`${index}-${slot.isSpace ? 'gap' : 'd'}`"
                class="tao-counter__slot"
                :class="{ 'tao-counter__slot--space': slot.isSpace }"
                :style="{ '--_rank': slot.rank }"
            >
                <TransitionGroup name="tao-digit">
                    <span
                        v-if="!slot.isSpace"
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
    color: var(--tao-color-accent);
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

.tao-counter__digit {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
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
