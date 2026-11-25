import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoCombobox from '../src/components/TaoCombobox.vue';
import TaoPagination from '../src/components/TaoPagination.vue';
import TaoQuantity from '../src/components/TaoQuantity.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import TaoSpoiler from '../src/components/TaoSpoiler.vue';
import TaoSwitch from '../src/components/TaoSwitch.vue';
import TaoTabs from '../src/components/TaoTabs.vue';
import TaoTree from '../src/components/TaoTree.vue';

// From the audit of the migration: in an untyped template a prop of 5.x that is gone is only an attribute and a listener nobody emits is
// only never called, so the control looks right and does nothing. The dev build says so, once, with what to write instead.
// Из аудита миграции: в шаблоне без типов исчезнувший проп из 5.x — просто атрибут, а обработчик, который никто не вызывает, — просто не
// вызывается: элемент выглядит верно и ничего не делает. Dev-сборка говорит об этом один раз и называет замену.

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

function warnings(run: () => void): string[] {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    run();
    return warn.mock.calls.map(([m]) => String(m)).filter((m) => m.includes('is gone in 6.0'));
}

describe('a name of 5.x that is gone warns in dev', () => {
    it('TaoSelect options and a change listener', () => {
        const out = warnings(() => mount(TaoSelect, { props: { options: [{ value: 'a', label: 'A' }], onChange: () => {} } as never }));
        expect(out.some((m) => m.includes('TaoSelect') && m.includes('prop options') && m.includes('`items`'))).toBe(true);
        expect(out.some((m) => m.includes('TaoSelect') && m.includes('@change'))).toBe(true);
    });

    it('TaoCombobox options', () => {
        const out = warnings(() => mount(TaoCombobox, { props: { options: [] } as never }));
        expect(out.some((m) => m.includes('TaoCombobox') && m.includes('prop options'))).toBe(true);
    });

    it('TaoTree nodes', () => {
        const out = warnings(() => mount(TaoTree, { props: { items: [], nodes: [] } as never }));
        expect(out.some((m) => m.includes('TaoTree') && m.includes('prop nodes'))).toBe(true);
    });

    it('TaoCheckbox and TaoSwitch: checked, and a change listener that would get the DOM event', () => {
        const out = warnings(() => {
            mount(TaoCheckbox, { props: { checked: true, onChange: () => {} } as never });
            mount(TaoSwitch, { props: { onChange: () => {} } as never });
        });
        expect(out.some((m) => m.includes('TaoCheckbox') && m.includes('prop checked'))).toBe(true);
        expect(out.some((m) => m.includes('TaoCheckbox') && m.includes('@change') && m.includes('DOM event'))).toBe(true);
        expect(out.some((m) => m.includes('TaoSwitch') && m.includes('@change'))).toBe(true);
    });

    it('TaoTabs and TaoPagination: a change listener', () => {
        const out = warnings(() => {
            mount(TaoTabs, { props: { modelValue: 'a', items: [{ id: 'a', label: 'A' }], onChange: () => {} } as never });
            mount(TaoPagination, { props: { onChange: () => {} } as never });
        });
        expect(out.some((m) => m.includes('TaoTabs') && m.includes('@change'))).toBe(true);
        expect(out.some((m) => m.includes('TaoPagination') && m.includes('@change'))).toBe(true);
    });

    it('TaoSpoiler defaultOpen and TaoQuantity @dec', () => {
        const out = warnings(() => {
            mount(TaoSpoiler, { props: { defaultOpen: true } as never });
            mount(TaoQuantity, { props: { onDec: () => {} } as never });
        });
        expect(out.some((m) => m.includes('TaoSpoiler') && m.includes('prop defaultOpen'))).toBe(true);
        expect(out.some((m) => m.includes('TaoQuantity') && m.includes('@dec'))).toBe(true);
    });

    it('the right names say nothing', () => {
        const out = warnings(() => {
            mount(TaoSelect, { props: { items: [{ id: 'a', label: 'A' }], modelValue: 'a' } });
            mount(TaoCheckbox, { props: { modelValue: true } });
        });
        expect(out).toEqual([]);
    });
});
