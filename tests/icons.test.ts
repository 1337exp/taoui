import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TaoButton from '../src/components/TaoButton.vue';
import TaoIcon from '../src/components/TaoIcon.vue';
import { registerTaoIcons, resolveTaoIcon, taoIconNames } from '../src/icons';

afterEach(() => vi.restoreAllMocks());

describe('icon registry', () => {
    it('every built-in name carries the tao- prefix and resolves to markup', () => {
        expect(taoIconNames.length).toBeGreaterThanOrEqual(25);
        for (const name of taoIconNames) {
            expect(name.startsWith('tao-')).toBe(true);
            expect(resolveTaoIcon(name)?.body, name).toMatch(/^<(path|circle|rect)/);
        }
    });

    it('a name without the prefix is not a built-in icon', () => {
        expect(resolveTaoIcon('check')).toBeUndefined();
        expect(resolveTaoIcon('tao-no-such-icon')).toBeUndefined();
    });

    it('registerTaoIcons adds your own icons and refuses the reserved prefix', () => {
        registerTaoIcons({ rocket: { body: '<path d="M1 1"/>' } });
        expect(resolveTaoIcon('rocket')?.body).toBe('<path d="M1 1"/>');
        expect(() => registerTaoIcons({ 'tao-rocket': { body: '' } })).toThrow(/reserved prefix/);
    });
});

describe('TaoIcon', () => {
    it('a built-in name renders inline svg that follows the text colour and the font size', () => {
        const w = mount(TaoIcon, { props: { name: 'tao-check' } });
        const svg = w.find('svg');
        expect(svg.exists()).toBe(true);
        expect(svg.attributes('stroke')).toBe('currentColor');
        expect(svg.attributes('width')).toBe('1em');
        expect(svg.attributes('aria-hidden')).toBe('true');
        expect(w.find('i').exists()).toBe(false);
    });

    it('size is in pixels', () => {
        expect(mount(TaoIcon, { props: { name: 'tao-close', size: 20 } }).find('svg').attributes('width')).toBe('20px');
    });

    it('a registered name renders its svg', () => {
        registerTaoIcons({ star: { body: '<path d="M2 2"/>', viewBox: '0 0 16 16' } });
        const svg = mount(TaoIcon, { props: { name: 'star' } }).find('svg');
        expect(svg.attributes('viewBox')).toBe('0 0 16 16');
        expect(svg.html()).toContain('M2 2');
    });

    it('any other name falls back to the icon-<name> class of an external font', () => {
        const w = mount(TaoIcon, { props: { name: 'my-font-glyph', size: 18 } });
        expect(w.find('svg').exists()).toBe(false);
        expect(w.find('i').classes()).toContain('icon-my-font-glyph');
        expect(w.find('i').attributes('style')).toContain('font-size: 18px');
    });

    it('an unknown tao- name warns once in development', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mount(TaoIcon, { props: { name: 'tao-typo' } });
        mount(TaoIcon, { props: { name: 'tao-typo' } });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(String(warn.mock.calls[0]![0])).toContain('no built-in icon "tao-typo"');
    });
});

describe('TaoButton icons', () => {
    it('icon and iconEnd go around the text', () => {
        const w = mount(TaoButton, { props: { icon: 'tao-plus', iconEnd: 'tao-chevron-right' }, slots: { default: 'Add' } });
        const parts = w.element.children;
        expect(parts).toHaveLength(3);
        expect(parts[0]!.classList.contains('tao-icon')).toBe(true);
        expect(parts[1]!.textContent).toBe('Add');
        expect(parts[2]!.classList.contains('tao-icon')).toBe(true);
        expect(w.classes()).not.toContain('tao-button--icon-only');
    });

    it('without text it is a square icon button, and it asks for an aria-label', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const bare = mount(TaoButton, { props: { icon: 'tao-close' } });
        expect(bare.classes()).toContain('tao-button--icon-only');
        expect(warn).toHaveBeenCalledTimes(1);

        const named = mount(TaoButton, { props: { icon: 'tao-close' }, attrs: { 'aria-label': 'Close' } });
        expect(named.classes()).toContain('tao-button--icon-only');
        expect(named.attributes('aria-label')).toBe('Close');
        expect(warn).toHaveBeenCalledTimes(1);
    });
});
