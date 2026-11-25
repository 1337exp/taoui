import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import TaoShell from '../src/components/TaoShell.vue';
import { createKitPrefs } from '../src/kitPrefs';

// TaoShell: the navigation, the action, the project, the language and the theme, and the page, in one component.
// TaoShell: навигация, действие, проект, язык и тема и страница в одном компоненте.

const items = [{ id: 'a', label: 'A', icon: 'tao-circle' }, { id: 'b', label: 'B', icon: 'tao-circle' }];
const projects = [{ id: 'home', title: 'Home' }, { id: 'work', title: 'Work' }];
const wrappers: { unmount(): void }[] = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});
function shell(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
    const w = mount(TaoShell, { props: { items, modelValue: 'a', ...props }, slots, attachTo: document.body });
    wrappers.push(w);
    return w;
}

describe('TaoShell', () => {
    it('lays the page beside the navigation, filling its box', () => {
        const w = shell({}, { default: () => h('p', { class: 'page' }, 'x') });
        expect(w.find('.tao-nav--fill').exists()).toBe(true);
        expect(w.find('.tao-shell__main .page').exists()).toBe(true);
    });

    it('the section is a model', async () => {
        const w = shell();
        await w.findAll('.tao-nav__item')[1]!.trigger('click');
        expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['b']);
    });

    it('the main action is emitted', async () => {
        const w = shell({ action: { label: 'New' } });
        await w.find('.tao-nav__action button').trigger('click');
        expect(w.emitted('action')).toHaveLength(1);
        expect(w.find('.tao-nav__action-label').text()).toBe('New');
    });

    it('no projects, no chip; with them the current one is named, the word «Project» only for a screen reader', () => {
        expect(shell().find('.tao-shell__chip').exists()).toBe(false);
        const w = shell({ projects, project: 'work' });
        expect(w.find('.tao-shell__chip-text').text()).toBe('Work');
        expect(w.find('.tao-shell__chip .tao-sr-only').text()).toBe('Project:');
    });

    it('without a project chosen the first one is shown', () => {
        expect(shell({ projects }).find('.tao-shell__chip-text').text()).toBe('Home');
    });

    it('the project menu picks a project and offers a new one', async () => {
        const w = shell({ projects, project: 'home' });
        await w.find('.tao-shell__project button').trigger('click');
        await nextTick();
        const entries = [...document.body.querySelectorAll<HTMLElement>('[role="menuitemradio"], [role="menuitem"]')];
        expect(entries.map((e) => e.textContent?.trim())).toEqual(['Home', 'Work', 'New project']);
        entries[1]!.click();
        await nextTick();
        expect(w.emitted('update:project')?.at(-1)).toEqual(['work']);
        await w.find('.tao-shell__project button').trigger('click');
        await nextTick();
        [...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')].at(-1)!.click();
        expect(w.emitted('new-project')).toHaveLength(1);
    });

    it('the language and the theme: the prefs of the product drive them', async () => {
        const prefs = createKitPrefs({ key: 'shell-test', storage: null, root: document.createElement('div') });
        const w = shell({ prefs, languages: ['en', 'ru'] });
        expect(w.find('.tao-language-switch, [class*="language"]').exists()).toBe(true);
        prefs.mode.value = 'dark';
        await nextTick();
        expect(w.find('.tao-shell__tools').exists()).toBe(true);
        prefs.dispose();
    });

    it('a tools slot replaces the language and the theme', () => {
        const w = shell({ languages: ['en'] }, { tools: () => h('i', { class: 'mine' }) });
        expect(w.findAll('.tao-shell__tools .mine')).toHaveLength(2);
        expect(w.find('[class*="theme"]').exists()).toBe(false);
    });

    it('the look is readable', () => {
        const w = shell({ layout: 'rail' });
        expect(w.emitted('update:look')?.at(-1)).toEqual(['rail']);
    });
});
