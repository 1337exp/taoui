import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the component as text
import viewportSfc from '../src/components/TaoToastViewport.vue?raw';

// A centred toast must stand in the centre. The centred viewports span the whole width, so the stack inside must not
// be 100% wide, or there is nothing left to centre and the toast sticks to the left edge.
// Тост по центру должен стоять по центру: стопка внутри центрированного контейнера не должна быть шириной 100%.

const css = (viewportSfc as string).replace(/\/\*[\s\S]*?\*\//g, '');

function bodyOf(selector: string): string {
    for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (selectors!.split(',').map((s) => s.trim()).includes(selector)) {
            return body!;
        }
    }
    throw new Error(`no rule for ${selector}`);
}

describe('TaoToastViewport: centred positions', () => {
    it.each(['topCenter', 'bottomCenter', 'center'])('%s: the stack shrinks to its toast, the viewport centres it', (position) => {
        expect(bodyOf(`.tao-toast-viewport--${position} .tao-toast-viewport__stack`)).toContain('width: auto');
    });

    it('the corner positions keep the full-width stack (their viewport shrinks to the toast)', () => {
        expect(bodyOf('.tao-toast-viewport__stack')).toContain('width: 100%');
    });
});
