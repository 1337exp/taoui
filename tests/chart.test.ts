import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoDonut from '../src/components/TaoDonut.vue';
import TaoMeter from '../src/components/TaoMeter.vue';
import TaoSparkline from '../src/components/TaoSparkline.vue';
import { colourDistance, contrastRatio } from '../src/palette';
import { donutArcs, fraction, meterTone, sparklineArea, sparklinePath, sparklineRuns, taoChartTheme, toRgb } from '../src/chart';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import darkCss from '../src/styles/themes/dark.css?raw';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import lightCss from '../src/styles/themes/light.css?raw';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import primitivesCss from '../src/styles/tokens/primitives.css?raw';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import lagoonCss from '../src/styles/palettes/lagoon.css?raw';

// 5.3: small charts and the colours for a real chart library.
// 5.3: маленькие графики и цвета для настоящей библиотеки графиков.

describe('sparkline geometry', () => {
    it('spreads the points over 0…100, the highest at the top', () => {
        expect(sparklineRuns([0, 5, 10])).toEqual([[[0, 100], [50, 50], [100, 0]]]);
        expect(sparklinePath(sparklineRuns([0, 10]))).toBe('M0 100L100 0');
    });

    it('a flat series lies in the middle; min / max fix the range and clamp', () => {
        expect(sparklineRuns([3, 3, 3])[0].map(([, y]) => y)).toEqual([50, 50, 50]);
        expect(sparklineRuns([0, 50, 200], 0, 100)[0].map(([, y]) => y)).toEqual([100, 50, 0]);
    });

    it('a gap splits the line, and the area closes each run down to the baseline', () => {
        const runs = sparklineRuns([1, 2, null, 2, 1]);
        expect(runs).toHaveLength(2);
        expect(sparklinePath(runs).match(/M/g)).toHaveLength(2);
        expect(sparklineArea(runs)).toBe('M0 100L0 100L25 0L25 100ZM75 100L75 0L100 100L100 100Z');
    });

    it('nothing to draw → no runs', () => {
        expect(sparklineRuns([])).toEqual([]);
        expect(sparklineRuns([null, Number.NaN])).toEqual([]);
    });
});

describe('TaoSparkline', () => {
    it('with a label it is an image with that name; without one it is hidden from a screen reader', () => {
        const named = mount(TaoSparkline, { props: { values: [1, 3, 2], label: 'Visits' } });
        expect(named.attributes('role')).toBe('img');
        expect(named.attributes('aria-label')).toBe('Visits');
        const plain = mount(TaoSparkline, { props: { values: [1, 3, 2] } });
        expect(plain.attributes('aria-hidden')).toBe('true');
    });

    it('draws the area and the dot on the last value only when asked', () => {
        const w = mount(TaoSparkline, { props: { values: [1, 3, 2], area: true, dot: true, tone: 'success' } });
        expect(w.find('.tao-sparkline__area').exists()).toBe(true);
        expect(w.find('.tao-sparkline__dot').exists()).toBe(true);
        expect(w.classes()).toContain('tao-tone-success');
        const bare = mount(TaoSparkline, { props: { values: [1, 3, 2] } });
        expect(bare.find('.tao-sparkline__area').exists()).toBe(false);
        expect(bare.find('.tao-sparkline__dot').exists()).toBe(false);
    });

    it('no dot when the last value is a gap', () => {
        const w = mount(TaoSparkline, { props: { values: [1, 3, null], dot: true } });
        expect(w.find('.tao-sparkline__dot').exists()).toBe(false);
    });
});

describe('meter tone, as the HTML <meter>', () => {
    it('without low / high it is the accent', () => {
        expect(meterTone(30, 0, 100)).toBe('accent');
    });

    it('optimum in the middle (by default): the middle is good, both ends a warning', () => {
        expect(meterTone(50, 0, 100, 20, 80)).toBe('success');
        expect(meterTone(10, 0, 100, 20, 80)).toBe('warning');
        expect(meterTone(90, 0, 100, 20, 80)).toBe('warning');
    });

    it('optimum low (disk space used): high is bad', () => {
        expect(meterTone(10, 0, 100, 60, 90, 0)).toBe('success');
        expect(meterTone(70, 0, 100, 60, 90, 0)).toBe('warning');
        expect(meterTone(95, 0, 100, 60, 90, 0)).toBe('danger');
    });

    it('optimum high (a battery): low is bad', () => {
        expect(meterTone(5, 0, 100, 20, 50, 100)).toBe('danger');
        expect(meterTone(30, 0, 100, 20, 50, 100)).toBe('warning');
        expect(meterTone(80, 0, 100, 20, 50, 100)).toBe('success');
    });

    it('fraction clamps and survives an empty range', () => {
        expect(fraction(150, 0, 100)).toBe(1);
        expect(fraction(-5, 0, 100)).toBe(0);
        expect(fraction(5, 10, 10)).toBe(0);
    });
});

describe('TaoMeter', () => {
    it('is a meter with its numbers and name, coloured by low / high', () => {
        const w = mount(TaoMeter, { props: { value: 95, low: 60, high: 90, optimum: 0, label: 'Disk' } });
        expect(w.attributes('role')).toBe('meter');
        expect(w.attributes('aria-valuenow')).toBe('95');
        expect(w.attributes('aria-valuemin')).toBe('0');
        expect(w.attributes('aria-valuemax')).toBe('100');
        expect(w.attributes('aria-label')).toBe('Disk');
        expect(w.classes()).toContain('tao-tone-danger');
        expect(w.find('.tao-meter__fill').attributes('style')).toContain('width: 95%');
    });

    it('the value text: off, the number, or your own text (which a screen reader reads too)', () => {
        expect(mount(TaoMeter, { props: { value: 40, label: 'A' } }).find('.tao-meter__value').exists()).toBe(false);
        expect(mount(TaoMeter, { props: { value: 40, valueText: true } }).find('.tao-meter__value').text()).toBe('40');
        const own = mount(TaoMeter, { props: { value: 120, max: 256, valueText: '120 of 256 GB' } });
        expect(own.find('.tao-meter__value').text()).toBe('120 of 256 GB');
        expect(own.attributes('aria-valuetext')).toBe('120 of 256 GB');
    });

    it('a fixed tone wins', () => {
        expect(mount(TaoMeter, { props: { value: 95, low: 60, high: 90, optimum: 0, tone: 'info' } }).classes()).toContain('tao-tone-info');
    });
});

describe('donut arcs', () => {
    it('one part fills the ring with no gap; parts share it with a gap of 1 between them', () => {
        expect(donutArcs([5])).toEqual([[0, 100]]);
        expect(donutArcs([1, 1])).toEqual([[0.5, 49], [50.5, 49]]);
    });

    it('zero and negative parts take no room; a tiny part still shows', () => {
        expect(donutArcs([1, 0, 1])).toEqual([[0.5, 49], [50, 0], [50.5, 49]]);
        expect(donutArcs([1000, 1])[1][1]).toBeGreaterThan(0);
        expect(donutArcs([0, 0])).toEqual([[0, 0], [0, 0]]);
    });
});

describe('TaoDonut', () => {
    const segments = [
        { label: 'Mobile', value: 60 },
        { label: 'Desktop', value: 30 },
        { label: 'Errors', value: 10, tone: 'danger' as const },
    ];

    it('reads as one image: the label and every part with its share', () => {
        const w = mount(TaoDonut, { props: { segments, label: 'Traffic' } });
        expect(w.find('[role="img"]').attributes('aria-label')).toBe('Traffic: Mobile 60%, Desktop 30%, Errors 10%');
    });

    it('the parts take the series colours in order; a tone or a colour wins', () => {
        const arcs = w().findAll('.tao-donut__arc');
        expect(arcs[0].attributes('style')).toContain('var(--tao-color-chart-1)');
        expect(arcs[1].attributes('style')).toContain('var(--tao-color-chart-2)');
        expect(arcs[2].classes()).toContain('tao-tone-danger');
        function w() {
            return mount(TaoDonut, { props: { segments } });
        }
    });

    it('the legend lists the parts with their shares', () => {
        const w = mount(TaoDonut, { props: { segments, legend: true } });
        expect(w.findAll('.tao-donut__item').map((li) => li.text())).toEqual(['Mobile60%', 'Desktop30%', 'Errors10%']);
    });

    it('a single ring: value of max, the centre slot', () => {
        const w = mount(TaoDonut, { props: { value: 72, label: 'Score' }, slots: { default: '72' } });
        expect(w.find('[role="img"]').attributes('aria-label')).toBe('Score: 72 / 100');
        expect(w.find('.tao-donut__arc').attributes('stroke-dasharray')).toBe('72 28');
        expect(w.find('.tao-donut__centre').text()).toBe('72');
    });
});

describe('chart colours', () => {
    it('both themes define six series, the first is the accent, no red among them', () => {
        for (const css of [darkCss, lightCss]) {
            for (let i = 1; i <= 6; i++) {
                expect(css).toContain(`--tao-color-chart-${i}:`);
            }
            expect(css).toContain('--tao-color-chart-1: var(--tao-color-accent);');
            expect(css).not.toMatch(/--tao-color-chart-\d: var\(--tao-(color-danger|red-)/);
        }
    });

    it('a palette re-declares the series built on roles, with its second stop for chart-4', () => {
        expect(lagoonCss).toContain('--tao-color-chart-1: var(--tao-color-accent);');
        expect(lagoonCss).toContain('--tao-color-chart-4: var(--tao-color-accent-2);');
    });

    it('toRgb turns computed colours into what every chart library parses', () => {
        expect(toRgb('color(srgb 0.2 0.2 0.2 / 0.4)')).toBe('rgba(51, 51, 51, 0.4)');
        expect(toRgb('color(srgb 1 0.5 0)')).toBe('rgb(255, 128, 0)');
        expect(toRgb('rgb(10, 20, 30)')).toBe('rgb(10, 20, 30)');
        expect(toRgb('rgba(10, 20, 30, 0.5)')).toBe('rgba(10, 20, 30, 0.5)');
        expect(toRgb('#abcdef')).toBe('#abcdef');
    });

    it('taoChartTheme gives six colours and the neutral parts, and leaves no probe behind', () => {
        const theme = taoChartTheme(document.body);
        expect(theme.colors).toHaveLength(6);
        expect(Object.keys(theme)).toEqual(expect.arrayContaining(['text', 'textMuted', 'grid', 'axis', 'background', 'tooltip', 'fontFamily']));
        expect(document.body.querySelector('span[style*="display: none"]')).toBeNull();
    });
});

describe('the series colours of the two themes stand apart', () => {
    // resolves var() chains down to the hex the theme ends on / разворачивает цепочки var() до итогового hex
    function resolver(themeCss: string) {
        const vars = new Map<string, string>();
        for (const css of [primitivesCss as string, themeCss]) {
            for (const [, name, value] of css.matchAll(/(--tao-[\w-]+):\s*([^;]+);/g)) {
                vars.set(name, value.trim());
            }
        }
        const resolve = (value: string): string => {
            const ref = /^var\((--tao-[\w-]+)\)$/.exec(value);
            return ref ? resolve(vars.get(ref[1]) ?? '') : value;
        };
        return (name: string) => resolve(`var(${name})`);
    }

    it.each([
        ['dark', darkCss, '--tao-gray-900'],
        ['light', lightCss, '--tao-gray-0'],
    ])('%s: every pair at least as far apart as the accent and warning (0.11), each 3:1 on the page', (_, css, bg) => {
        const color = resolver(css as string);
        const series = [1, 2, 3, 4, 5, 6].map((i) => color(`--tao-color-chart-${i}`));
        series.forEach((hex) => expect(hex).toMatch(/^#[0-9a-f]{6}$/i));
        for (let i = 0; i < series.length; i++) {
            expect(contrastRatio(series[i], color(bg))).toBeGreaterThanOrEqual(3);
            for (let j = i + 1; j < series.length; j++) {
                expect(colourDistance(series[i], series[j]), `chart-${i + 1} / chart-${j + 1}`).toBeGreaterThanOrEqual(0.11);
            }
        }
    });
});
