import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import baseCss from '../src/styles/base.css?raw';
// @ts-expect-error Vite `?raw` import
import layersSource from '../showcase/guide/DemoLayers.vue?raw';

// 5.27.0: the scrollbars of the kit have four hooks and a class; the defaults are what they always were (5px, the accent).
// 5.27.0: у полос прокрутки набора четыре крючка и класс; значения по умолчанию прежние (5px, акцент).

const css = baseCss as string;
const OFF = ':not(.tao-native-scrollbars, .tao-native-scrollbars *)';

describe('scrollbars', () => {
    it('are thin (5px) by default, with a thickness that can really grow: width, not max-width', () => {
        expect(css).toMatch(new RegExp(`${OFF.replace(/[()*.]/g, '\\$&')}::-webkit-scrollbar \\{\\s*width: var\\(--tao-scrollbar-size, 5px\\);\\s*height: var\\(--tao-scrollbar-size, 5px\\);`));
        expect(css).not.toMatch(/max-width: 5px/);
    });

    it('the thumb is the accent and the track is clear by default, both through hooks', () => {
        expect(css).toContain('background: var(--tao-scrollbar-thumb, var(--tao-color-accent))');
        expect(css).toContain('background: var(--tao-scrollbar-track, transparent)');
    });

    it('the class tao-native-scrollbars gives the browser scrollbars back: for its own box and everything inside', () => {
        const rules = css.match(/:not\(\.tao-native-scrollbars, \.tao-native-scrollbars \*\)::-webkit-scrollbar(-track|-thumb)? \{/g) ?? [];
        expect(rules).toHaveLength(3);
    });

    it('Firefox gets the same look through the standard properties, and only where ::-webkit-scrollbar does not exist', () => {
        const block = css.slice(css.indexOf('@supports not selector(::-webkit-scrollbar)'));
        expect(block).toContain('scrollbar-width: var(--tao-scrollbar-width, thin)');
        expect(block).toContain('scrollbar-color: var(--tao-scrollbar-thumb, var(--tao-color-accent)) var(--tao-scrollbar-track, transparent)');
        expect(block).toContain(OFF);
        // not outside the @supports: Chrome 121+ would then ignore ::-webkit-scrollbar / не вне @supports: Chrome 121+ тогда игнорировал бы ::-webkit-scrollbar
        expect(css.replace(block, '')).not.toMatch(/scrollbar-(width|color):/);
    });

    it('the showcase has the panel with the sliders in «Layers and theming»', () => {
        expect(layersSource as string).toContain('Scrollbars');
    });
});
