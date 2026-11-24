// One pointer gesture: press, move, release. The press takes the pointer (capture), a pointer that is not ours is ignored, and the gesture
// ENDS BY ITSELF when its `pointerup` never comes (Alt-Tab, a screenshot, a system dialog: the window loses the focus; or the capture is
// taken away). A slider, a split, a colour square, a number you drag and a carousel each had a copy of this, and every copy forgot
// one of the endings once (CONTRIBUTING, rule 6). What a lost gesture MEANS (commit, cancel) stays with the caller: it reads `reason`.
// Один жест указателя: нажать, вести, отпустить. Нажатие берёт указатель (захват), чужой указатель игнорируется, а жест САМ
// ЗАКАНЧИВАЕТСЯ, когда его `pointerup` не пришёл (Alt-Tab, скриншот, системный диалог: окно теряет фокус; или захват отобрали).
// У слайдера, сплита, цветового квадрата, протягиваемого числа и карусели было по копии этого, и каждая копия когда-то забывала
// один из концов (CONTRIBUTING, правило 6). Что значит потерянный жест (зафиксировать, отменить) решает вызывающий: он читает `reason`.
import { onBeforeUnmount, ref, type Ref } from 'vue';
import { listenFocusLoss } from '../focusLoss';

/** Why the gesture ended: released, cancelled by the browser, lost (focus or capture), the component went away, or the caller ended it. / Почему жест кончился: отпустили, отменил браузер, потерян (фокус или захват), компонент исчез или его закончил вызывающий. */
export type PointerDragEnd = 'up' | 'cancel' | 'lost' | 'unmount' | 'abort';

export interface UsePointerDragOptions {
    /** The element that holds the pointer while the gesture lasts. / Элемент, который держит указатель, пока длится жест. */
    target: () => HTMLElement | null | undefined;
    /** Runs on a press that is ours. Return `false` to refuse it: nothing is taken (no capture, no `preventDefault`). / Вызывается на нажатие, которое наше. `false` отказывает: ничего не берётся (ни захват, ни `preventDefault`). */
    onStart?: (event: PointerEvent) => boolean | void;
    /** A move of the pointer that holds the gesture. / Движение указателя, который держит жест. */
    onMove: (event: PointerEvent) => void;
    /** The gesture is over, once, for whatever reason. / Жест закончен, один раз, по любой причине. */
    onEnd: (reason: PointerDragEnd) => void;
    /** The button that starts it; the main one by default. / Кнопка, что начинает жест; по умолчанию основная. */
    button?: number;
    /** `preventDefault()` on the press, so the browser does not take the focus or select text; on by default. / `preventDefault()` на нажатие, чтобы браузер не брал фокус и не выделял текст; по умолчанию включено. */
    preventDefault?: boolean;
}

export interface PointerDrag {
    /** A gesture is in progress. / Жест идёт. */
    dragging: Ref<boolean>;
    /** The pointer that holds it, or -1. / Указатель, который его держит, или -1. */
    pointerId: () => number;
    /** The events to bind on the element: `v-on="drag.events"`. / События для элемента: `v-on="drag.events"`. */
    events: {
        pointerdown: (event: PointerEvent) => void;
        pointermove: (event: PointerEvent) => void;
        pointerup: (event: PointerEvent) => void;
        pointercancel: (event: PointerEvent) => void;
        lostpointercapture: () => void;
    };
    /** Ends the gesture now (Escape, a state that no longer allows it). Does nothing when none is going. / Заканчивает жест сейчас (Escape, состояние, которое его больше не допускает). Без жеста ничего не делает. */
    end: (reason?: PointerDragEnd) => void;
}

export function usePointerDrag(options: UsePointerDragOptions): PointerDrag {
    const dragging = ref(false);
    let id = -1;
    let stopFocusLoss: (() => void) | undefined;

    function release() {
        const el = options.target();
        if (!el || id === -1) {
            return;
        }
        if (typeof el.hasPointerCapture === 'function' && !el.hasPointerCapture(id)) {
            return;
        }
        try {
            el.releasePointerCapture(id);
        } catch {
            // already released by the browser / уже отпущен браузером
        }
    }

    function end(reason: PointerDragEnd = 'abort') {
        if (!dragging.value) {
            return;
        }
        dragging.value = false;
        release();
        id = -1;
        stopFocusLoss?.();
        stopFocusLoss = undefined;
        options.onEnd(reason);
    }

    const events: PointerDrag['events'] = {
        pointerdown(event) {
            const el = options.target();
            if (!el || event.button !== (options.button ?? 0) || dragging.value) {
                return;
            }
            if (options.onStart?.(event) === false) {
                return;
            }
            id = event.pointerId;
            dragging.value = true;
            if (options.preventDefault !== false) {
                event.preventDefault();
            }
            try {
                el.setPointerCapture(id);
            } catch {
                // an untrusted event or a pointer that is already gone: the gesture still works inside the element
                // искусственное событие или указатель, которого уже нет: жест работает и так, внутри элемента
            }
            stopFocusLoss = listenFocusLoss(() => end('lost'));
        },
        pointermove(event) {
            if (dragging.value && event.pointerId === id) {
                options.onMove(event);
            }
        },
        pointerup(event) {
            if (dragging.value && event.pointerId === id) {
                end('up');
            }
        },
        pointercancel(event) {
            if (dragging.value && event.pointerId === id) {
                end('cancel');
            }
        },
        lostpointercapture() {
            end('lost');
        },
    };

    onBeforeUnmount(() => end('unmount'));

    return { dragging, pointerId: () => id, events, end };
}
