import { describe, expect, it } from 'vitest';
import * as lib from '../src/index';
import {
    apcaContrast,
    applyTaoPalette,
    buildPaletteRoles,
    colourDistance,
    contrastRatio,
    hexToOklch,
    MIN_STATUS_DISTANCE,
    oklchToHex,
    paletteCss,
    TAO_STATUS_NAMES,
    type TaoPaletteMode,
} from '../src/palette';
import { taoPalettes } from '../src/palettes';
// @ts-expect-error Vite `?raw` imports: the stylesheets as text
import darkCss from '../src/styles/themes/dark.css?raw';
// @ts-expect-error Vite `?raw` import
import lightCss from '../src/styles/themes/light.css?raw';
// @ts-expect-error Vite `?raw` import
import surfaceCss from '../src/styles/contexts/surface.css?raw';

// Palettes: four colours in, a complete set of roles out. What the presets promise is held here, in numbers.
// Палитры: четыре цвета на входе, полный набор ролей на выходе. Обещания пресетов держатся здесь, в числах.

const files = (import.meta as unknown as { glob: (p: string, o: object) => unknown }).glob('../src/styles/palettes/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const modes: TaoPaletteMode[] = ['dark', 'light'];

const declared = (css: string) => new Set([...css.matchAll(/(--tao-[a-z0-9-]+)\s*:/g)].map((m) => m[1]!));
// a palette may set what the themes set and the glass tokens of the surface context
const dark = new Set([...declared(darkCss), ...declared(surfaceCss)]);
const light = new Set([...declared(lightCss), ...declared(surfaceCss)]);

describe('colour maths', () => {
    it('hex → OKLCH → hex keeps the colour', () => {
        for (const hex of ['#ea6113', '#0277b6', '#fbb931', '#503d5f', '#ffffff', '#0d0d0d']) {
            const back = oklchToHex(hexToOklch(hex));
            expect(colourDistance(hex, back)).toBeLessThan(0.004);
        }
    });

    it('contrast: white on black is 21, a colour on itself is 1', () => {
        expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
        expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
    });

    it('a chroma outside sRGB is reduced, not clipped into another hue', () => {
        const out = hexToOklch(oklchToHex({ L: 0.6, C: 0.37, H: 150 }));
        expect(out.C).toBeLessThan(0.37);
        expect(Math.abs(out.H - 150)).toBeLessThan(6);
    });

    it('colour distance: nothing for equals, big for red against green', () => {
        expect(colourDistance('#ff0000', '#ff0000')).toBe(0);
        expect(colourDistance('#ff0000', '#00aa00')).toBeGreaterThan(0.2);
    });
});

describe('the preset list', () => {
    it('has unique kebab-case names, four stops each, and a file for each', () => {
        const names = taoPalettes.map((p) => p.name);
        expect(new Set(names).size).toBe(names.length);
        for (const p of taoPalettes) {
            expect(p.name).toMatch(/^[a-z]+(-[a-z]+)*$/);
            expect(p.stops).toHaveLength(4);
            p.stops.forEach((s) => expect(s).toMatch(/^#[0-9a-fA-F]{6}$/));
            expect(files[`../src/styles/palettes/${p.name}.css`], p.name).toBeDefined();
        }
    });

    it('is exported from the entry', () => {
        expect(lib.taoPalettes).toBe(taoPalettes);
        expect(typeof lib.applyTaoPalette).toBe('function');
        expect(typeof lib.taoPaletteCss).toBe('function');
        expect(lib.contrastRatio).toBe(contrastRatio);
        expect(lib.apcaContrast).toBe(apcaContrast);
    });
});

describe.each(taoPalettes.flatMap((p) => modes.map((m) => [p.name, m, p] as const)))('%s, %s', (_name, mode, def) => {
    const built = buildPaletteRoles(def, mode);
    const { bg, raised, accent, accentText, onAccent, status } = built.parts;
    const seen = (c: string) => Math.min(contrastRatio(c, bg), contrastRatio(c, raised));

    it('the surfaces are very dark (dark) or very light (light), tinted by the palette', () => {
        const L = hexToOklch(bg).L;
        expect(mode === 'dark' ? L < 0.25 : L > 0.95).toBe(true);
        expect(hexToOklch(raised).L).not.toBe(L);
    });

    it('the accent is seen on the page (3:1), carries a readable text (4.5:1), and reads as text itself (4.5:1)', () => {
        expect(seen(accent)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(accent, onAccent)).toBeGreaterThanOrEqual(4.5);
        expect(seen(accentText)).toBeGreaterThanOrEqual(4.5);
    });

    it.each(TAO_STATUS_NAMES)('%s is seen, readable as a fill and as text, and not mistaken for the accent', (name) => {
        const s = status[name];
        expect(seen(s.fill)).toBeGreaterThanOrEqual(3);
        expect(contrastRatio(s.fill, s.on)).toBeGreaterThanOrEqual(4.5);
        expect(seen(s.text)).toBeGreaterThanOrEqual(4.5);
        expect(s.distance).toBeGreaterThanOrEqual(MIN_STATUS_DISTANCE);
    });

    it('the statuses stay recognisable: the hue is inside the status sector', () => {
        const hue = (n: (typeof TAO_STATUS_NAMES)[number]) => hexToOklch(status[n].fill).H;
        expect(hue('danger')).toBeGreaterThan(0);
        expect(Math.min(hue('danger'), 360 - hue('danger'))).toBeLessThan(45);
        expect(hue('warning')).toBeGreaterThan(70);
        expect(hue('warning')).toBeLessThan(108);
        expect(hue('success')).toBeGreaterThan(120);
        expect(hue('success')).toBeLessThan(172);
        expect(hue('info')).toBeGreaterThan(225);
        expect(hue('info')).toBeLessThan(285);
    });

    it('sets only roles that the default themes define, so a palette cannot invent one', () => {
        const base = mode === 'dark' ? dark : light;
        const unknown = Object.keys(built.roles).filter((name) => !base.has(name));
        expect(unknown).toEqual([]);
    });

    it('every colour is a hex or a formula over other roles', () => {
        for (const [name, value] of Object.entries(built.roles)) {
            expect(value, name).toMatch(/^(#[0-9a-f]{6}|var\(.+\)|color-mix\(.+\)|linear-gradient\(.+\)|radial-gradient\(.+|0 0 1px.+|none)$/i);
        }
    });
});

describe('what every palette sets', () => {
    it('is the same set of roles for every palette and mode', () => {
        const sets = taoPalettes.flatMap((p) => modes.map((m) => Object.keys(buildPaletteRoles(p, m).roles).sort().join(',')));
        expect(new Set(sets).size).toBe(1);
    });

    it('covers the accent family, the surfaces, the statuses, the glow and the gradient', () => {
        const keys = Object.keys(buildPaletteRoles(taoPalettes[0]!, 'dark').roles);
        for (const needed of [
            '--tao-color-accent', '--tao-color-on-accent', '--tao-color-accent-text', '--tao-color-accent-2', '--tao-glow', '--tao-gradient',
            '--tao-bg-atmosphere', '--tao-color-bg', '--tao-color-surface-raised', '--tao-color-danger', '--tao-color-on-info', '--tao-color-warning-text',
        ]) {
            expect(keys).toContain(needed);
        }
    });

    it('the roles that depend on the accent are written out, so a nested palette is not left with a stale value', () => {
        const keys = Object.keys(buildPaletteRoles(taoPalettes[0]!, 'dark').roles);
        for (const dependent of ['--tao-color-accent-subtle', '--tao-color-selection', '--tao-color-link-shadow', '--tao-glass-fill', '--tao-color-danger-subtle']) {
            expect(keys).toContain(dependent);
        }
    });
});

describe('the pinned files', () => {
    it.each(taoPalettes.map((p) => [p.name, p] as const))('%s.css is exactly what the generator writes (run `npm run palettes`)', (name, def) => {
        // git may check the files out with CRLF on Windows: the content is what is pinned, not the line ending
        expect(files[`../src/styles/palettes/${name}.css`]!.split('\r\n').join('\n')).toBe(paletteCss(def));
    });

    it('index.css imports every palette', () => {
        const index = files['../src/styles/palettes/index.css']!;
        for (const p of taoPalettes) {
            expect(index).toContain(`@import "./${p.name}.css";`);
        }
    });

    it('dark and light blocks use the selectors the docs promise', () => {
        const css = paletteCss(taoPalettes[0]!);
        expect(css).toContain('[data-tao-theme="sunset"] {');
        expect(css).toContain('[data-tao-theme="sunset"][data-tao-mode="light"] {');
    });
});

describe('the automatic choice', () => {
    it('takes the accent by lightness: Sunset dark is the orange, Ocean dark the cyan', () => {
        expect(buildPaletteRoles(taoPalettes.find((p) => p.name === 'sunset')!, 'dark').parts.accentStop).toBe(1);
        expect(buildPaletteRoles(taoPalettes.find((p) => p.name === 'ocean-blue')!, 'dark').parts.accentStop).toBe(2);
    });

    it('a palette can name its accent stop (Lagoon is teal in both modes)', () => {
        const lagoon = taoPalettes.find((p) => p.name === 'lagoon')!;
        expect(lagoon.accent).toBe(1);
        for (const mode of modes) {
            expect(buildPaletteRoles(lagoon, mode).parts.accentStop).toBe(1);
        }
    });

    it('a palette can name a status colour, and it is used', () => {
        const pinheiro = taoPalettes.find((p) => p.name === 'pinheiro')!;
        expect(pinheiro.status?.success).toBeDefined();
        expect(colourDistance(buildPaletteRoles(pinheiro, 'dark').parts.status.success.fill, pinheiro.status!.success!)).toBeLessThan(0.04);
    });

    it('a deep darkest stop tints the page with its hue, a bright one leaves it to the accent', () => {
        const navy = hexToOklch(buildPaletteRoles(taoPalettes.find((p) => p.name === 'lagoon')!, 'dark').parts.bg);
        expect(navy.H).toBeGreaterThan(200);
        expect(navy.H).toBeLessThan(260);
        const warm = hexToOklch(buildPaletteRoles(taoPalettes.find((p) => p.name === 'sunset')!, 'dark').parts.bg);
        expect(warm.H).toBeLessThan(90);
    });
});

describe('applyTaoPalette', () => {
    it('puts the roles on an element as inline variables and takes them off again', () => {
        const el = document.createElement('div');
        const stop = applyTaoPalette(taoPalettes[0]!, 'dark', el);
        expect(el.style.getPropertyValue('--tao-color-accent')).toBe(buildPaletteRoles(taoPalettes[0]!, 'dark').roles['--tao-color-accent']);
        expect(el.style.getPropertyValue('--tao-glass-border')).toContain('255');
        expect(el.style.colorScheme).toBe('dark');
        stop();
        expect(el.style.getPropertyValue('--tao-color-accent')).toBe('');
        expect(el.style.colorScheme).toBe('');
    });

    it('works for a palette of your own, in light mode', () => {
        const el = document.createElement('div');
        applyTaoPalette({ name: 'mine', label: 'Mine', stops: ['#102030', '#306090', '#60c0f0', '#e0f4ff'] }, 'light', el);
        expect(el.style.getPropertyValue('--tao-color-bg')).toMatch(/^#f/);
        expect(el.style.colorScheme).toBe('light');
    });
});

describe('the label on a fill', () => {
    it('APCA: positive for dark on light, negative for light on dark, about 106 / -108 at the extremes', () => {
        expect(apcaContrast('#000000', '#ffffff')).toBeGreaterThan(100);
        expect(apcaContrast('#ffffff', '#000000')).toBeLessThan(-100);
        expect(apcaContrast('#777777', '#777777')).toBe(0);
    });

    it('on a mid-tone green WCAG 2 picks black, the eye (APCA) reads white better', () => {
        const green = '#2ea85c';
        expect(contrastRatio(green, '#0d0d0d')).toBeGreaterThan(contrastRatio(green, '#ffffff'));
        expect(Math.abs(apcaContrast('#ffffff', green))).toBeGreaterThan(Math.abs(apcaContrast('#0d0d0d', green)));
    });

    it('light mode: every palette puts a white label on its accent and its statuses, still at 4.5:1', () => {
        for (const p of taoPalettes) {
            const { accent, onAccent, status } = buildPaletteRoles(p, 'light').parts;
            expect(onAccent, p.name).toBe('#ffffff');
            expect(contrastRatio(accent, onAccent), p.name).toBeGreaterThanOrEqual(4.5);
            for (const name of TAO_STATUS_NAMES) {
                expect(status[name].on, `${p.name} ${name}`).toBe('#ffffff');
            }
        }
    });

    it('dark mode keeps light accents with a dark label where the palette has one (Pinheiro, Lagoon)', () => {
        for (const name of ['pinheiro', 'lagoon', 'ocean-blue']) {
            expect(buildPaletteRoles(taoPalettes.find((p) => p.name === name)!, 'dark').parts.onAccent, name).toBe('#0d0d0d');
        }
    });
});

