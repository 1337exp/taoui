import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import { densityClass, resolveDensity } from '../src/density';
// @ts-expect-error Vite `?raw` imports: the stylesheets as text
import sizeCss from '../src/styles/contexts/size.css?raw';
// @ts-expect-error Vite `?raw` import
import primitivesCss from '../src/styles/tokens/primitives.css?raw';

// Density is a second axis on top of the size: it changes the height and the padding of every size, not the font.
// Плотность — вторая ось поверх размера: меняет высоту и отступы любого размера, но не шрифт.

const css = (sizeCss as string).replace(/\/\*[\s\S]*?\*\//g, '');
/** The declarations of the first rule whose selector list contains this selector. */
function rule(selector: string, source = css): Record<string, string> {
    for (const [, selectors, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (selectors!.split(',').map((s) => s.trim()).includes(selector)) {
            return Object.fromEntries([...body!.matchAll(/(--[a-z0-9_-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
        }
    }
    throw new Error(`no rule for ${selector}`);
}
const px = (name: string) => Number(new RegExp(`${name}:\\s*(-?\\d+)px`).exec(primitivesCss as string)![1]);

describe('density in the stylesheet', () => {
    it('every density sets the same three deltas, the default is zero', () => {
        for (const name of ['default', 'compact', 'comfortable', 'auto']) {
            expect(Object.keys(rule(`.tao-density-${name}`)).sort(), name).toEqual(
                ['--_tao-density-height', '--_tao-density-padding-x', '--_tao-density-padding-y', '--tao-density'].sort(),
            );
        }
        expect(rule('.tao-density-default')['--_tao-density-height']).toBe('0px');
    });

    it('auto is the default with a mouse and comfortable on a touch screen', () => {
        expect(rule('.tao-density-auto')['--tao-density']).toBe('default');
        const coarse = /@media \(pointer: coarse\)\s*\{([\s\S]*?\}\s*)\}/.exec(css)![1]!;
        expect(rule('.tao-density-auto', coarse)).toEqual(rule('.tao-density-comfortable'));
    });

    it('the current tokens are recomputed wherever either axis changes (a nested class must count)', () => {
        const selectors = [':root', '.tao-size-small', '.tao-size-medium', '.tao-size-large', '.tao-density-default', '.tao-density-compact', '.tao-density-comfortable', '.tao-density-auto'];
        const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*--tao-control-height:[^{}]*)\}/g)];
        expect(blocks).toHaveLength(1);
        expect(blocks[0]![1]!.split(',').map((s) => s.trim())).toEqual(selectors);
        expect(blocks[0]![2]).toContain('calc(var(--_tao-height) + var(--_tao-density-height))');
    });

    it('size classes set only the base: no size class writes a current token directly', () => {
        for (const size of ['small', 'medium', 'large']) {
            const own = rule(`.tao-size-${size}`);
            expect(own['--_tao-height']).toBe(`var(--tao-control-height-${size})`);
            expect(own['--tao-control-height']).toBeUndefined();
        }
    });

    it('comfortable gives 34 / 44 / 52 and compact 22 / 32 / 40', () => {
        const heights = ['small', 'medium', 'large'].map((s) => px(`--tao-control-height-${s}`));
        expect(heights.map((v) => v + px('--tao-density-height-comfortable'))).toEqual([34, 44, 52]);
        expect(heights.map((v) => v + px('--tao-density-height-compact'))).toEqual([22, 32, 40]);
    });
});

describe('density helpers', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('densityClass adds a class only for a given density', () => {
        expect(densityClass('comfortable')).toBe('tao-density-comfortable');
        expect(densityClass(undefined)).toBeUndefined();
    });

    it('resolveDensity reads --tao-density, default otherwise', () => {
        const el = document.body.appendChild(document.createElement('div'));
        expect(resolveDensity(el)).toBe('default');
        el.style.setProperty('--tao-density', 'compact');
        expect(resolveDensity(el)).toBe('compact');
        el.style.setProperty('--tao-density', 'roomy');
        expect(resolveDensity(el)).toBe('default');
        expect(resolveDensity(null)).toBe('default');
    });

    it('a teleported Select panel takes the density of where the Select stands', async () => {
        const w = mount({ render: () => h('div', [h(TaoSelect, { options: [{ value: 'a', label: 'A' }], modelValue: null })]) }, { attachTo: document.body });
        // happy-dom does not inherit custom properties: put the inherited value on the trigger itself
        const trigger = w.find('button');
        (trigger.element as HTMLElement).style.setProperty('--tao-density', 'comfortable');
        await trigger.trigger('click');
        await nextTick();
        const panel = document.body.querySelector('.tao-select__panel');
        expect(panel?.classList.contains('tao-density-comfortable')).toBe(true);
        w.unmount();
    });
});
