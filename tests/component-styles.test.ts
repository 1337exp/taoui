import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import primitivesCss from '../src/styles/tokens/primitives.css?raw';

/**
 * Guards for the styles of the components (see CONTRIBUTING.md, "Rules the code follows"):
 * a component reads roles and not primitives, writes no colour of its own, and does not add spacing pixels beyond the ones it has.
 * Охрана стилей компонентов: компонент читает роли, а не примитивы, не пишет свой цвет и не добавляет новых отступов в пикселях.
 */

const sources = (import.meta as unknown as { glob: (p: string, o: object) => unknown }).glob('../src/components/*.vue', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const styles = Object.entries(sources).map(([path, source]) => ({
    file: path.split('/').pop()!,
    css: [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, ''),
}));

describe('component styles', () => {
    it('read roles, not the colour primitives', () => {
        const scales = new Set([...(primitivesCss as string).matchAll(/--tao-([a-z]+)-\d+\s*:\s*#/g)].map((m) => m[1]));
        expect(scales.size).toBeGreaterThan(5);
        const pattern = new RegExp(`var\\(--tao-(${[...scales].join('|')})-\\d+`);
        const offenders = styles.filter(({ css }) => pattern.test(css)).map(({ file }) => file);
        expect(offenders).toEqual([]);
    });

    it('write no colour of their own', () => {
        // What may stay: a mask is shape and not colour, black at an opacity is a shadow, `#0000` is the empty fallback of a shadow,
        // the colour plane of the picker is the colour itself.
        // Что остаётся: маска — форма, а не цвет; чёрный с прозрачностью — тень; `#0000` — пустой запас тени; плоскость пикера — сам цвет.
        const literal = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|:\s*(?:white|black|red|green|blue|yellow|orange|gray|grey)\b/;
        const offenders = styles
            .filter(({ file }) => file !== 'TaoColorPicker.vue')
            .filter(({ css }) => {
                const rest = css
                    .replace(/(?:-webkit-)?mask(?:-image)?\s*:[^;]*;/g, '')
                    .replace(/linear-gradient\(#000 0 0\)/g, '')
                    .replace(/#0000\b/g, '')
                    .replace(/\brgba?\(\s*0[\s,]+0[\s,]+0\b[^)]*\)/g, '');
                return literal.test(rest);
            })
            .map(({ file }) => file);
        expect(offenders).toEqual([]);
    });

    // Spacing in pixels beside the `--tao-space-*` scale: a hairline, an optical nudge, a glyph that has to sit on a grid of its own.
    // The count per file may only go down; a new component starts at zero. Lowering a number here is the right way to record a cleanup.
    // Отступы в пикселях рядом со шкалой: волосяная линия, оптическая подвижка, глиф на своей сетке.
    // Число на файл может только падать; новый компонент начинает с нуля. Уменьшить число здесь — правильный способ записать уборку.
    const SPACING_PIXELS: Record<string, number> = {
        'TaoAvatar.vue': 2, 'TaoButton.vue': 1, 'TaoCard.vue': 3, 'TaoCarousel.vue': 1, 'TaoChecklist.vue': 1,
        'TaoColorInput.vue': 1, 'TaoColorPicker.vue': 4, 'TaoConfirmHost.vue': 1, 'TaoCopy.vue': 2, 'TaoCounter.vue': 1,
        'TaoFileDrop.vue': 1, 'TaoHeatmap.vue': 1, 'TaoInputNumber.vue': 1, 'TaoListItem.vue': 1, 'TaoMarquee.vue': 2,
        'TaoNav.vue': 2, 'TaoPinCode.vue': 2, 'TaoRadio.vue': 1, 'TaoScrubber.vue': 2, 'TaoSegmented.vue': 1,
        'TaoSegmentedOption.vue': 3, 'TaoSliderBase.vue': 8, 'TaoSparkline.vue': 2, 'TaoSwitch.vue': 2, 'TaoTabs.vue': 1,
        'TaoTag.vue': 2, 'TaoTimeline.vue': 1, 'TaoToastItem.vue': 1, 'TaoToolbarGroup.vue': 2, 'TaoTooltip.vue': 4,
    };

    function spacingPixels(css: string): number {
        let count = 0;
        for (const match of css.matchAll(/(?:^|[;{\s])(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?\s*:\s*([^;}]*)/g)) {
            if (/(?<![\d.])(?:[1-9]\d*(?:\.\d+)?|0\.\d+)px/.test(match[1]!)) count++;
        }
        return count;
    }

    it('add no spacing in pixels beyond the recorded ones', () => {
        const grown = styles
            .map(({ file, css }) => ({ file, now: spacingPixels(css), was: SPACING_PIXELS[file] ?? 0 }))
            .filter(({ now, was }) => now > was)
            .map(({ file, now, was }) => `${file}: ${now} > ${was}`);
        expect(grown).toEqual([]);
    });
});
