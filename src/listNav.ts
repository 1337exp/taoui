import { type Ref } from 'vue';

/** Index of the next enabled item from `from` in `delta` direction; -1 when nothing is enabled. / Индекс следующего доступного пункта. */
export function stepEnabled(enabled: readonly boolean[], from: number, delta: 1 | -1, loop = true): number {
    const count = enabled.length;
    if (!enabled.some(Boolean)) {
        return -1;
    }
    let index = from;
    for (let i = 0; i < count; i += 1) {
        index += delta;
        if (index < 0 || index >= count) {
            if (!loop) {
                return from;
            }
            index = (index + count) % count;
        }
        if (enabled[index]) {
            return index;
        }
    }
    return from;
}

export const firstEnabled = (enabled: readonly boolean[]) => enabled.findIndex(Boolean);
export const lastEnabled = (enabled: readonly boolean[]) => enabled.lastIndexOf(true);

/** The next item whose label starts with `text`, searching after `from` and wrapping round. / Следующий пункт, чья подпись начинается с `text`. */
export function findByPrefix(labels: readonly string[], enabled: readonly boolean[], text: string, from: number): number {
    const needle = text.toLocaleLowerCase();
    for (let i = 1; i <= labels.length; i += 1) {
        const index = (from + i + labels.length) % labels.length;
        if (enabled[index] && labels[index]!.toLocaleLowerCase().startsWith(needle)) {
            return index;
        }
    }
    return -1;
}

export interface UseListNavOptions {
    /** Which items can be reached. / Какие пункты доступны. */
    enabled: () => readonly boolean[];
    /** The active index (-1 = none); the composable moves it. / Активный индекс; composable двигает его. */
    active: Ref<number>;
    /** Item texts: turns on type-ahead (a printable key jumps to a matching item). / Подписи: включают быстрый поиск по набору. */
    labels?: () => readonly string[];
    /** `vertical` listens to ArrowUp / ArrowDown, `horizontal` to ArrowLeft / ArrowRight. */
    orientation?: 'vertical' | 'horizontal';
    loop?: boolean;
    /** Called after the active index changed by a key. / После смены активного индекса клавишей. */
    onMove?: (index: number) => void;
}

/**
 * Keyboard navigation of a list: arrows, Home / End, type-ahead. Disabled items are skipped.
 * `onKeydown` returns true when it handled the key (and has already called preventDefault).
 * Клавиатурная навигация списка: стрелки, Home / End, быстрый поиск. Недоступные пропускаются.
 */
export function useListNav(options: UseListNavOptions) {
    const { active, orientation = 'vertical', loop = true } = options;
    let buffer = '';
    let timer: ReturnType<typeof setTimeout> | undefined;

    function move(index: number) {
        if (index >= 0) {
            active.value = index;
            options.onMove?.(index);
        }
    }

    function onKeydown(event: KeyboardEvent): boolean {
        const enabled = options.enabled();
        const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
        const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

        if (event.key === next || event.key === prev) {
            event.preventDefault();
            move(stepEnabled(enabled, active.value, event.key === next ? 1 : -1, loop));
            return true;
        }
        if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            move(event.key === 'Home' ? firstEnabled(enabled) : lastEnabled(enabled));
            return true;
        }

        const labels = options.labels?.();
        const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
        // a space with an empty buffer is "activate", not a letter
        if (labels && printable && (event.key !== ' ' || buffer)) {
            event.preventDefault();
            buffer += event.key;
            clearTimeout(timer);
            timer = setTimeout(() => {
                buffer = '';
            }, 600);
            // the same letter pressed again cycles through the items that start with it
            const cycle = buffer.length > 1 && [...buffer].every((ch) => ch === buffer[0]);
            const text = cycle ? buffer[0]! : buffer;
            // a growing word searches from the current item (it may already match); one letter moves on
            const from = text.length > 1 ? active.value - 1 : active.value;
            move(findByPrefix(labels, enabled, text, from));
            return true;
        }
        return false;
    }

    return { onKeydown };
}
