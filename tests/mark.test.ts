import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
// @ts-expect-error Vite `?raw` imports: the stylesheets as text
import markCss from '../src/styles/contexts/mark.css?raw';
// @ts-expect-error Vite `?raw` import
import indexCss from '../src/styles/index.css?raw';

// A checked box is marked with a square (the default) or a tick, for the whole page or one box.
// Отмеченный чекбокс — квадрат (по умолчанию) или галочка, для всей страницы или одного чекбокса.

const css = (markCss as string).replace(/\/\*[\s\S]*?\*\//g, '');
function rule(selector: string): Record<string, string> {
    for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (selectors!.split(',').map((s) => s.trim()).includes(selector)) {
            return Object.fromEntries([...body!.matchAll(/(--[a-z0-9_-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
        }
    }
    throw new Error(`no rule for ${selector}`);
}

describe('the mark context', () => {
    it('is part of the stylesheet', () => {
        expect(indexCss).toContain('@import "./contexts/mark.css";');
    });

    it('square is the default (:root) and both marks set the same variables', () => {
        const square = rule(':root');
        expect(rule('.tao-mark-square')).toEqual(square);
        expect(square['--tao-mark']).toBe('square');
        expect(Object.keys(rule('.tao-mark-check')).sort()).toEqual(Object.keys(square).sort());
    });

    it('the sizes are percentages of the box, so every checkbox size gets the same shape', () => {
        for (const mark of ['.tao-mark-square', '.tao-mark-check']) {
            const own = rule(mark);
            expect(own['--_tao-mark-width'], mark).toMatch(/%/);
            expect(own['--_tao-mark-height'], mark).toMatch(/%/);
            expect(own['--_tao-mark-width'], mark).not.toContain('indicator-size');
        }
    });

    it('a tick is a rotated corner, not a filled square', () => {
        const check = rule('.tao-mark-check');
        expect(check['--_tao-mark-fill']).toBe('transparent');
        expect(check['--_tao-mark-border']).toBe('0 2px 2px 0');
        expect(check['--_tao-mark-transform']).toContain('rotate(45deg)');
    });
});

describe('TaoCheckbox mark', () => {
    it('without mark it follows the ancestors (no class of its own)', () => {
        expect(mount(TaoCheckbox).classes().some((c) => c.startsWith('tao-mark-'))).toBe(false);
    });

    it('mark sets it for one box', () => {
        expect(mount(TaoCheckbox, { props: { mark: 'check' } }).classes()).toContain('tao-mark-check');
        expect(mount(TaoCheckbox, { props: { mark: 'square' } }).classes()).toContain('tao-mark-square');
    });
});
