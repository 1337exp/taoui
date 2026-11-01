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

/**
 * The sheet is let go when pulled this share of its height: half, so a touch that only grazes it does not close it.
 * Лист закрывается, если его утянули на эту долю высоты: на половину, чтобы случайное касание его не закрывало.
 */
export const SHEET_DISMISS_RATIO = 0.5;
/** …or a fling faster than this (px per ms) that went at least `SHEET_FLING_MIN_RATIO` of the height. / …или рывок быстрее этого, прошедший не меньше этой доли высоты. */
export const SHEET_FLING_SPEED = 1.2;
export const SHEET_FLING_MIN_RATIO = 0.15;

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

/**
 * Does the sheet close on release: pulled `threshold` of its height (half by default), or flung. A fling needs a path of its own
 * (15% of the height, or `threshold` if that is less), so a flick of a finger does not close a sheet.
 * Закрывается ли лист при отпускании: утянут на `threshold` высоты (по умолчанию на половину) или брошен. Рывку нужен свой путь
 * (15% высоты или `threshold`, если он меньше), поэтому щелчок пальцем лист не закрывает.
 */
export function shouldDismissSheet(offset: number, height: number, velocity: number, threshold = SHEET_DISMISS_RATIO): boolean {
    if (offset <= 0 || height <= 0) {
        return false;
    }
    const share = Number.isFinite(threshold) ? Math.min(Math.max(threshold, 0.05), 1) : SHEET_DISMISS_RATIO;
    return offset >= height * share || (velocity >= SHEET_FLING_SPEED && offset >= height * Math.min(share, SHEET_FLING_MIN_RATIO));
}
