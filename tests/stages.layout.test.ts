import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the component source as text
import source from '../src/components/TaoStages.vue?raw';

// 5.23.0: the icon of a stage is exactly its svg; a block span lifted it off the middle of the label and spun it around a wrong point.
// 5.23.0: иконка этапа ровно по своему svg; блочная обёртка поднимала её над серединой подписи и крутила вокруг не её центра.

function rule(selector: string): string {
    const escaped = selector.replace(/[.]/g, String.raw`\.`);
    const match = (source as string).match(new RegExp(String.raw`(?:^|[\s,}])${escaped}\s*\{([^}]*)\}`, 'm'));
    return match?.[1] ?? '';
}

describe('TaoStages icon box', () => {
    it('the mark is not a block: no line gap under the svg, so it sits on the middle and spins around its own centre', () => {
        const css = rule('.tao-stages__mark');
        expect(css).not.toMatch(/display:\s*block/);
        expect(css).toMatch(/display:\s*(flex|inline-flex)/);
    });

    it('the spinner turns the mark itself', () => {
        expect(rule('.tao-stages__item--work .tao-stages__mark')).toMatch(/animation:/);
    });
});
