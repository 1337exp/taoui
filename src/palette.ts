import { linearToSrgb, parseColor, srgbToLinear, toHex } from './color';

// Palettes: four colours in, a complete set of colour roles out, for a dark and a light mode.
// Pure logic (no Vue, no DOM): the preset files in styles/palettes/ are generated from it by `npm run palettes`,
// a test keeps them equal, and `applyTaoPalette()` uses the same code for your own palette at run time.
// Палитры: на входе четыре цвета, на выходе полный набор цветовых ролей для тёмного и светлого режимов.
// Чистая логика: файлы пресетов в styles/palettes/ порождаются ею командой `npm run palettes`, тест следит за
// равенством, а `applyTaoPalette()` использует тот же код для вашей палитры в рантайме.

export type TaoPaletteMode = 'dark' | 'light';
export type TaoStatusName = 'danger' | 'warning' | 'success' | 'info';

export interface TaoPaletteDef {
    /** The value of `data-tao-theme`. / Значение `data-tao-theme`. */
    name: string;
    /** What a picker shows. / Что показывает выбор. */
    label: string;
    /** Four stops, from the darkest to the lightest. / Четыре стопа от тёмного к светлому. */
    stops: readonly [string, string, string, string];
    /** Which stop is the accent (0–3). By default it is picked by lightness. / Какой стоп акцентный; по умолчанию выбирается по яркости. */
    accent?: 0 | 1 | 2 | 3;
    /** Your own colour (dark mode fill) for a status, when the automatic one does not suit. / Свой цвет статуса, если автоматический не подошёл. */
    status?: Partial<Record<TaoStatusName, string>>;
}

export interface Oklch {
    /** Lightness 0…1. */
    L: number;
    /** Chroma, 0 grey … ~0.37. */
    C: number;
    /** Hue in degrees. */
    H: number;
}

// ------------------------------------------------------------------ colour maths (OKLab, Björn Ottosson)

const WHITE = '#ffffff';
const BLACK = '#0d0d0d';

const toLinear = (hex: string) => {
    const c = parseColor(hex);
    if (!c) {
        throw new Error(`[TaoUI] palette: "${hex}" is not a colour`);
    }
    return [srgbToLinear(c.r / 255), srgbToLinear(c.g / 255), srgbToLinear(c.b / 255)] as const;
};

export function hexToOklch(hex: string): Oklch {
    const [r, g, b] = toLinear(hex);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { L, C: Math.hypot(a, bb), H: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
}

function oklchToLinear({ L, C, H }: Oklch): [number, number, number] {
    const a = C * Math.cos((H * Math.PI) / 180);
    const b = C * Math.sin((H * Math.PI) / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);

/** The colour as `#rrggbb`; a chroma that does not fit sRGB is reduced, the hue and lightness stay. / Цвет в hex; не влезающая в sRGB насыщенность уменьшается. */
export function oklchToHex(color: Oklch): string {
    let { C } = color;
    let rgb = oklchToLinear({ ...color, C });
    if (!inGamut(rgb)) {
        let lo = 0;
        let hi = C;
        for (let i = 0; i < 24; i += 1) {
            const mid = (lo + hi) / 2;
            if (inGamut(oklchToLinear({ ...color, C: mid }))) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        C = lo;
        rgb = oklchToLinear({ ...color, C });
    }
    const [r, g, b] = rgb.map((v) => linearToSrgb(Math.min(Math.max(v, 0), 1)) * 255);
    return toHex({ r: r!, g: g!, b: b!, a: 1 });
}

export function luminance(hex: string): number {
    const [r, g, b] = toLinear(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1…21. */
export function contrastRatio(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
}

/** Distance of two colours in OKLab: about 0.02 is "just different", 0.1 is "clearly another colour". / Расстояние в OKLab: ~0.02 едва различимы, 0.1 — явно другой цвет. */
export function colourDistance(a: string, b: string): number {
    const p = hexToOklch(a);
    const q = hexToOklch(b);
    const pa = p.C * Math.cos((p.H * Math.PI) / 180);
    const pb = p.C * Math.sin((p.H * Math.PI) / 180);
    const qa = q.C * Math.cos((q.H * Math.PI) / 180);
    const qb = q.C * Math.sin((q.H * Math.PI) / 180);
    return Math.hypot(p.L - q.L, pa - qa, pb - qb);
}

const withL = (hex: string, L: number) => oklchToHex({ ...hexToOklch(hex), L: Math.min(Math.max(L, 0), 1) });

/** Moves the lightness step by step in `direction` until `ok(hex)`; stops at the ends. / Двигает яркость шагами, пока `ok`. */
function shiftUntil(hex: string, direction: 1 | -1, ok: (candidate: string) => boolean): string {
    const start = hexToOklch(hex);
    for (let i = 0; i <= 100; i += 1) {
        const candidate = oklchToHex({ ...start, L: Math.min(Math.max(start.L + direction * i * 0.005, 0), 1) });
        if (ok(candidate)) {
            return candidate;
        }
    }
    return withL(hex, direction === 1 ? 1 : 0);
}

/**
 * APCA lightness contrast (Lc, 0.0.98G): how well a text reads on a background, as the eye sees it. Positive for dark
 * text on a light background, negative the other way; |Lc| 75 is body text, 60 a label, 45 a large heading.
 * WCAG 2 contrast overrates black on mid-tone colours (a teal button gets black text it reads worse with); APCA does not.
 * Контраст APCA: как текст читается на фоне глазом. WCAG 2 переоценивает чёрный на средних по яркости цветах.
 */
export function apcaContrast(text: string, background: string): number {
    const y = (hex: string) => {
        const c = parseColor(hex);
        if (!c) {
            throw new Error(`[TaoUI] palette: "${hex}" is not a colour`);
        }
        const v = 0.2126729 * (c.r / 255) ** 2.4 + 0.7151522 * (c.g / 255) ** 2.4 + 0.072175 * (c.b / 255) ** 2.4;
        return v < 0.022 ? v + (0.022 - v) ** 1.414 : v;
    };
    const t = y(text);
    const b = y(background);
    const sapc = b > t ? (b ** 0.56 - t ** 0.57) * 1.14 : (b ** 0.65 - t ** 0.62) * 1.14;
    if (Math.abs(sapc) < 0.1) {
        return 0;
    }
    return (sapc > 0 ? sapc - 0.027 : sapc + 0.027) * 100;
}

/**
 * The text colour for a fill. In light mode the fills are mid-tones, where WCAG 2 overrates black: the polarity is the
 * one the eye reads better (APCA), so a teal button gets a white label on a slightly deeper teal. In dark mode the fills
 * are light on purpose (seen on a dark page) and keep the dark label of the default dark theme. Either way the 4.5:1 of
 * WCAG 2 is enforced afterwards by moving the fill.
 * Цвет текста на заливке. В светлом режиме заливки средней яркости, где WCAG 2 переоценивает чёрный: полярность — та,
 * что глаз читает лучше (APCA). В тёмном заливки светлые нарочно и сохраняют тёмный текст тёмной темы. 4.5:1 потом
 * обеспечивается сдвигом заливки.
 */
const bestOn = (fill: string, dark: boolean) =>
    dark
        ? contrastRatio(fill, WHITE) >= contrastRatio(fill, BLACK)
            ? WHITE
            : BLACK
        : Math.abs(apcaContrast(WHITE, fill)) >= Math.abs(apcaContrast(BLACK, fill))
          ? WHITE
          : BLACK;

// ------------------------------------------------------------------ what a palette decides

/** The hue sectors in which a status stays recognisable (OKLCH degrees) and the colour it has in the default themes. / Сектора оттенка, в которых статус узнаваем, и его цвет в темах по умолчанию. */
const STATUS = {
    danger: { range: [8, 40], dark: '#dc3545', light: '#dc3545' },
    warning: { range: [78, 102], dark: '#d4a017', light: '#b8860b' },
    success: { range: [135, 168], dark: '#2ea85c', light: '#2ea85c' },
    info: { range: [232, 272], dark: '#6b9cff', light: '#4c82f7' },
} as const;

export const TAO_STATUS_NAMES = Object.keys(STATUS) as TaoStatusName[];

/** How far apart (colourDistance) a status fill and the accent fill must be to be told apart. / Насколько должны различаться заливка статуса и акцента. */
export const MIN_STATUS_DISTANCE = 0.09;

const circular = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

export interface PaletteRoles {
    mode: TaoPaletteMode;
    /** The role values this palette decides, by custom property name. / Роли, которые решает палитра, по имени переменной. */
    roles: Record<string, string>;
    /** The pieces a test (and a debugger) wants to look at. / То, на что смотрит тест. */
    parts: {
        bg: string;
        raised: string;
        accent: string;
        accentText: string;
        onAccent: string;
        accentStop: number;
        status: Record<TaoStatusName, { fill: string; on: string; text: string; distance: number }>;
    };
}

/** The soft glow behind a page: two radial gradients of the glow colour. / Мягкое свечение за страницей: два радиальных градиента цвета свечения. */
export const atmosphere = (dark: boolean) =>
    `radial-gradient(ellipse 70% 50% at 75% 0%, color-mix(in srgb, var(--tao-glow) ${dark ? 18 : 10}%, transparent), transparent 70%), radial-gradient(ellipse 60% 45% at 5% 100%, color-mix(in srgb, var(--tao-glow) ${dark ? 10 : 6}%, transparent), transparent 70%)`;

export function buildPaletteRoles(def: TaoPaletteDef, mode: TaoPaletteMode): PaletteRoles {
    const dark = mode === 'dark';
    const stops = def.stops.map((s) => hexToOklch(s));

    // the accent: the stop whose lightness suits the mode, unless the palette names one
    const target = dark ? 0.74 : 0.52;
    const chromatic = stops.map((s, i) => ({ s, i })).filter(({ s }) => s.C >= 0.07);
    const pool = chromatic.length ? chromatic : stops.map((s, i) => ({ s, i }));
    const picked =
        def.accent !== undefined
            ? { s: stops[def.accent]!, i: def.accent }
            : pool.reduce((best, c) => {
                  const d = Math.abs(c.s.L - target) - c.s.C * 0.15;
                  const bd = Math.abs(best.s.L - target) - best.s.C * 0.15;
                  return d < bd ? c : best;
              }, pool[0]!);
    const stopHex = def.stops[picked.i]!;

    // surfaces: a very dark (or very light) tint. The hue is the one of the darkest stop when that is a deep colour
    // (Ocean's navy, Pinheiro's green), otherwise the accent's, so a crimson highlight does not paint the page red
    const darkest = stops.reduce((best, s) => (s.L < best.L ? s : best), stops[0]!);
    const tintHue = darkest.L < 0.36 && darkest.C >= 0.03 ? darkest.H : picked.s.H;
    const tint = dark ? { C: 0.028, H: tintHue } : { C: 0.01, H: tintHue };
    const surface = (L: number) => oklchToHex({ L, ...tint });
    const bg = surface(dark ? 0.175 : 0.995);
    const raised = surface(dark ? 0.225 : 0.965);
    const hover = surface(dark ? 0.275 : 0.915);
    const ink = (c: string) => Math.min(contrastRatio(c, bg), contrastRatio(c, raised));

    // a fill that is seen on the surfaces (3:1) and carries a readable text (4.5:1): moved along lightness only
    let accent = dark
        ? shiftUntil(stopHex, 1, (c) => ink(c) >= 3.2)
        : shiftUntil(stopHex, -1, (c) => ink(c) >= 3.2);
    let onAccent = bestOn(accent, dark);
    if (contrastRatio(accent, onAccent) < 4.5) {
        // too mid-tone for any text: move away from the mid until the better text reaches 4.5
        const toward = onAccent === WHITE ? -1 : 1;
        accent = shiftUntil(accent, toward, (c) => contrastRatio(c, onAccent) >= 4.5);
    }
    // text-sized use of the accent (ghost / text buttons, links): 4.5:1 on the page and on a raised surface
    const accentText = dark
        ? shiftUntil(accent, 1, (c) => ink(c) >= 4.6)
        : shiftUntil(accent, -1, (c) => ink(c) >= 4.6);
    // hover and active move the way that increases the contrast of the text on the fill
    const away = onAccent === WHITE ? -1 : 1;
    const accentHover = shiftUntil(accent, away, (c) => hexToOklch(c).L * away >= hexToOklch(accent).L * away + 0.04);
    const accentActive = shiftUntil(accent, away, (c) => hexToOklch(c).L * away >= hexToOklch(accent).L * away + 0.08);
    const accentTextHover = shiftUntil(accentText, dark ? 1 : -1, (c) => Math.abs(hexToOklch(c).L - hexToOklch(accentText).L) >= 0.05);
    const accentOk = hexToOklch(accent);

    // the second accent: the next chromatic stop (the other way along lightness), fitted to be seen
    const others = chromatic.filter(({ i }) => i !== picked.i);
    const second = others.length
        ? others.reduce((best, c) => (Math.abs(c.s.L - picked.s.L) > Math.abs(best.s.L - picked.s.L) ? best : c), others[0]!)
        : picked;
    const accent2 = dark ? shiftUntil(def.stops[second.i]!, 1, (c) => ink(c) >= 3.2) : shiftUntil(def.stops[second.i]!, -1, (c) => ink(c) >= 3.2);

    // statuses bound to the palette: the hue stays in the status' sector (nudged towards the accent), the lightness and
    // the chroma are shared with the accent, and a status that would be mistaken for the accent is pushed away
    const status = {} as PaletteRoles['parts']['status'];
    const statusRoles: Record<string, string> = {};
    for (const name of TAO_STATUS_NAMES) {
        const info = STATUS[name];
        const base = hexToOklch(dark ? info.dark : info.light);
        const [lo, hi] = info.range;
        const clampHue = (h: number) => Math.min(Math.max(h, lo), hi);
        const towards = ((accentOk.H - base.H + 540) % 360) - 180;
        const own = def.status?.[name];
        const candidates: Oklch[] = [];
        if (own) {
            candidates.push(hexToOklch(own));
        } else {
            const L0 = base.L * 0.65 + accentOk.L * 0.35;
            const C0 = Math.min(Math.max((base.C + accentOk.C) / 2, 0.1), 0.2);
            const nudged = clampHue(base.H + Math.min(Math.max(towards * 0.25, -8), 8));
            const hues = [nudged, lo, hi, (lo + hi) / 2, lo + (hi - lo) * 0.25, lo + (hi - lo) * 0.75];
            for (const dL of [0, 0.07, -0.07, 0.13, -0.13, 0.19, -0.19]) {
                for (const h of hues) {
                    for (const k of [1, 1.25]) {
                        candidates.push({ L: L0 + dL, C: C0 * k, H: h });
                    }
                }
            }
        }
        // a candidate is first made seen on the page and readable as a fill, and only then measured against the accent:
        // the darkening for a white label can bring it close to the accent again
        // кандидат сначала делается видимым и читаемым, и только потом сравнивается с акцентом
        const fitted = (c: Oklch) => {
            let fill = oklchToHex({ ...c, L: Math.min(Math.max(c.L, 0.3), 0.9) });
            fill = shiftUntil(fill, dark ? 1 : -1, (x) => ink(x) >= 3.2);
            let on = bestOn(fill, dark);
            if (contrastRatio(fill, on) < 4.5) {
                fill = shiftUntil(fill, on === WHITE ? -1 : 1, (x) => contrastRatio(x, on) >= 4.5);
                on = bestOn(fill, dark);
            }
            return { fill, on, distance: colourDistance(fill, accent) };
        };
        let best: ReturnType<typeof fitted> | null = null;
        for (const c of candidates) {
            const next = fitted(c);
            if (!best || next.distance > best.distance + 0.005) {
                best = next;
            }
            if (!own && next.distance >= MIN_STATUS_DISTANCE + 0.02) {
                best = next;
                break;
            }
        }
        const { fill, on } = best!;
        const text = shiftUntil(fill, dark ? 1 : -1, (c) => ink(c) >= 4.6);
        const hoverStep = on === WHITE ? -1 : 1;
        const fillHover = shiftUntil(fill, hoverStep, (c) => Math.abs(hexToOklch(c).L - hexToOklch(fill).L) >= 0.04);
        status[name] = { fill, on, text, distance: colourDistance(fill, accent) };
        statusRoles[`--tao-color-${name}`] = fill;
        statusRoles[`--tao-color-${name}-hover`] = fillHover;
        statusRoles[`--tao-color-on-${name}`] = on;
        statusRoles[`--tao-color-${name}-text`] = text;
        statusRoles[`--tao-color-${name}-subtle`] = `color-mix(in srgb, var(--tao-color-${name}) ${dark ? 15 : name === 'warning' || name === 'info' ? 12 : 10}%, transparent)`;
    }

    const roles: Record<string, string> = {
        '--tao-color-accent': accent,
        '--tao-color-accent-hover': accentHover,
        '--tao-color-accent-active': accentActive,
        '--tao-color-accent-text': accentText,
        '--tao-color-accent-text-hover': accentTextHover,
        '--tao-color-on-accent': onAccent,
        '--tao-color-accent-2': accent2,
        '--tao-glow': accent,
        '--tao-gradient': `linear-gradient(90deg, ${def.stops.join(', ')})`,
        '--tao-color-bg': bg,
        '--tao-color-surface': bg,
        '--tao-color-surface-raised': raised,
        '--tao-color-surface-hover': hover,
        '--tao-color-link': dark ? accentText : 'var(--tao-color-text-strong)',
        '--tao-color-link-hover': accentTextHover,
        // what is built from the roles above: written out, because a value declared on an ancestor is already
        // resolved when a nested element changes the palette
        '--tao-color-accent-subtle': `color-mix(in srgb, var(--tao-color-accent) ${dark ? 8 : 10}%, transparent)`,
        '--tao-color-accent-subtle-hover': `color-mix(in srgb, var(--tao-color-accent) ${dark ? 14 : 16}%, transparent)`,
        '--tao-color-selection': 'var(--tao-color-accent)',
        '--tao-color-selection-text': 'var(--tao-color-on-accent)',
        '--tao-color-link-shadow': dark
            ? '0 0 1px color-mix(in srgb, var(--tao-color-accent) 10%, transparent), 0 0 6px color-mix(in srgb, var(--tao-color-accent) 60%, transparent)'
            : 'none',
        '--tao-glass-fill': dark
            ? 'color-mix(in srgb, var(--tao-color-surface-raised) 55%, transparent)'
            : 'color-mix(in srgb, var(--tao-color-surface) 60%, transparent)',
        '--tao-bg-atmosphere': atmosphere(dark),
        ...statusRoles,
    };
    // the status roles below are written as hover = a derived colour; the -text-hover mixes with the strong text
    for (const name of TAO_STATUS_NAMES) {
        roles[`--tao-color-${name}-text-hover`] = `color-mix(in srgb, var(--tao-color-${name}-text) 85%, var(--tao-color-text-strong))`;
    }
    return { mode, roles, parts: { bg, raised, accent, accentText, onAccent, accentStop: picked.i, status } };
}

/**
 * The CSS of a palette: `[data-tao-theme="name"]` is its dark mode, `[data-tao-theme="name"][data-tao-mode="light"]` the
 * light one. Only what the palette decides: the neutral roles come from the dark / light theme underneath.
 * CSS палитры: `[data-tao-theme="name"]` — тёмный режим, с `[data-tao-mode="light"]` — светлый. Только то, что решает
 * палитра: нейтральные роли приходят из тёмной / светлой темы под ней.
 */
export function paletteCss(def: TaoPaletteDef): string {
    const block = (mode: TaoPaletteMode) => {
        const { roles } = buildPaletteRoles(def, mode);
        const selector = mode === 'dark' ? `[data-tao-theme="${def.name}"]` : `[data-tao-theme="${def.name}"][data-tao-mode="light"]`;
        const lines = [
            `    color-scheme: ${mode};`,
            ...Object.entries(roles).map(([name, value]) => `    ${name}: ${value};`),
            `    --tao-glass-border: ${glassBorder(mode)};`,
        ];
        return `${selector} {\n${lines.join('\n')}\n}\n`;
    };
    const header = [
        '/**',
        ` * Tao UI palette: ${def.label} (${def.stops.join(' ')})`,
        ' * Generated by `npm run palettes` from src/palettes.ts: edit the stops there, not this file.',
        ' */',
    ].join('\n');
    return `${header}\n${block('dark')}\n${block('light')}`;
}

const glassBorder = (mode: TaoPaletteMode) => (mode === 'dark' ? 'rgb(255 255 255 / 0.08)' : 'rgb(0 0 0 / 0.08)');

/**
 * Puts a palette on an element (the page by default) at run time, for a palette of your own or a colour a user picked:
 * the same roles the preset files carry, as inline custom properties. Returns a function that takes them off.
 * Кладёт палитру на элемент (по умолчанию на страницу) в рантайме: те же роли, что в файлах пресетов, как inline-переменные.
 * Возвращает функцию, которая их снимает.
 */
export function applyTaoPalette(def: TaoPaletteDef, mode: TaoPaletteMode, el?: HTMLElement): () => void {
    const target = el ?? (typeof document === 'undefined' ? undefined : document.documentElement);
    if (!target) {
        return () => {};
    }
    const all = { ...buildPaletteRoles(def, mode).roles, '--tao-glass-border': glassBorder(mode) };
    for (const [name, value] of Object.entries(all)) {
        target.style.setProperty(name, value);
    }
    target.style.colorScheme = mode;
    return () => {
        for (const name of Object.keys(all)) {
            target.style.removeProperty(name);
        }
        target.style.colorScheme = '';
    };
}
