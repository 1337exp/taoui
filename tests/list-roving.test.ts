import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import TaoList from '../src/components/TaoList.vue';
import TaoListItem from '../src/components/TaoListItem.vue';

// 5.14.0: one Tab stop for the list, the arrows move between the rows.
// 5.14.0: одна остановка Tab на список, стрелки ходят по строкам.

const wrappers: VueWrapper[] = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});

function mountList(rows: { title: string; clickable?: boolean; disabled?: boolean; selected?: boolean }[], props: Record<string, unknown> = { roving: true }) {
    const w = mount(TaoList, {
        props: props as never,
        slots: { default: () => rows.map((row) => h(TaoListItem, { ...row, key: row.title })) },
        attachTo: document.body,
    });
    wrappers.push(w);
    return w;
}

const stops = (w: VueWrapper) => [...(w.element as HTMLElement).querySelectorAll<HTMLElement>('[tabindex]')].map((el) => [el.textContent?.trim(), el.getAttribute('tabindex')]);
const key = async (w: VueWrapper, name: string) => {
    (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    await nextTick();
};

describe('TaoList roving', () => {
    it('one row is the Tab stop: the selected one, else the first that is enabled', async () => {
        const w = mountList([{ title: 'A', disabled: true }, { title: 'B' }, { title: 'C', selected: true }]);
        await nextTick();
        expect(stops(w)).toEqual([['A', '-1'], ['B', '-1'], ['C', '0']]);
        const plain = mountList([{ title: 'A', disabled: true }, { title: 'B' }, { title: 'C' }]);
        await nextTick();
        expect(stops(plain)).toEqual([['A', '-1'], ['B', '0'], ['C', '-1']]);
    });

    it('the arrows move the stop and the focus, skip disabled rows and stop at the ends; Home / End', async () => {
        const w = mountList([{ title: 'A' }, { title: 'B', disabled: true }, { title: 'C' }, { title: 'D' }]);
        await nextTick();
        (w.element.querySelector('li') as HTMLElement).focus();
        await key(w, 'ArrowDown');
        expect(document.activeElement?.textContent?.trim()).toBe('C');
        expect(stops(w).filter(([, t]) => t === '0')).toEqual([['C', '0']]);
        await key(w, 'End');
        expect(document.activeElement?.textContent?.trim()).toBe('D');
        await key(w, 'ArrowDown');
        expect(document.activeElement?.textContent?.trim()).toBe('D');
        await key(w, 'Home');
        expect(document.activeElement?.textContent?.trim()).toBe('A');
        await key(w, 'ArrowUp');
        expect(document.activeElement?.textContent?.trim()).toBe('A');
    });

    it('a clickable row puts the stop on its button', async () => {
        const w = mountList([{ title: 'A', clickable: true }, { title: 'B', clickable: true }]);
        await nextTick();
        const buttons = w.findAll('button.tao-list-item__hit');
        expect(buttons.map((b) => b.attributes('tabindex'))).toEqual(['0', '-1']);
        expect(w.findAll('li').every((li) => li.attributes('tabindex') === undefined)).toBe(true);
        (buttons[0]!.element as HTMLElement).focus();
        await key(w, 'ArrowDown');
        expect(document.activeElement).toBe(buttons[1]!.element);
    });

    it('a click or a Tab into a row makes it the stop', async () => {
        const w = mountList([{ title: 'A' }, { title: 'B' }, { title: 'C' }]);
        await nextTick();
        const third = w.findAll('li')[2]!.element as HTMLElement;
        third.focus();
        await nextTick();
        expect(stops(w)).toEqual([['A', '-1'], ['B', '-1'], ['C', '0']]);
    });

    it('without roving the list sets no tabindex, and turning it off takes them away', async () => {
        const off = mountList([{ title: 'A' }, { title: 'B' }], {});
        await nextTick();
        expect(stops(off)).toEqual([]);
        const w = mountList([{ title: 'A' }, { title: 'B' }]);
        await nextTick();
        await w.setProps({ roving: false } as never);
        await nextTick();
        expect(stops(w)).toEqual([]);
    });
});
