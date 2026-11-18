import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import TaoButton from '../src/components/TaoButton.vue';
import TaoCommandList from '../src/components/TaoCommandList.vue';
import TaoKbd from '../src/components/TaoKbd.vue';

describe('TaoKbd', () => {
    it('is a kbd with the key from the slot; cap by default, plain on request', () => {
        const cap = mount(TaoKbd, { slots: { default: () => 'Ctrl+K' } });
        expect(cap.element.tagName).toBe('KBD');
        expect(cap.text()).toBe('Ctrl+K');
        expect(cap.classes()).toContain('tao-kbd');
        expect(cap.classes()).not.toContain('tao-kbd--plain');

        const plain = mount(TaoKbd, { props: { variant: 'plain' }, slots: { default: () => 'Z' } });
        expect(plain.classes()).toContain('tao-kbd--plain');
    });

    it('is what a button and a command list draw their key with (one look in every place)', () => {
        const button = mount(TaoButton, { props: { shortcut: 'N' }, slots: { default: () => 'New' } });
        expect(button.find('kbd.tao-kbd.tao-button__shortcut').text()).toBe('N');

        const list = mount(TaoCommandList, { props: { items: [{ id: 'a', label: 'Save', shortcut: 'Ctrl+S' }] } });
        expect(list.find('kbd.tao-kbd.tao-kbd--plain').text()).toBe('Ctrl+S');
    });

    it('has zero specificity (:where), so the place that holds a key sets its own size', () => {
        const css = readFileSync('src/components/TaoKbd.vue', 'utf8');
        expect(css).toContain(':where(.tao-kbd)');
        expect(css).toContain(':where(.tao-kbd--plain)');
    });

    // 5.50.0: the plain key kept the height of the cap; in a flex row (a menu, a command list) it is a block, so the text sat at the top of it
    // 5.50.0: простая клавиша хранила высоту значка; во flex-строке (меню, список команд) она блок, и текст сидел у его верха
    it('a plain key has no box of its own: every property that makes the cap a box is reset', () => {
        const css = readFileSync('src/components/TaoKbd.vue', 'utf8');
        const plain = css.match(/:where\(\.tao-kbd--plain\) \{([^}]*)\}/)![1]!;
        const cap = css.match(/:where\(\.tao-kbd\) \{([^}]*)\}/)![1]!;
        expect(plain).toMatch(/height: auto;/);
        expect(plain).toMatch(/min-width: 0;/);
        expect(plain).toMatch(/padding: 0;/);
        expect(plain).toMatch(/background: none;/);
        // a new box property on the cap must be reset on the plain one too / новое свойство ящика у значка надо сбросить и у простой
        const boxy = [...cap.matchAll(/^\s*(height|min-height|width|min-width|padding|background|border-radius):/gm)].map((m) => m[1]);
        for (const name of new Set(boxy)) {
            expect(plain, name).toContain(`${name}:`);
        }
    });

    it('is not selectable (a hint, not content); both variants, the plain one inherits the rule', () => {
        const css = readFileSync('src/components/TaoKbd.vue', 'utf8');
        expect(css).toMatch(/:where\(\.tao-kbd\) \{[^}]*user-select: none/);
        expect(css).not.toMatch(/:where\(\.tao-kbd--plain\) \{[^}]*user-select: auto/);
    });

    it('a neutral tone has a grey wash, not the accent one', () => {
        const css = readFileSync('src/styles/contexts/tone.css', 'utf8');
        const neutral = css.match(/\.tao-tone-neutral \{[\s\S]*?\n\}/)![0];
        expect(neutral).toContain('--tao-tone-wash: color-mix(in srgb, var(--tao-color-text) 10%, transparent)');
        expect(neutral).not.toContain('accent');
    });
});

// 5.50.0: the highlight of a command list row is inset by the list padding, and its corners are the panel radius minus that
// padding. With 8px of padding and the 8px radius of the default frames that is 0: an inset bar with square corners. The same
// 4px as in TaoMenu gives it the corner the menu has, and the field text still stands above the labels of the rows.
// 5.50.0: подсветка строки списка команд отодвинута отступом списка, а её углы — радиус панели минус отступ. При 8px отступа
// и радиусе 8px по умолчанию это 0: отодвинутая полоса с острыми углами. Те же 4px, что в TaoMenu, дают ей угол меню.
describe('TaoCommandList row highlight', () => {
    const css = readFileSync('src/components/TaoCommandList.vue', 'utf8').replace(/\r\n/g, '\n');
    const menu = readFileSync('src/components/TaoMenu.vue', 'utf8').replace(/\r\n/g, '\n');

    it('one inset for the list padding, the row corners and the start of the field text', () => {
        expect(css).toMatch(/--_inset: var\(--tao-space-1\);/);
        expect(css).toMatch(/\.tao-command-list__list \{[^}]*padding: var\(--_inset\);/);
        expect(css).toMatch(/\.tao-command-list__option \{[^}]*border-radius: max\(0px, calc\(var\(--tao-radius-panel\) - var\(--_inset\)\)\);/);
        expect(css).toMatch(/\.tao-command-list__input \{[^}]*padding: 0 calc\(var\(--_inset\) \+ var\(--_pad-x\)\);/);
    });

    it('is the same gap as the menu has around its rows', () => {
        expect(menu).toMatch(/\.tao-menu \{[^}]*padding: var\(--tao-space-1\);/);
    });
});
