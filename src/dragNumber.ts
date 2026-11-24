// Pure logic of TaoDragNumber: a value you step with ± , type, or drag sideways. No Vue, no DOM, so tests cover it.
// Чистая логика TaoDragNumber: значение, которое меняют кнопками ±, вводом или протяжкой в сторону. Без Vue и DOM: проверяется тестами.
import { clamp, normalizeNumber, roundTo, type NumberLimits } from './primitives/number';

/** The pointer must travel this far (px) before a press becomes a drag; less is a click, which starts typing. / Столько px должен пройти указатель, чтобы нажатие стало протяжкой; меньше — клик, он начинает ввод. */
export const DRAG_NUMBER_THRESHOLD = 3;

/** Shift while dragging: the value runs this much slower. / Shift при протяжке: значение идёт во столько раз медленнее. */
export const DRAG_NUMBER_FINE = 0.1;

/** PageUp / PageDown move by this many steps. / PageUp / PageDown двигают на столько шагов. */
export const DRAG_NUMBER_PAGE = 10;

/** A held − / + waits this long (ms) before it starts to repeat, so a single click stays a single step. / Зажатая − / + ждёт столько (мс), прежде чем повторять, поэтому одиночный клик остаётся одним шагом. */
export const DRAG_NUMBER_REPEAT_DELAY = 400;

/**
 * The wait (ms) before the n-th repeat of a held button (n counts from 0): the first is the long pause, then the steps come
 * every 120 ms and speed up to every 40 ms.
 * Ожидание (мс) перед n-м повтором зажатой кнопки (n с нуля): первое — длинная пауза, дальше шаги идут раз в 120 мс и
 * ускоряются до раза в 40 мс.
 */
export function dragNumberRepeatDelay(count: number): number {
    if (count <= 0) {
        return DRAG_NUMBER_REPEAT_DELAY;
    }
    return Math.max(40, 120 - (count - 1) * 8);
}

/**
 * One pointer move of a drag. `raw` is the running value before rounding, so a slow drag adds up and is not eaten by the grain; it is
 * clamped at once, so dragging past a bound does not have to be undone on the way back.
 * Одно движение указателя при протяжке. `raw` — бегущее значение до округления: медленная протяжка копится и не съедается зерном;
 * оно сразу зажато границами, поэтому за границу не надо «возвращаться» обратно.
 */
export function dragNumberAdvance(
    raw: number,
    dx: number,
    options: { speed: number; fine?: boolean; min?: number; max?: number },
): number {
    const factor = options.fine ? DRAG_NUMBER_FINE : 1;
    return clamp(raw + dx * options.speed * factor, options.min, options.max);
}

/** The value a drag shows: the running value snapped to the step grid (Ctrl), or just normalised. / Значение, которое показывает протяжка: бегущее, по сетке шага (Ctrl) или просто приведённое. */
export function dragNumberResolve(raw: number, limits: NumberLimits, step: number, snap = false): number {
    const base = snap && step > 0 ? Math.round(raw / step) * step : raw;
    return normalizeNumber(base, limits);
}

/** The speed a drag has by default: a quarter of a step per pixel. / Скорость протяжки по умолчанию: четверть шага на пиксель. */
export function dragNumberSpeed(step: number, speed?: number): number {
    return speed !== undefined && speed > 0 ? speed : step / 4;
}

/** The text of a value: no trailing zeros (`5`, `0.5`), rounded to the precision. / Текст значения: без хвостовых нулей (`5`, `0.5`), округлено до точности. */
export function formatDragNumber(value: number, precision: number): string {
    return String(roundTo(value, precision));
}

/**
 * What the user typed, as a number; `null` if it is not one (the field then goes back to its value). A comma is a decimal point, the
 * minus sign may be the typographic one, and the unit of the field may follow the number (`5 m`, `5m`): another unit is a typo,
 * not a conversion, so it is refused.
 * Что набрал пользователь, числом; `null`, если это не число (поле тогда возвращается к значению). Запятая — десятичная точка,
 * минус может быть типографским, а за числом может идти единица поля (`5 m`, `5m`): чужая единица — опечатка, а не пересчёт, её не принимаем.
 */
export function parseDragNumber(text: string, unit = ''): number | null {
    const source = text.trim().replace(/[−‒–]/g, '-').replace(',', '.');
    const match = /^([-+]?(?:\d+\.?\d*|\.\d+))\s*(.*)$/.exec(source);
    if (!match) {
        return null;
    }
    const rest = match[2]!.trim();
    if (rest !== '' && rest.toLowerCase() !== unit.trim().toLowerCase()) {
        return null;
    }
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
}
