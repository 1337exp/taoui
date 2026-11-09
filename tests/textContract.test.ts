import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import toneCss from '../src/styles/contexts/tone.css?raw';

// 5.32.0: the text ladder (Guide, "The text ladder"). `text-strong` is for titles, the value that is the point and
// the hover of a quiet control: never a control at rest. A component that needs it at rest is added here with a reason.
// 5.32.0: лестница текста (Guide, «Лестница текста»). `text-strong` — заголовки, значение-смысл и наведение на тихий
// контрол: не контрол в покое. Компонент, которому он нужен в покое, добавляется сюда с причиной.

const sources = (import.meta as unknown as { glob: (p: string, o: object) => unknown }).glob('../src/components/*.vue', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

/** The selectors that may be strong at rest, and why. / Селекторы, которым можно быть strong в покое, и почему. */
const allowed: Record<string, string> = {
    '.tao-alert__title': 'a title',
    '.tao-card__title': 'a title',
    '.tao-confirm__title': 'a title',
    '.tao-drawer__title': 'a title',
    '.tao-modal__title': 'a title',
    '.tao-empty__title': 'a title',
    '.tao-timeline__title': 'a title',
    '.tao-toast__title': 'a title',
    '.tao-donut__centre': 'the figure the chart is about',
    '.tao-slider__value': 'the value the slider is about',
    '.tao-tooltip': 'a tooltip is a bright bubble, not a control',
    '.tao-copy__tip': 'a tooltip bubble',
    '.tao-heatmap__tip': 'a tooltip bubble',
    '.tao-tour__card': 'the card of a tour is a panel with its own title',
    '.tao-scroll-top__label': 'a label that appears on hover',
};

/** The rules of the <style> blocks as [selector, body]. / Правила блоков <style> как [селектор, тело]. */
function rules(source: string): Array<[string, string]> {
    const out: Array<[string, string]> = [];
    for (const style of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        const css = style[1]!.replace(/\/\*[\s\S]*?\*\//g, '');
        for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
            out.push([m[1]!.trim().replace(/\s+/g, ' '), m[2]!]);
        }
    }
    return out;
}

const REST_ONLY = /:(hover|focus|focus-visible|active)|--(open|active|pressed|selected|current)|\[aria-(selected|current|expanded|checked|pressed)/;

describe('the text ladder: strong is not for a control at rest', () => {
    it('no component sets text-strong as the colour of a rest state, but the listed ones', () => {
        const offenders: string[] = [];
        for (const [file, source] of Object.entries(sources)) {
            for (const [selector, body] of rules(source)) {
                if (!/(^|;|\s)color:\s*var\(--tao-color-text-strong\)/.test(body)) {
                    continue;
                }
                for (const one of selector.split(',').map((s) => s.trim())) {
                    if (REST_ONLY.test(one) || allowed[one]) {
                        continue;
                    }
                    offenders.push(`${file.split('/').pop()}: ${one}`);
                }
            }
        }
        expect(offenders).toEqual([]);
    });

    it('every allowed selector still exists, so the list does not rot', () => {
        const all = Object.values(sources).join('\n');
        for (const selector of Object.keys(allowed)) {
            expect(all, selector).toContain(selector);
        }
    });

    it('the neutral tone reads as the body text at rest and steps up to strong on hover', () => {
        const block = toneCss.slice(toneCss.indexOf('.tao-tone-neutral {'));
        const body = block.slice(0, block.indexOf('}'));
        expect(body).toMatch(/--tao-tone-text:\s*var\(--tao-color-text\);/);
        expect(body).toMatch(/--tao-tone-text-hover:\s*var\(--tao-color-text-strong\);/);
    });
});
