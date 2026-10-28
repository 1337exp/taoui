import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the component as text
import tagSfc from '../src/components/TaoTag.vue?raw';

// The text of a tag sits a whole pixel from its edge: the line is as tall as the inside of the tag (height minus two
// borders). With 1.25 the line was 15px in a 16px inside, 1.5px from the edge; on a fractional position of the page the
// box and the text rounded to different pixels and the text jumped from one tag to the next.
// Текст тега отстоит от края на целый пиксель: строка ровно по внутренней высоте (высота минус две рамки).

const sfc = tagSfc as string;
const css = sfc.slice(sfc.indexOf('>', sfc.indexOf('<style')) + 1).replace(/\/\*[\s\S]*?\*\//g, '');

describe('TaoTag line', () => {
    it('is the height of the tag minus its borders, for every size', () => {
        const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, selectors]) => selectors!.split(',').map((s) => s.trim()).includes('.tao-tag'));
        expect(rule![2]).toMatch(/line-height:\s*calc\(var\(--tao-tag-height\) - 2px\)/);
        expect(rule![2]).toContain('border: 1px solid');
    });
});
