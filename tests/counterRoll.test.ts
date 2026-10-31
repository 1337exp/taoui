import { describe, expect, it } from 'vitest';
import { createRollGate, rollRanks } from '../src/counterRoll';

const digits = (value: string) => [...value];

describe('rollRanks', () => {
    it('the digit on the right goes first, the others follow to the left', () => {
        // 000 000 → 001 337: four digits change, from the units up
        expect(rollRanks(digits('000000'), digits('001337'))).toEqual([0, 0, 3, 2, 1, 0]);
    });

    it('a digit that stays takes no turn: the next one changed does not wait for it', () => {
        // 1000 → 2000: only the thousands change, so it goes at once, not after three idle steps
        expect(rollRanks(digits('1000'), digits('2000'))).toEqual([0, 0, 0, 0]);
        // 1307 → 1337: only the tens
        expect(rollRanks(digits('1307'), digits('1337'))).toEqual([0, 0, 0, 0]);
        // 1307 → 2337: tens first, then the thousands (the hundreds stay)
        expect(rollRanks(digits('1307'), digits('2337'))).toEqual([1, 0, 0, 0]);
    });

    it('digits are lined up by the right edge when the number grows a digit', () => {
        // 99 → 100: all three change
        expect(rollRanks(digits('99'), digits('100'))).toEqual([2, 1, 0]);
    });

    it('the first render, and an equal value, roll nothing', () => {
        expect(rollRanks(undefined, digits('1337'))).toEqual([0, 0, 0, 0]);
        expect(rollRanks(digits('1337'), digits('1337'))).toEqual([0, 0, 0, 0]);
    });
});

describe('createRollGate', () => {
    it('is idle until a digit starts to roll, and busy until the last one lands', () => {
        let idle = 0;
        const gate = createRollGate(() => (idle += 1));
        expect(gate.busy).toBe(false);
        gate.start();
        gate.start();
        expect(gate.busy).toBe(true);
        gate.end();
        expect(gate.busy).toBe(true);
        expect(idle).toBe(0);
        gate.end();
        expect(gate.busy).toBe(false);
        expect(idle).toBe(1);
    });

    it('an end without a start does not go below zero', () => {
        const gate = createRollGate(() => {});
        gate.end();
        gate.start();
        expect(gate.busy).toBe(true);
    });
});
