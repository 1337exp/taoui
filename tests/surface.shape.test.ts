import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the CSS as text
import surfaceCss from '../src/styles/contexts/surface.css?raw';
// @ts-expect-error Vite `?raw` import: the component source as text
import segmentedSource from '../src/components/TaoSegmented.vue?raw';

// A surface is a material, not a shape: `.tao-surface-*` paints the fill, the ring and the blur, and the corners are the `border-radius` of the
// element it is put on. A radius in the surface would be wrong twice: it is not the job of a material, and it comes after `.tao-panel` in the same
// file with the same weight, so it would take the radius of every TaoCard / TaoBlock with glass away. A component whose root IS the silhouette
// (TaoSegmented: the root box is the rounded track) has the radius itself, so a surface on its root follows it.
// Поверхность это материал, а не форма: `.tao-surface-*` рисует заливку, кольцо и размытие, а углы это `border-radius` элемента, на который её кладут.
// Радиус в поверхности был бы неверен дважды: это не дело материала, и он стоит после `.tao-panel` в том же файле с тем же весом, то есть отнял бы
// радиус у каждой TaoCard / TaoBlock со стеклом. Компонент, чей корень и есть силуэт (TaoSegmented), держит радиус сам.

/** The declarations of a rule, by its exact selector. / Объявления правила по точному селектору. */
function rule(css: string, selector: string): string {
    const start = css.indexOf(`\n${selector} {`);
    expect(start, `${selector} exists`).toBeGreaterThan(-1);
    return css.slice(start, css.indexOf('}', start));
}

describe('surfaces have no shape', () => {
    it.each(['.tao-surface-grain', '.tao-surface-glass'])('%s paints a material and sets no border-radius', (selector) => {
        expect(rule(surfaceCss, selector)).not.toContain('border-radius');
    });

    it('the radius of a panel stays with `.tao-panel`', () => {
        expect(rule(surfaceCss, '.tao-panel')).toContain('border-radius: var(--tao-radius)');
    });
});

describe('a component whose root is the silhouette carries the radius itself', () => {
    it('the root of TaoSegmented (a fieldset) has the control radius, like its track', () => {
        const style = segmentedSource.slice(segmentedSource.indexOf('<style'));
        expect(rule(style, '.tao-segmented')).toContain('border-radius: var(--tao-radius-control)');
        expect(rule(style, '.tao-segmented__track')).toContain('border-radius: var(--tao-radius-control)');
    });
});
