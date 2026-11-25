import { clamp } from './primitives/number';

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

    return clamp(slide * pitch, 0, Math.max(max, 0));
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
        ? clamp((3 * Math.abs(distance)) / Math.abs(velocity), 220, 900)
        : Math.min(200 + Math.abs(distance) * 1.2, 450);
}

/**
 * How many sets of the slides a cycle draws: one without a cycle, otherwise an odd number, so that on each side of the real set there
 * are enough slides to fill the frame and a drag. A cycle exists only for `centered` + `loop` and two slides or more.
 * Сколько наборов слайдов рисует цикл: один без цикла, иначе нечётное число, чтобы по обе стороны настоящего набора хватало слайдов
 * на кадр и протяжку. Цикл есть только у `centered` + `loop` и от двух слайдов.
 */
export function wantedCopies(real: number, view: number, centered: boolean, loop: boolean): number {
    if (!centered || !loop || real < 2) {
        return 1;
    }
    return 2 * Math.ceil((view + 1) / real) + 1;
}

export interface NearestSlideInput {
    /** scrollLeft of the strip. / scrollLeft ленты. */
    left: number;
    /** Slide width + gap. / Ширина слайда + зазор. */
    pitch: number;
    /** The real slides. / Настоящие слайды. */
    total: number;
    /** How many slides one step moves (and how many stand in a view without `centered`). / На сколько слайдов шаг. */
    step: number;
    /** The strip is a cycle: the slot is counted round. / Лента цикл: номер берётся по кругу. */
    cyclic: boolean;
}

/** The real slide the strip stands on: round in a cycle, otherwise kept to the last place a view can start at. / Настоящий слайд, на котором стоит лента. */
export function nearestSlide({ left, pitch, total, step, cyclic }: NearestSlideInput): number {
    if (pitch <= 0 || total <= 0) {
        return 0;
    }
    const slot = Math.round(left / pitch);
    if (cyclic) {
        return ((slot % total) + total) % total;
    }
    return clamp(slot, 0, Math.max(total - step, 0));
}

/**
 * Which copy of slide `home` a move in a cycle goes to. Instant (the start, a new width): the real set, `base + home`. Smooth: the
 * copy nearest to where the strip is now (`at`, in slides), so forward from the last slide is the first one with no rewind.
 * В какую копию слайда `home` идёт ход в цикле. Мгновенный (старт, новая ширина): в настоящий набор. Плавный: в ближайшую копию
 * к текущему месту ленты (`at`, в слайдах), так что вперёд от последнего слайда идёт первый, без перемотки.
 */
export function cycleTarget(at: number, home: number, base: number, total: number, copies: number, instant: boolean): number {
    let target = base + home;
    for (let copy = home; !instant && copy < total * copies; copy += total) {
        if (Math.abs(copy - at) < Math.abs(target - at)) {
            target = copy;
        }
    }
    return target;
}

/** How far a slide stands from the middle one in `centered` (0 … 2 slides); the CSS turns it into a scale and a fade. / Как далеко слайд от среднего (0 … 2). */
export function centerDistance(slide: number, at: number): number {
    return Math.min(Math.abs(slide - at), 2);
}
