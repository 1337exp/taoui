import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import TaoWorkbench from '../src/components/TaoWorkbench.vue';
import { nextRegion, toggleTool } from '../src/workbench';

// TaoWorkbench: the frame of an editor. The bars with their start and end, the tools that open panels, the landmarks, F6.
// TaoWorkbench: рамка редактора. Полосы с началом и концом, инструменты, открывающие панели, области, F6.

afterEach(() => {
    document.body.innerHTML = '';
});

const leftTools = [
    { id: 'files', label: 'Files', icon: 'tao-folder', shortcut: 'Alt+1' },
    { id: 'search', label: 'Search', icon: 'tao-search' },
];
const bottomTools = [{ id: 'problems', label: 'Problems', icon: 'tao-alert-triangle', badge: 2, badgeLabel: '2 problems' }];
const rightTools = [{ id: 'notes', label: 'Notes', icon: 'tao-file', badge: true, badgeLabel: 'unsaved' }];

function make(props: Record<string, unknown> = {}) {
    const w = mount(TaoWorkbench, {
        attachTo: document.body,
        props: {
            leftTools,
            rightTools,
            bottomTools,
            left: null,
            right: null,
            bottom: null,
            'onUpdate:left': (v: string | null) => void w.setProps({ left: v }),
            'onUpdate:right': (v: string | null) => void w.setProps({ right: v }),
            'onUpdate:bottom': (v: string | null) => void w.setProps({ bottom: v }),
            ...props,
        } as never,
        slots: {
            default: () => h('p', { class: 'work' }, 'work'),
            'top-start': () => h('i', { class: 'ts' }),
            'top-end': () => h('i', { class: 'te' }),
            'left-end': () => h('i', { class: 'le' }),
            'bottom-end': () => h('i', { class: 'be' }),
            'left-panel': ({ tool }: { tool: { id: string } }) => h('p', { class: 'lp' }, `left:${tool.id}`),
            'right-panel': ({ tool }: { tool: { id: string } }) => h('p', { class: 'rp' }, `right:${tool.id}`),
            'bottom-panel': ({ tool }: { tool: { id: string } }) => h('p', { class: 'bp' }, `bottom:${tool.id}`),
        },
    });
    return w;
}

describe('the helpers', () => {
    it('toggleTool: the open one closes, another takes its place', () => {
        expect(toggleTool(null, 'a')).toBe('a');
        expect(toggleTool('a', 'a')).toBeNull();
        expect(toggleTool('a', 'b')).toBe('b');
        expect(toggleTool(undefined, 'b')).toBe('b');
    });

    it('nextRegion goes round the ring; with the focus nowhere forward is the first and backward the last', () => {
        expect(nextRegion(4, 1, 1)).toBe(2);
        expect(nextRegion(4, 3, 1)).toBe(0);
        expect(nextRegion(4, 0, -1)).toBe(3);
        expect(nextRegion(4, -1, 1)).toBe(0);
        expect(nextRegion(4, -1, -1)).toBe(3);
        expect(nextRegion(0, -1, 1)).toBe(-1);
    });
});

describe('TaoWorkbench', () => {
    it('is made of landmarks: a top region, two rails, the workspace, a status bar, each named', () => {
        const w = make();
        expect(w.find('header[role="region"]').attributes('aria-label')).toBe('Toolbar');
        expect(w.findAll('nav').map((n) => n.attributes('aria-label'))).toEqual(['Left tools', 'Right tools']);
        expect(w.find('main').attributes('aria-label')).toBe('Workspace');
        expect(w.find('footer').attributes('aria-label')).toBe('Status bar');
        expect(w.find('.work').exists()).toBe(true);
        w.unmount();
    });

    it('every bar has a start and an end', () => {
        const w = make();
        expect(w.find('.tao-workbench__bar--top .tao-workbench__start .ts').exists()).toBe(true);
        expect(w.find('.tao-workbench__bar--top .tao-workbench__end .te').exists()).toBe(true);
        expect(w.find('.tao-workbench__rail--left .tao-workbench__end .le').exists()).toBe(true);
        expect(w.find('.tao-workbench__bar--bottom .tao-workbench__end .be').exists()).toBe(true);
        w.unmount();
    });

    it('a tool is a toggle button named by its label; a press opens its panel, the next one closes it', async () => {
        const w = make();
        const files = w.findAll('.tao-workbench__rail--left .tao-workbench__tool')[0]!;
        expect(files.attributes('aria-label')).toBe('Files');
        expect(files.attributes('aria-pressed')).toBe('false');
        expect(w.find('.lp').exists()).toBe(false);
        await files.trigger('click');
        expect(w.emitted('update:left')?.at(-1)).toEqual(['files']);
        expect(w.find('.lp').text()).toBe('left:files');
        expect(files.attributes('aria-pressed')).toBe('true');
        expect(w.find('section[aria-label="Files"]').exists()).toBe(true);
        await files.trigger('click');
        expect(w.emitted('update:left')?.at(-1)).toEqual([null]);
        expect(w.find('.lp').exists()).toBe(false);
        w.unmount();
    });

    it('another tool takes the place of the open one', async () => {
        const w = make({ left: 'files' });
        await w.findAll('.tao-workbench__rail--left .tao-workbench__tool')[1]!.trigger('click');
        expect(w.find('.lp').text()).toBe('left:search');
        w.unmount();
    });

    it('the panel has a close button that says what it closes', async () => {
        const w = make({ right: 'notes' });
        const close = w.find('.tao-workbench__close');
        expect(close.attributes('aria-label')).toBe('Close Notes');
        await close.trigger('click');
        expect(w.emitted('update:right')?.at(-1)).toEqual([null]);
        w.unmount();
    });

    it('the three sides are independent: the left, the right and the bottom panel can be open together', () => {
        const w = make({ left: 'files', right: 'notes', bottom: 'problems' });
        expect(w.find('.lp').exists() && w.find('.rp').exists() && w.find('.bp').exists()).toBe(true);
        expect(w.findAll('section').length).toBe(3);
        w.unmount();
    });

    it('a closed side collapses its split (no pane, no divider)', () => {
        const w = make({ left: 'files' });
        const splits = w.findAll('.tao-split');
        expect(splits.some((s) => s.classes().includes('tao-split--collapsed-start'))).toBe(false);
        expect(splits.filter((s) => s.classes().includes('tao-split--collapsed-end')).length).toBe(2);
        w.unmount();
    });

    it('a badge is part of the name of its button, and the drawn badge is not read twice', () => {
        const w = make();
        const notes = w.find('.tao-workbench__rail--right .tao-workbench__badge');
        expect(notes.element.closest('button')!.getAttribute('aria-label')).toContain('unsaved');
        expect(notes.find('.tao-sr-only').exists()).toBe(false);
        const problems = w.find('.tao-workbench__bar--bottom .tao-workbench__badge');
        expect(problems.element.closest('button')!.getAttribute('aria-label')).toContain('2 problems');
        expect(problems.find('span[aria-hidden="true"]').text()).toBe('2');
        w.unmount();
    });

    it('a disabled tool does nothing', async () => {
        const w = make({ leftTools: [{ id: 'x', label: 'X', disabled: true }] });
        await w.find('.tao-workbench__tool').trigger('click');
        expect(w.emitted('update:left')).toBeUndefined();
        w.unmount();
    });

    it('F6 goes round the regions, Shift+F6 backwards', async () => {
        const w = make({ left: 'files' });
        const regions = [...document.querySelectorAll<HTMLElement>('[data-tao-region]')];
        expect(regions.length).toBeGreaterThanOrEqual(6);
        regions[0]!.focus();
        const root = w.find('.tao-workbench').element;
        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'F6', bubbles: true, cancelable: true }));
        expect(document.activeElement).toBe(regions[1]);
        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'F6', shiftKey: true, bubbles: true, cancelable: true }));
        root.dispatchEvent(new KeyboardEvent('keydown', { key: 'F6', shiftKey: true, bubbles: true, cancelable: true }));
        expect(document.activeElement).toBe(regions.at(-1));
        await nextTick();
        w.unmount();
    });

    it('the skip link moves the focus to the workspace and leaves the address alone', async () => {
        const w = make();
        const before = window.location.href;
        await w.find('.tao-workbench__skip').trigger('click');
        expect(document.activeElement).toBe(w.find('main').element);
        expect(window.location.href).toBe(before);
        w.unmount();
    });

    it('the glow can be turned off', () => {
        expect(make({ glow: false }).classes()).not.toContain('tao-workbench--glow');
        expect(make().classes()).toContain('tao-workbench--glow');
    });
});
