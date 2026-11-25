import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { h } from 'vue';
import TaoListItem from '../src/components/TaoListItem.vue';
import TaoMenubar from '../src/components/TaoMenubar.vue';
import TaoNav from '../src/components/TaoNav.vue';
import TaoSplit from '../src/components/TaoSplit.vue';

// Four small pieces an editor shell asked the kit for: a closed pane of a split without its divider, the spoken text of a nav badge, a slot at the
// end of the menu bar, a status tone of a list row that survives the selection.
// Четыре мелочи, которых попросила оболочка редактора: закрытая панель split без разделителя, читаемый текст значка у навигации, слот в конце
// полосы меню, цвет статуса строки списка, переживающий выбор.

afterEach(() => {
    document.body.innerHTML = '';
});

describe('TaoSplit collapsed', () => {
    const split = (collapsed: 'start' | 'end' | false) =>
        mount(TaoSplit, { props: { collapsed }, slots: { start: () => h('i', { class: 'a' }), end: () => h('i', { class: 'b' }) } });

    it.each(['start', 'end'] as const)('%s: the pane and the divider are not drawn, the other pane stays', (side) => {
        const w = split(side);
        expect(w.classes()).toContain(`tao-split--collapsed-${side}`);
        // the rule that hides them is in the component: the separator must not be reachable
        const css = readCss();
        expect(css).toMatch(new RegExp(`\.tao-split--collapsed-${side} > \.tao-split__pane--${side},`));
        expect(css).toMatch(/\.tao-split--collapsed-end > \.tao-split__handle \{\s*display: none;/);
    });

    it('not collapsed: nothing changes', () => {
        const w = split(false);
        expect(w.classes().some((c) => c.startsWith('tao-split--collapsed'))).toBe(false);
        expect(w.find('[role="separator"]').exists()).toBe(true);
    });
});

function readCss() {
    return readFileSync('src/components/TaoSplit.vue', 'utf8').replace(/\r\n/g, '\n');
}

describe('TaoNav badgeLabel', () => {
    const nav = (badge: number | boolean, badgeLabel?: string) =>
        mount(TaoNav, { props: { items: [{ id: 'a', label: 'Files', icon: 'tao-file', badge, badgeLabel }], modelValue: 'a' }, attachTo: document.body });

    it('a dot with a label is read; a dot without one is hidden from a screen reader', () => {
        const withLabel = nav(true, 'not saved');
        const badge = withLabel.find('.tao-nav__badge');
        expect(badge.attributes('aria-hidden')).toBeUndefined();
        expect(badge.find('.tao-sr-only').text()).toBe('not saved');
        withLabel.unmount();
        expect(nav(true).find('.tao-nav__badge').attributes('aria-hidden')).toBe('true');
    });

    it('a count with a label: the number is drawn, the label is read instead of it', () => {
        const w = nav(3, '3 unread');
        expect(w.find('.tao-nav__badge > span[aria-hidden="true"]').text()).toBe('3');
        expect(w.find('.tao-nav__badge .tao-sr-only').text()).toBe('3 unread');
    });
});

describe('TaoMenubar #end', () => {
    it('stands after the menus, outside of the menubar role (they are not menu entries)', () => {
        const w = mount(TaoMenubar, { props: { items: [{ id: 'f', label: 'File', items: [{ id: 'n', label: 'New' }] }] }, slots: { end: () => h('button', { class: 'theme' }, 'T') } });
        const end = w.find('.tao-menubar__end');
        expect(end.find('.theme').exists()).toBe(true);
        expect(end.element.closest('[role="menubar"]')).toBeNull();
        expect(w.find('[role="menubar"] > [role="menuitem"]').exists()).toBe(true);
    });

    it('no slot, no wrapper', () => {
        expect(mount(TaoMenubar, { props: { items: [{ id: 'f', label: 'File', items: [{ id: 'n', label: 'New' }] }] } }).find('.tao-menubar__end').exists()).toBe(false);
    });
});

describe('TaoListItem tone', () => {
    it('sets the tone and keeps it when the row is selected', () => {
        const w = mount(TaoListItem, { props: { title: 'Build', tone: 'danger', selected: true } });
        expect(w.classes()).toEqual(expect.arrayContaining(['tao-tone-danger', 'tao-list-item--toned', 'tao-list-item--selected']));
        const css = readFileSync('src/components/TaoListItem.vue', 'utf8').replace(/\r\n/g, '\n');
        expect(css).toMatch(/\.tao-list-item--toned\.tao-list-item--selected \.tao-list-item__title \{\s*color: var\(--tao-tone-text\)/);
    });

    it('without a tone nothing is added', () => {
        const w = mount(TaoListItem, { props: { title: 'Plain' } });
        expect(w.classes().some((c) => c.startsWith('tao-tone-'))).toBe(false);
    });
});
