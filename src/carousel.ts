/** How long momentum keeps going, ms (close to iOS). / Сколько длится инерция, мс (близко к iOS). */
export const GLIDE_TIME = 325;
/** Release speed above which a flick always moves at least one slide, px/ms. / Скорость, с которой щелчок всегда сдвигает хотя бы на слайд. */
export const FLICK_SPEED = 0.3;

/**
 * Where momentum stops, rounded to a whole slide and kept inside the track.
 * `from` — scrollLeft at release, `velocity` — scroll speed px/ms, `pitch` — slide width + gap, `max` — the last scrollLeft.
 *
 * Где остановит инерция: с точностью до целого слайда и в пределах ленты.
 */
export function glideTarget(from: number, velocity: number, pitch: number, max: number): number {
    if (pitch <= 0) {
        return from;
    }

    let slide = Math.round((from + velocity * GLIDE_TIME) / pitch);
    if (velocity > FLICK_SPEED) {
        slide = Math.max(slide, Math.floor(from / pitch) + 1);
    } else if (velocity < -FLICK_SPEED) {
        slide = Math.min(slide, Math.ceil(from / pitch) - 1);
    }

    return Math.min(Math.max(slide * pitch, 0), Math.max(max, 0));
}

/**
 * Glide length, ms. Thrown: ease-out cubic starts at 3·distance/duration, so the duration keeps the release speed.
 * From rest (settle): short and calm.
 *
 * Длительность доводки, мс. После броска — сохраняет скорость отпускания; с места — короткая и спокойная.
 */
export function glideDuration(distance: number, velocity: number): number {
    const sameDirection = Math.abs(velocity) > 0.05 && Math.sign(velocity) === Math.sign(distance);
    return sameDirection
        ? Math.min(Math.max((3 * Math.abs(distance)) / Math.abs(velocity), 220), 900)
        : Math.min(200 + Math.abs(distance) * 1.2, 450);
}
