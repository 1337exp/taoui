import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the component as text
import alertSfc from '../src/components/TaoAlert.vue?raw';
// @ts-expect-error Vite `?raw` import
import drawerSfc from '../src/components/TaoDrawer.vue?raw';
// @ts-expect-error Vite `?raw` import
import modalSfc from '../src/components/TaoModal.vue?raw';

// The cross of a Drawer, a Modal and an Alert is an inline SVG. As a plain block the button was a text line tall
// (24px icon + the gap under the baseline = 28px) and its focus ring was a rectangle: the button is a grid of exactly the icon's size, with the icon in the middle (in a flex button Chrome left the icon 2px high).
// Крестик Drawer, Modal и Alert — инлайн-SVG. Простым блоком кнопка была высотой в строку текста (24px + зазор под
// базовой линией = 28px), и кольцо фокуса было прямоугольным: кнопка — сетка ровно по размеру иконки с иконкой посередине.

const css = (sfc: string) => sfc.replace(/\/\*[\s\S]*?\*\//g, '');

function bodyOf(sfc: string, selector: string): string {
    for (const [, selectors, body] of css(sfc).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (selectors!.split(',').map((s) => s.trim()).includes(selector)) {
            return body!;
        }
    }
    throw new Error(`no rule for ${selector}`);
}

describe('the cross of an overlay is a square', () => {
    it.each([
        ['TaoDrawer', drawerSfc, '.tao-drawer__close'],
        ['TaoModal', modalSfc, '.tao-modal__close'],
        ['TaoAlert', alertSfc, '.tao-alert__close'],
    ])('%s', (_name, sfc, selector) => {
        const body = bodyOf(sfc as string, selector);
        expect(body).toContain('display: inline-grid');
        expect(body).toContain('place-items: center');
        expect(body).toContain('width: 1em');
        expect(body).toContain('height: 1em');
    });
});
