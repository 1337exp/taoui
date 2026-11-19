import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import TaoDropdownMenu from '../src/components/TaoDropdownMenu.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import dropdownSource from '../src/components/TaoDropdownMenu.vue?raw';
// @ts-expect-error Vite `?raw` import
import navSource from '../src/components/TaoNav.vue?raw';

// 5.51.0: a trigger that is a whole chip of the app (the project under the main action of TaoNav). Axis reached into
// `.tao-dropdown-menu__button` to strip its padding and background and stretch it; `block` does that from the outside.
// 5.51.0: кнопка, которая целиком «фишка» приложения. Axis лез во `.tao-dropdown-menu__button`; `block` делает это снаружи.

const css = (dropdownSource as string).replace(/\r\n/g, '\n');

describe('TaoDropdownMenu block', () => {
    it('adds its class only when asked', () => {
        const items = [{ id: 'a', label: 'A' }];
        expect(mount(TaoDropdownMenu, { props: { items, block: true } }).classes()).toContain('tao-dropdown-menu--block');
        expect(mount(TaoDropdownMenu, { props: { items } }).classes()).not.toContain('tao-dropdown-menu--block');
    });

    it('the chip in #button is the content of the one button, which keeps the menu semantics', () => {
        const w = mount(TaoDropdownMenu, {
            props: { items: [{ id: 'a', label: 'A' }], block: true },
            slots: { button: () => h('span', { class: 'chip' }, 'Home') },
        });
        const button = w.find('button');
        expect(button.find('.chip').exists()).toBe(true);
        expect(button.attributes('aria-haspopup')).toBe('menu');
        expect(button.attributes('aria-label')).toBeUndefined();
    });

    it('fills its place and draws nothing of its own; the ring goes inside', () => {
        expect(css).toMatch(/\.tao-dropdown-menu--block \{\s*display: block;/);
        expect(css).toMatch(/\.tao-dropdown-menu--block > \.tao-dropdown-menu__button \{[^}]*width: 100%;[^}]*height: 100%;[^}]*padding: 0;[^}]*border-radius: inherit;/);
        expect(css).toMatch(/\.tao-dropdown-menu--block > \.tao-dropdown-menu__button > :slotted\(\*\) \{[^}]*flex: 1 1 auto;/);
        expect(css).toMatch(/\.tao-dropdown-menu--block > \.tao-dropdown-menu__button:focus-visible \{\s*outline-offset: -2px;/);
    });

    it('under the action of TaoNav it keeps its own inside and the height of a control', () => {
        expect((navSource as string).replace(/\r\n/g, '\n')).toMatch(
            /\.tao-nav \.tao-nav__action > :deep\(\.tao-dropdown-menu--block\) \{\s*padding-inline: 0;\s*height: var\(--tao-control-height\);/,
        );
    });
});
