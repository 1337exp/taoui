import type { TaoSelectOption } from './select';

/**
 * An option of `TaoPresetInput`. The one with `default` is what the field means when it is empty («Auto», «None»):
 * it is shown first in the pop-up, and the arrows reach it after the last one.
 * Пункт `TaoPresetInput`. Пункт с `default` — то, что поле значит, когда оно пустое («Авто», «Нет»): он показан первым в
 * окне, а стрелки доходят до него после последнего.
 */
export interface TaoPresetOption extends TaoSelectOption {
    default?: boolean;
}

export type TaoPresetValue = string | number | null;

/**
 * The options in the order the arrows walk them: the ordinary ones as given, the default one at the end. Disabled
 * options are left out: an arrow does not stop on what cannot be picked.
 * Пункты в порядке, в котором по ним ходят стрелки: обычные как заданы, пункт по умолчанию в конце. Недоступные
 * пропускаются: стрелка не останавливается на том, что нельзя выбрать.
 */
export function presetLine(options: TaoPresetOption[]): TaoPresetOption[] {
    const usable = options.filter((option) => !option.disabled);
    return [...usable.filter((option) => !option.default), ...usable.filter((option) => option.default)];
}

/** The options in the order the pop-up shows them: the default one first. / Пункты в порядке окна: сначала пункт по умолчанию. */
export function presetList(options: TaoPresetOption[]): TaoPresetOption[] {
    return [...options.filter((option) => option.default), ...options.filter((option) => !option.default)];
}

/**
 * The value an arrow leads to. `direction` 1 is «up» (the next one on the line), -1 is «down» (the previous one).
 * The ends hold, unless `loop` joins them into a ring. A value that is not in the list (a number typed by hand) goes to
 * the nearest number on that side; past the last number «up» reaches the default option, and «down» below the first
 * stays (or, with `loop`, goes to the default option).
 * Значение, к которому ведёт стрелка. `direction` 1 — «вверх» (следующее на линии), -1 — «вниз» (предыдущее). Концы
 * держат, если `loop` не замкнул их в кольцо. Значение вне списка (число, набранное руками) идёт к ближайшему числу с
 * этой стороны; за последним числом «вверх» доходит до пункта по умолчанию, а «вниз» ниже первого стоит (с `loop` —
 * идёт к пункту по умолчанию).
 */
export function stepPreset(options: TaoPresetOption[], value: TaoPresetValue, direction: 1 | -1, loop = false): TaoPresetValue {
    const line = presetLine(options);
    if (!line.length) {
        return value;
    }

    const at = line.findIndex((option) => option.value === value);
    if (at >= 0) {
        const to = at + direction;
        const index = loop ? (to + line.length) % line.length : Math.min(Math.max(to, 0), line.length - 1);
        return line[index]!.value;
    }

    const fallback = line.find((option) => option.default);
    if (typeof value === 'number') {
        const numbers = line.filter((option) => typeof option.value === 'number') as Array<TaoPresetOption & { value: number }>;
        const near = direction > 0 ? numbers.find((option) => option.value > value) : [...numbers].reverse().find((option) => option.value < value);
        if (near) {
            return near.value;
        }
        return direction > 0 || loop ? (fallback?.value ?? value) : value;
    }

    // nothing is picked: up starts at the first, down at the last / ничего не выбрано: вверх начинает с первого, вниз — с последнего
    return (direction > 0 ? line[0] : line[line.length - 1])!.value;
}

export interface PresetParseOptions {
    /** Whether a number outside the list is a value. / Годится ли число вне списка. */
    custom?: boolean;
    min?: number;
    max?: number;
}

/**
 * The text of the field as a value: the label of an option (any case), or a whole number inside `min`…`max` when
 * `custom` is on; an empty text is the default option. `undefined` means «not a value», and the field goes back.
 * Текст поля как значение: подпись пункта (в любом регистре) либо целое число в пределах `min`…`max`, если включён
 * `custom`; пустой текст — пункт по умолчанию. `undefined` — «не значение», поле возвращается назад.
 */
export function parsePreset(text: string, options: TaoPresetOption[], { custom = true, min = 1, max = 999 }: PresetParseOptions = {}): TaoPresetValue | undefined {
    const raw = text.trim();
    const fallback = options.find((option) => option.default && !option.disabled);
    if (raw === '') {
        return fallback?.value;
    }

    const lower = raw.toLowerCase();
    const named = options.find((option) => !option.disabled && (option.label.toLowerCase() === lower || String(option.value).toLowerCase() === lower));
    if (named) {
        return named.value;
    }

    if (!custom || !/^\d+([.,]\d+)?$/.test(raw)) {
        return undefined;
    }
    const number = Math.round(Number(raw.replace(',', '.')));
    return number >= min && number <= max ? number : undefined;
}
