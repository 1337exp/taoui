import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the component source as text
import source from '../src/components/TaoCopy.vue?raw';

// 5.23.2: the arrow of the "copied" tip points at the trigger, not at the middle of the tip, when the tip is pushed in from the edge.
// 5.23.2: стрелка подсказки «скопировано» смотрит на кнопку, а не в середину подсказки, когда её сдвинуло от края окна.

describe('TaoCopy tip arrow', () => {
    it('takes its place from where the trigger falls on the tip, kept off the corners', () => {
        const css = source as string;
        expect(css).toContain('anchorOffset');
        expect(css).toContain("'--tao-copy-arrow'");
        expect(css).toContain('left: clamp(var(--tao-space-3), var(--tao-copy-arrow, 50%), calc(100% - var(--tao-space-3)))');
    });

    it('moves to the top edge when the tip flips below the trigger', () => {
        const css = source as string;
        expect(css).toContain("'tao-copy__tip--below': side === 'bottom'");
        expect(css).toMatch(/\.tao-copy__tip--below::after\s*\{[^}]*top:\s*0;/);
    });
});
