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

describe('TaoToastViewport: a glass toast keeps its blur while it fades', () => {
    it('the fade runs on the toast itself: an ancestor below opacity 1 would switch the backdrop blur off', () => {
        expect(css).toMatch(/\.tao-toast-top-enter-active :deep\(\.tao-toast\)[^{]*\{[^}]*animation: tao-toast-bounce-in/);
        expect(css).toMatch(/\.tao-toast-bottom-leave-active :deep\(\.tao-toast\) \{[^}]*animation: tao-toast-fade-out-down/);
        expect(css).not.toMatch(/\.tao-toast-slot__inner \{[^}]*animation/);
    });

    it('the slot holds an empty animation as long, so Vue waits for the toast', () => {
        expect(css).toMatch(/\.tao-toast-center-enter-active \{\s*animation: tao-toast-hold var\(--tao-duration-slow\)/);
    });
});

describe('TaoToastViewport: the bounce is not clipped', () => {
    it('the slot clips only while its row folds away', () => {
        expect(bodyOf('.tao-toast-slot__inner')).not.toContain('overflow');
        expect(bodyOf('.tao-toast-bottom-leave-active .tao-toast-slot__inner')).toContain('overflow: hidden');
    });
});

describe('TaoToastViewport: a centred toast on a whole pixel', () => {
    it('the centred areas are an even number of pixels wide, where round() is supported', () => {
        const all = (viewportSfc as string).replace(/\r\n/g, '\n');
        expect(all).toMatch(/@supports \(width: round\(down, 100%, 2px\)\) \{\s*\.tao-toast-viewport--topCenter,\s*\.tao-toast-viewport--bottomCenter \{[^}]*width: round\(down, 100%, 2px\)/);
    });
});
