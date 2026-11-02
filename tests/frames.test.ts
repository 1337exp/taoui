import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoAlert from '../src/components/TaoAlert.vue';
import TaoSpoiler from '../src/components/TaoSpoiler.vue';
import TaoTable from '../src/components/TaoTable.vue';
import TaoToolbar from '../src/components/TaoToolbar.vue';
import TaoMenubar from '../src/components/TaoMenubar.vue';
import { frameStyle } from '../src/frames';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import framesCss from '../src/styles/contexts/frames.css?raw';
// @ts-expect-error Vite `?raw` import
import indexCss from '../src/styles/index.css?raw';
// @ts-expect-error Vite `?raw` import
import rawAlert from '../src/components/TaoAlert.vue?raw';
// @ts-expect-error Vite `?raw` import
import rawSpoiler from '../src/components/TaoSpoiler.vue?raw';
// @ts-expect-error Vite `?raw` import
import rawTable from '../src/components/TaoTable.vue?raw';
// @ts-expect-error Vite `?raw` import
import rawToolbar from '../src/components/TaoToolbar.vue?raw';
// @ts-expect-error Vite `?raw` import
import rawMenubar from '../src/components/TaoMenubar.vue?raw';
// @ts-expect-error Vite `?raw` import
import rawList from '../src/components/TaoList.vue?raw';

// 5.22.0: the frames context: `.tao-frames-soft` lets the decorative frames of panels go clear, `bordered` overrides it per panel.
// 5.22.0: контекст рамок: `.tao-frames-soft` делает декоративные рамки панелей прозрачными, `bordered` переопределяет для панели.

const sources: Record<string, string> = { TaoAlert: rawAlert, TaoSpoiler: rawSpoiler, TaoTable: rawTable, TaoToolbar: rawToolbar, TaoMenubar: rawMenubar, TaoList: rawList };

describe('frames context: the stylesheet', () => {
    it('is in the layer order, after the surface', () => {
        const imported = [...(indexCss as string).matchAll(/@import "\.\/([^"]+)"/g)].map((m) => m[1]);
        expect(imported.indexOf('contexts/frames.css')).toBe(imported.indexOf('contexts/surface.css') + 1);
    });

    it('framed by default and under .tao-frames-framed, soft under .tao-frames-soft: all three tokens, set where the class is', () => {
        const css = framesCss as string;
        const block = (selector: string) => css.match(new RegExp(String.raw`${selector}\s*\{([^}]*)\}`))?.[1] ?? '';
        const framed = block(String.raw`:root,\s*\.tao-frames-framed`);
        const soft = block(String.raw`\.tao-frames-soft`);
        expect(framed).toMatch(/--tao-frame-alpha:\s*100%/);
        expect(framed).toMatch(/--tao-frame-tint:\s*0%/);
        expect(framed).toMatch(/--tao-frame-fill:\s*0%/);
        expect(soft).toMatch(/--tao-frame-alpha:\s*0%/);
        expect(soft).toMatch(/--tao-frame-tint:\s*[1-9]\d*%/);
        expect(soft).toMatch(/--tao-frame-fill:\s*100%/);
    });
});

describe('frames context: the panels read it', () => {
    it('every decorative panel takes the alpha of its frame from the token, not from a fixed colour', () => {
        for (const name of Object.keys(sources)) {
            expect(sources[name], name).toMatch(/var\(--tao-frame-alpha, 100%\)/);
        }
    });
});

describe('frameStyle', () => {
    it('not set: nothing, so the context decides; true and false set the three tokens for the panel itself', () => {
        expect(frameStyle(undefined)).toBeUndefined();
        expect(frameStyle(null)).toBeUndefined();
        expect(frameStyle(true)).toEqual({ '--tao-frame-alpha': '100%', '--tao-frame-tint': '0%', '--tao-frame-fill': '0%' });
        expect(frameStyle(false)).toEqual({ '--tao-frame-alpha': '0%', '--tao-frame-tint': '6%', '--tao-frame-fill': '100%' });
    });
});

describe('bordered on the panels', () => {
    const cases: Array<[string, () => ReturnType<typeof mount>]> = [
        ['TaoAlert', (b?: boolean) => mount(TaoAlert, { props: { bordered: b }, slots: { default: 'text' } })],
        ['TaoSpoiler', (b?: boolean) => mount(TaoSpoiler, { props: { title: 'T', bordered: b } })],
        ['TaoTable', (b?: boolean) => mount(TaoTable, { props: { columns: [{ key: 'a', label: 'A' }], rows: [{ id: 1, a: 'x' }], bordered: b } })],
        ['TaoToolbar', (b?: boolean) => mount(TaoToolbar, { props: { bordered: b }, slots: { default: '<button>x</button>' } })],
        ['TaoMenubar', (b?: boolean) => mount(TaoMenubar, { props: { items: [{ id: 'a', label: 'A' }], bordered: b } })],
    ] as never;

    it.each(cases)('%s: not set, it has no inline tokens; false and true set them on its root', (_name, make) => {
        const build = make as unknown as (b?: boolean) => ReturnType<typeof mount>;
        expect(build().attributes('style') ?? '').not.toContain('--tao-frame-alpha');
        expect(build(false).attributes('style')).toContain('--tao-frame-alpha: 0%');
        expect(build(true).attributes('style')).toContain('--tao-frame-alpha: 100%');
    });
});
