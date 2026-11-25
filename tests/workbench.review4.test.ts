import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import TaoSplit from '../src/components/TaoSplit.vue';
import TaoWorkbench from '../src/components/TaoWorkbench.vue';

// From the fourth review of the editor frame: the name of a tool, the focus after a panel closes, the ids of two frames, the minimum of the
// workspace when two sides are open.
// Из четвёртого ревью рамки редактора: имя инструмента, фокус после закрытия панели, id двух рамок, минимум рабочей области при двух открытых сторонах.

afterEach(() => {
    document.body.innerHTML = '';
});

const tools = [
    { id: 'files', label: 'Files', shortcut: 'Alt+1' },
    { id: 'problems', label: 'Problems', badge: 2, badgeLabel: '2 problems' },
    { id: 'plain', label: 'Plain', badge: 5 },
];

const make = (props: Record<string, unknown> = {}) =>
    mount(TaoWorkbench, { attachTo: document.body, props: { leftTools: tools, rightTools: tools, bottomTools: tools, ...props }, slots: { 'left-panel': 'L', 'right-panel': 'R', 'bottom-panel': 'B', default: 'W' } });

describe('the name of a tool button', () => {
    it('carries the badge, because an aria-label replaces what is inside the button', () => {
        const w = make();
        const name = (id: string) => w.find(`[data-tao-tool="left:${id}"]`).attributes('aria-label');
        expect(name('files')).toBe('Files');
        expect(name('problems')).toBe('Problems, 2 problems');
        expect(name('plain')).toBe('Plain, 5');
    });

    it('names its key in aria-keyshortcuts', () => {
        expect(make().find('[data-tao-tool="left:files"]').attributes('aria-keyshortcuts')).toBe('Alt+1');
    });
});

describe('the focus when a panel closes by its own button', () => {
    it('goes to the tool that opened it, not to the body', async () => {
        const w = make({ left: 'files' });
        const close = w.find('.tao-workbench__close');
        (close.element as HTMLElement).focus();
        await close.trigger('click');
        await w.setProps({ left: null });
        await nextTick();
        await nextTick();
        expect(document.activeElement).toBe(w.find('[data-tao-tool="left:files"]').element);
    });
});

describe('two frames on a page', () => {
    it('do not share the id of the workspace, and each skip link points at its own', () => {
        const Two = defineComponent({ render: () => [h(TaoWorkbench, { leftTools: tools }), h(TaoWorkbench, { leftTools: tools })] });
        const w = mount(Two, { attachTo: document.body });
        const mains = w.findAll('main').map((m) => m.attributes('id'));
        expect(mains).toHaveLength(2);
        expect(mains[0]).not.toBe(mains[1]);
        const skips = w.findAll('.tao-workbench__skip').map((a) => a.attributes('href'));
        expect(skips).toEqual(mains.map((id) => `#${id}`));
    });
});

describe('the top bar', () => {
    it('is a named region: it does not promise the arrow keys of a toolbar', () => {
        expect(make().find('header').attributes('role')).toBe('region');
    });
});

describe('the minimum of the workspace', () => {
    it('with the right panel open the left split keeps room for it as well: the workspace is not squeezed to nothing', async () => {
        const w = make({ left: 'files', right: 'files', panelMin: 160, centerMin: 240 });
        const left = w.findAllComponents(TaoSplit)[0]!;
        expect(left.props('minEnd')).toBe(400);
        await w.setProps({ right: null });
        expect(left.props('minEnd')).toBe(240);
    });
});
