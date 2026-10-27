import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import TaoCombobox from '../src/components/TaoCombobox.vue';
import TaoDate from '../src/components/TaoDate.vue';
import TaoDateRange from '../src/components/TaoDateRange.vue';
import TaoDrawer from '../src/components/TaoDrawer.vue';
import TaoDropdownMenu from '../src/components/TaoDropdownMenu.vue';
import TaoModal from '../src/components/TaoModal.vue';
import TaoPopover from '../src/components/TaoPopover.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import TaoTooltip from '../src/components/TaoTooltip.vue';

// Characterization tests for the floating / overlay family (Phase 0 of v5).
// They pin what users can observe — roles, keys, emitted events, focus — not class names or markup,
// so the Phase 3 rewrite onto shared composables must keep them green.
// Тесты фиксируют наблюдаемое поведение (роли, клавиши, события, фокус), а не разметку.

const wrappers: VueWrapper[] = [];
function mountOverlay(...args: Parameters<typeof mount>) {
    const [component, options] = args;
    const wrapper = mount(component, { ...options, attachTo: document.body });
    wrappers.push(wrapper);
    return wrapper;
}

afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
    document.body.style.overflow = '';
});

const $ = <T extends Element = HTMLElement>(selector: string) => document.body.querySelector<T>(selector);
const $$ = (selector: string) => [...document.body.querySelectorAll<HTMLElement>(selector)];

function key(target: Element | null, name: string, init: KeyboardEventInit = {}) {
    target!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }));
    return nextTick();
}

function pointerOutside() {
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    return nextTick();
}

const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Bravo', disabled: true },
    { value: 'c', label: 'Charlie' },
];

describe('TaoDropdownMenu', () => {
    const actions = [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
    ];

    it('opens a menu with items from the trigger', async () => {
        const w = mountOverlay(TaoDropdownMenu, { props: { actions } });
        expect($('[role="menu"]')).toBeNull();
        await w.find('button[aria-haspopup="menu"]').trigger('click');
        expect($$('[role="menuitem"]').map((el) => el.textContent?.trim())).toEqual(['One', 'Two']);
        expect(w.find('button').attributes('aria-expanded')).toBe('true');
    });

    it('Enter picks the active item (first by default), ArrowDown moves it; emits select', async () => {
        const w = mountOverlay(TaoDropdownMenu, { props: { actions } });
        await w.find('button').trigger('click');
        await key($('[role="menu"]'), 'ArrowDown');
        await key($('[role="menu"]'), 'Enter');
        expect(w.emitted('select')).toEqual([['two']]);
        expect($('[role="menu"]')).toBeNull();
    });

    it('Escape closes and returns focus to the trigger', async () => {
        const w = mountOverlay(TaoDropdownMenu, { props: { actions } });
        const trigger = w.find('button').element as HTMLElement;
        await w.find('button').trigger('click');
        await key($('[role="menu"]'), 'Escape');
        expect($('[role="menu"]')).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    it('a press outside closes it', async () => {
        const w = mountOverlay(TaoDropdownMenu, { props: { actions } });
        await w.find('button').trigger('click');
        await pointerOutside();
        expect($('[role="menu"]')).toBeNull();
    });
});

describe('TaoSelect', () => {
    it('opens a listbox; disabled options are skipped by the arrows; Enter picks', async () => {
        const w = mountOverlay(TaoSelect, { props: { options, modelValue: 'a' } });
        await w.find('[role="combobox"]').trigger('click');
        expect($$('[role="option"]').map((el) => el.textContent?.trim())).toEqual(['Alpha', 'Bravo', 'Charlie']);
        await key($('[role="listbox"]'), 'ArrowDown');
        await key($('[role="listbox"]'), 'Enter');
        expect(w.emitted('update:modelValue')).toEqual([['c']]);
        expect(w.emitted('change')).toEqual([['c']]);
        expect($('[role="listbox"]')).toBeNull();
    });

    it('Home / End jump to the first / last enabled option', async () => {
        const w = mountOverlay(TaoSelect, { props: { options, modelValue: 'c' } });
        await w.find('[role="combobox"]').trigger('click');
        await key($('[role="listbox"]'), 'Home');
        await key($('[role="listbox"]'), 'Enter');
        await w.find('[role="combobox"]').trigger('click');
        await key($('[role="listbox"]'), 'End');
        await key($('[role="listbox"]'), 'Enter');
        expect(w.emitted('update:modelValue')).toEqual([['a'], ['c']]);
    });

    it('Escape closes and focuses the trigger; an outside press closes', async () => {
        const w = mountOverlay(TaoSelect, { props: { options } });
        const trigger = w.find('[role="combobox"]').element as HTMLElement;
        await w.find('[role="combobox"]').trigger('click');
        await key($('[role="listbox"]'), 'Escape');
        expect($('[role="listbox"]')).toBeNull();
        expect(document.activeElement).toBe(trigger);

        await w.find('[role="combobox"]').trigger('click');
        await pointerOutside();
        expect($('[role="listbox"]')).toBeNull();
    });

    it('ArrowDown on the closed trigger opens it; Delete clears when clearable', async () => {
        const w = mountOverlay(TaoSelect, { props: { options, modelValue: 'a' } });
        await key(w.find('[role="combobox"]').element, 'ArrowDown');
        expect($('[role="listbox"]')).not.toBeNull();
        await key($('[role="listbox"]'), 'Escape');
        await key(w.find('[role="combobox"]').element, 'Delete');
        expect(w.emitted('update:modelValue')).toEqual([[null]]);
    });

    it('a disabled select does not open', async () => {
        const w = mountOverlay(TaoSelect, { props: { options, disabled: true } });
        await w.find('[role="combobox"]').trigger('click');
        expect($('[role="listbox"]')).toBeNull();
    });
});

describe('TaoCombobox', () => {
    it('typing filters the options, Enter picks the active one', async () => {
        const w = mountOverlay(TaoCombobox, { props: { options } });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('char');
        expect($$('[role="option"]').map((el) => el.textContent?.trim())).toEqual(['Charlie']);
        await key(input.element, 'ArrowDown');
        await key(input.element, 'Enter');
        expect(w.emitted('update:modelValue')?.slice(-1)[0]).toEqual(['c']);
    });

    it('Escape closes the list', async () => {
        const w = mountOverlay(TaoCombobox, { props: { options } });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('a');
        expect($('[role="listbox"]')).not.toBeNull();
        await key(input.element, 'Escape');
        expect($('[role="listbox"]')).toBeNull();
    });

    it('allowCreate offers the typed text and emits create', async () => {
        const w = mountOverlay(TaoCombobox, { props: { options, allowCreate: true } });
        const input = w.find('input');
        await input.trigger('focus');
        await input.setValue('Zulu');
        const rows = $$('[role="option"]');
        await rows[rows.length - 1]!.click();
        expect(w.emitted('create')).toEqual([['Zulu']]);
    });
});

describe('TaoPopover', () => {
    const trigger = () => h('button', { type: 'button' }, 'open');

    it('opens on trigger click and renders the panel as a dialog', async () => {
        const w = mountOverlay(TaoPopover, { slots: { trigger, default: () => 'body' } });
        expect($('[role="dialog"]')).toBeNull();
        await w.find('button').trigger('click');
        expect($('[role="dialog"]')?.textContent).toContain('body');
    });

    it('Escape and an outside press close it', async () => {
        const w = mountOverlay(TaoPopover, { slots: { trigger, default: () => 'body' } });
        await w.find('button').trigger('click');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        expect($('[role="dialog"]')).toBeNull();

        await w.find('button').trigger('click');
        await pointerOutside();
        expect($('[role="dialog"]')).toBeNull();
    });

    it('v-model controls it, and disabled keeps it shut', async () => {
        const open = ref(true);
        const Host = defineComponent({
            setup: () => () =>
                h(TaoPopover as never, { modelValue: open.value, 'onUpdate:modelValue': (v: boolean) => (open.value = v) }, { trigger, default: () => 'body' }),
        });
        mountOverlay(Host);
        await nextTick();
        expect($('[role="dialog"]')).not.toBeNull();
        await pointerOutside();
        expect(open.value).toBe(false);

        const w = mountOverlay(TaoPopover, { props: { disabled: true }, slots: { trigger, default: () => 'x' } });
        await w.find('button').trigger('click');
        expect($$('[role="dialog"]')).toHaveLength(0);
    });
});

describe('TaoTooltip', () => {
    it('shows on hover and focus, hides on leave and blur', async () => {
        const w = mountOverlay(TaoTooltip, { props: { content: 'Hint' }, slots: { default: () => h('button', 'x') } });
        expect($('[role="tooltip"]')).toBeNull();
        await w.trigger('mouseenter');
        expect($('[role="tooltip"]')?.textContent).toContain('Hint');
        await w.trigger('mouseleave');
        expect($('[role="tooltip"]')).toBeNull();
        await w.trigger('focusin');
        expect($('[role="tooltip"]')).not.toBeNull();
        await w.trigger('focusout');
        expect($('[role="tooltip"]')).toBeNull();
    });
});

describe.each([
    ['TaoModal', TaoModal],
    ['TaoDrawer', TaoDrawer],
] as const)('%s', (_name, Component) => {
    it('renders a dialog only when open and locks page scroll meanwhile', async () => {
        const w = mountOverlay(Component, { props: { modelValue: false }, slots: { default: () => 'content' } });
        expect($('[role="dialog"]')).toBeNull();
        await (w as VueWrapper<any>).setProps({ modelValue: true });
        expect($('[role="dialog"]')?.textContent).toContain('content');
        expect(document.body.style.overflow).toBe('hidden');
        await (w as VueWrapper<any>).setProps({ modelValue: false });
        await nextTick();
        expect(document.body.style.overflow).toBe('');
    });

    it('Escape asks to close (update:modelValue false + close), unless closable is off', async () => {
        const w = mountOverlay(Component, { props: { modelValue: true }, slots: { default: () => 'content' } });
        await nextTick();
        await key($('[role="dialog"]'), 'Escape');
        expect(w.emitted('update:modelValue')).toEqual([[false]]);
        expect(w.emitted('close')).toHaveLength(1);

        const locked = mountOverlay(Component, { props: { modelValue: true, closable: false }, slots: { default: () => 'c' } });
        await nextTick();
        const dialogs = $$('[role="dialog"]');
        await key(dialogs[dialogs.length - 1]!, 'Escape');
        expect(locked.emitted('update:modelValue')).toBeUndefined();
    });

    it('keeps Tab inside the dialog', async () => {
        mountOverlay(Component, {
            props: { modelValue: true },
            slots: { default: () => [h('button', { id: 'first' }, 'a'), h('button', { id: 'last' }, 'b')] },
        });
        await nextTick();
        const last = $('#last')!;
        last.focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        last.dispatchEvent(event);
        // either the trap moved focus itself or it scheduled a pull-back; the default must not escape the dialog
        expect(event.defaultPrevented || $('[role="dialog"]')!.contains(document.activeElement)).toBe(true);
    });
});

describe('TaoDate', () => {
    it('opens a calendar dialog, a day click emits an ISO date and closes', async () => {
        const w = mountOverlay(TaoDate, { props: { modelValue: '2026-03-10' } });
        await w.find('[role="combobox"]').trigger('click');
        expect($('[role="dialog"]')).not.toBeNull();
        const day = $$('[role="gridcell"]').find((el) => el.textContent?.trim() === '15')!;
        day.click();
        await nextTick();
        expect(w.emitted('update:modelValue')).toEqual([['2026-03-15']]);
        expect($('[role="dialog"]')).toBeNull();
    });

    it('min / max block days outside the range', async () => {
        const w = mountOverlay(TaoDate, { props: { modelValue: '2026-03-10', min: '2026-03-05', max: '2026-03-20' } });
        await w.find('[role="combobox"]').trigger('click');
        const day = (n: string) => $$('[role="gridcell"]').find((el) => el.textContent?.trim() === n)!;
        day('25').click();
        day('2').click();
        await nextTick();
        expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('Escape closes', async () => {
        const w = mountOverlay(TaoDate, { props: { modelValue: '2026-03-10' } });
        await w.find('[role="combobox"]').trigger('click');
        await key($('[role="dialog"]'), 'Escape');
        expect($('[role="dialog"]')).toBeNull();
    });
});

describe('TaoDateRange', () => {
    it('two day clicks make a from / to range', async () => {
        const w = mountOverlay(TaoDateRange, { props: { modelValue: null } });
        await w.find('[role="combobox"]').trigger('click');
        const day = (n: string) => $$('[role="gridcell"]').find((el) => el.textContent?.trim() === n && !el.className.includes('outside'))!;
        day('10').click();
        await nextTick();
        day('14').click();
        await nextTick();
        const emitted = w.emitted('update:modelValue');
        expect(emitted).toHaveLength(1);
        const range = emitted![0]![0] as { start: string; end: string };
        expect(range.start.endsWith('-10')).toBe(true);
        expect(range.end.endsWith('-14')).toBe(true);
    });
});
