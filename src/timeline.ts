import type { TaoTone } from './tone';

/**
 * One event of TaoTimeline: an order step, a release, a log line.
 * Одно событие TaoTimeline: шаг заказа, релиз, строка журнала.
 */
export interface TaoTimelineItem {
    id: string;
    title: string;
    /** The time to show: «12 May, 14:03», «2 hours ago». / Время для показа. */
    time?: string;
    /** The machine-readable time for `<time datetime>`: `2026-05-12T14:03`. / Время для машины. */
    datetime?: string;
    description?: string;
    /** Icon name for TaoIcon inside the marker. / Имя иконки для TaoIcon в маркере. */
    icon?: string;
    /** Colours the marker by status; without it the accent. / Красит маркер по статусу; без него — акцент. */
    tone?: TaoTone;
}

/** `start` — every event on one side, `alternate` — on both sides of the line. / По одну или по обе стороны линии. */
export type TaoTimelineAlign = 'start' | 'alternate';

/** Where an event stands against the current one. / Где событие относительно текущего. */
export type TaoTimelineState = 'done' | 'current' | 'upcoming';

/**
 * Done before the current event, upcoming after it; without a current one every event is done (a log of the past).
 * До текущего — done, после — upcoming; без текущего все done (журнал прошедшего).
 */
export function timelineState(index: number, activeIndex: number): TaoTimelineState {
    if (activeIndex < 0) {
        return 'done';
    }
    return index < activeIndex ? 'done' : index === activeIndex ? 'current' : 'upcoming';
}
