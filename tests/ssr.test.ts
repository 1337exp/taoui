// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { describe, expect, it } from 'vitest';
import * as lib from '../src/index';

// Nuxt is a first-class target (README), so every component must render on the server
// without touching window / document. This runs in a plain Node environment on purpose.
// Nuxt — целевая платформа, поэтому каждый компонент должен рендериться на сервере без window / document.

const skip = new Set([
    // host components that only make sense with the imperative api / компоненты-хосты
    'TaoToastViewport',
    'TaoConfirmHost',
]);

// props that are required to mount at all / обязательные пропсы
const props: Record<string, Record<string, unknown>> = {
    TaoTimeline: { modelValue: 0, length: 10 },
    TaoTabs: { modelValue: 'a', items: [{ value: 'a', label: 'A' }] },
    TaoModal: { modelValue: true },
    TaoDrawer: { modelValue: true },
    TaoTooltip: { content: 'hint' },
    TaoIcon: { name: 'x' },
    TaoSlider: { modelValue: 1 },
    TaoRangeSlider: { modelValue: [1, 2] },
    TaoImage: { src: 'a.png' },
    TaoTable: { columns: [{ key: 'a', label: 'A' }], rows: [{ a: 1 }] },
    TaoRadio: { value: 1 },
    TaoSegmentedOption: { value: 1 },
    TaoSpoilerGroup: {},
    TaoBreadcrumb: { items: [{ label: 'Home', to: '/' }] },
    TaoColorInput: { modelValue: '#ff8800' },
    TaoColorPicker: { modelValue: '#ff8800' },
    TaoCopy: { text: 'copy me' },
};

const components = Object.entries(lib).filter(
    ([name, value]) => /^Tao[A-Z]/.test(name) && name !== 'TaoUI' && typeof value === 'object' && value !== null && !skip.has(name),
);

describe('server-side rendering', () => {
    it('finds the components to check', () => {
        expect(components.length).toBeGreaterThan(55);
    });

    it.each(components)('%s renders on the server', async (name, component) => {
        const app = createSSRApp({
            render: () => h(component as never, props[name] ?? {}, { default: () => 'x' }),
        });
        // components that read optional injections are mounted standalone, as a user would
        const html = await renderToString(app);
        expect(typeof html).toBe('string');
    });
});
