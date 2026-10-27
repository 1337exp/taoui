import { onBeforeUnmount, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { lockBodyScroll, unlockBodyScroll } from './bodyScroll';

/**
 * The stack of open layers (popups, menus, dialogs). One document listener gives Escape to the TOP layer only,
 * so a Select inside a Modal closes first and the Modal on the next press.
 * Стек открытых слоёв. Один слушатель на document отдаёт Escape только верхнему слою: Select внутри Modal закроется первым.
 */
interface Layer {
    onEscape?: () => void;
}

const stack: Layer[] = [];
let listening = false;

function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
        return;
    }
    const top = stack[stack.length - 1];
    if (top?.onEscape) {
        event.preventDefault();
        top.onEscape();
    }
}

function push(layer: Layer) {
    stack.push(layer);
    if (!listening && typeof document !== 'undefined') {
        document.addEventListener('keydown', onKeydown);
        listening = true;
    }
}

function pop(layer: Layer) {
    const index = stack.indexOf(layer);
    if (index >= 0) {
        stack.splice(index, 1);
    }
    if (!stack.length && listening) {
        document.removeEventListener('keydown', onKeydown);
        listening = false;
    }
}

export interface UseLayerOptions {
    /** Called when Escape is pressed and this is the top layer. / Escape при том, что слой верхний. */
    onEscape?: () => void;
    /** Hold the page scroll while open (dialogs). / Блокировать прокрутку страницы (диалоги). */
    lockScroll?: boolean;
    /** Return focus to what had it before opening (dialogs). / Вернуть фокус туда, где он был до открытия. */
    restoreFocus?: boolean;
}

/** Number of layers open right now (for tests and diagnostics). / Сколько слоёв открыто сейчас. */
export function openLayerCount() {
    return stack.length;
}

export function useLayer(open: MaybeRefOrGetter<boolean>, options: UseLayerOptions = {}) {
    // `onEscape` is read when the key is pressed, so it may be declared after this call
    const layer: Layer = { onEscape: () => options.onEscape?.() };
    let active = false;
    let previousFocus: HTMLElement | null = null;

    function enter() {
        // on the server nothing unmounts the component, so a layer must not enter the stack there
        if (active || typeof document === 'undefined') {
            return;
        }
        active = true;
        previousFocus = options.restoreFocus && typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
        push(layer);
        if (options.lockScroll) {
            lockBodyScroll();
        }
    }

    function leave() {
        if (!active) {
            return;
        }
        active = false;
        pop(layer);
        if (options.lockScroll) {
            unlockBodyScroll();
        }
        previousFocus?.focus?.();
        previousFocus = null;
    }

    watch(() => toValue(open), (isOpen) => (isOpen ? enter() : leave()), { immediate: true });
    onBeforeUnmount(leave);

    return { isTop: () => stack[stack.length - 1] === layer };
}
