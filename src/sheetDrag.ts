/**
 * The pull-down of a bottom sheet (TaoDrawer `side="bottom"`): how far it follows the finger and when it lets go.
 * Pure, so it is tested without a DOM.
 * Жест «потянуть лист вниз»: как далеко лист идёт за пальцем и когда закрывается. Чистая логика, без DOM.
 */

/** A pointer position at a time. / Положение указателя в момент времени. */
export interface SheetSample {
    /** ms */
    t: number;
    /** px, screen */
    y: number;
}

/** The sheet is let go when pulled this share of its height. / Лист закрывается, если его утянули на эту долю высоты. */
export const SHEET_DISMISS_RATIO = 0.3;
/** …or a fling faster than this (px per ms) that went at least `SHEET_FLING_MIN` px. / …или рывок быстрее этого, прошедший не меньше `SHEET_FLING_MIN` px. */
export const SHEET_FLING_SPEED = 0.5;
export const SHEET_FLING_MIN = 24;

/** How far the sheet is moved for a finger that went `delta` px down: it does not go above its place. / Насколько сдвинут лист: выше своего места он не идёт. */
export function sheetOffset(delta: number): number {
    return Math.max(0, delta);
}

/** Speed down (px per ms) over the last `windowMs` of the samples; negative when the finger went up. / Скорость вниз за последние `windowMs`; отрицательная, если палец шёл вверх. */
export function releaseVelocity(samples: readonly SheetSample[], windowMs = 100): number {
    const last = samples[samples.length - 1];
    if (!last) {
        return 0;
    }
    const first = samples.find((sample) => last.t - sample.t <= windowMs) ?? last;
    const dt = last.t - first.t;
    return dt > 0 ? (last.y - first.y) / dt : 0;
}

/** Does the sheet close on release: pulled far enough, or flung. / Закрывается ли лист при отпускании: утянут далеко или брошен. */
export function shouldDismissSheet(offset: number, height: number, velocity: number): boolean {
    if (offset <= 0 || height <= 0) {
        return false;
    }
    return offset >= height * SHEET_DISMISS_RATIO || (velocity >= SHEET_FLING_SPEED && offset >= SHEET_FLING_MIN);
}
