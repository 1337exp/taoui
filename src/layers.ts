import { nextTick, onBeforeUnmount, toValue, watch, type MaybeRefOrGetter } from 'vue';
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

// The page behind a modal layer is `inert`: Tab, the pointer and a screen reader do not reach it (`aria-modal` is only a hint). The siblings
// of every ancestor of the layer, up to `<body>`, are made inert as they are when the layer opens, so a popup that opens later inside the
// layer (a select in a dialog, teleported to the body) is not. An element that is inert already is left alone; one that two layers made
// inert is freed by the last of them. The toasts stay live: a status message must be heard under a dialog.
// Страница за модальным слоем `inert`: Tab, указатель и скринридер до неё не доходят (`aria-modal` лишь подсказка). Соседи каждого
// предка слоя, вплоть до `<body>`, становятся inert такими, какие они есть в момент открытия слоя, поэтому всплывающее окно, которое
// откроется позже внутри слоя (select в диалоге, телепорт в body), не затронуто. Уже inert-элемент не трогаем; элемент, который сделали
// inert два слоя, освобождает последний из них. Тосты остаются живыми: сообщение о статусе должно быть слышно и под диалогом.
const inerted = new Map<Element, number>();
const KEEP_LIVE = '[data-tao-toast-viewport]';

function makeInert(root: Element): Element[] {
    const done: Element[] = [];
    for (let node: Element | null = root; node && node !== document.body; node = node.parentElement) {
        for (const sibling of Array.from(node.parentElement?.children ?? [])) {
            if (sibling === node || sibling.matches(KEEP_LIVE) || sibling.matches('script, style, link, template')) {
                continue;
            }
            const count = inerted.get(sibling) ?? 0;
            if (count === 0 && sibling.hasAttribute('inert')) {
                continue; // inert by the author: not ours to set or to free
            }
            inerted.set(sibling, count + 1);
            sibling.setAttribute('inert', '');
            done.push(sibling);
        }
    }
    return done;
}

function freeInert(elements: Element[]) {
    for (const element of elements) {
        const count = (inerted.get(element) ?? 1) - 1;
        if (count <= 0) {
            inerted.delete(element);
            element.removeAttribute('inert');
        } else {
            inerted.set(element, count);
        }
    }
}

export interface UseLayerOptions {
    /**
     * The root of the dialog (the element that is on the screen once it is open): with it the rest of the page is made `inert` while the
     * layer is open. For dialogs, panels and drawers; not for menus and popups.
     * Корень диалога (элемент, который на экране, когда он открыт): с ним остальная страница становится `inert`, пока слой открыт.
     * Для диалогов, панелей и drawer; не для меню и всплывающих окон.
     */
    modalRoot?: () => HTMLElement | null | undefined;
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
    let made: Element[] = [];

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
        if (options.modalRoot) {
            // the dialog is drawn after the flush
            // диалог рисуется после flush
            void nextTick(() => {
                const root = options.modalRoot?.();
                if (active && root && !made.length) {
                    made = makeInert(root);
                }
            });
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
        freeInert(made);
        made = [];
        previousFocus?.focus?.();
        previousFocus = null;
    }

    watch(() => toValue(open), (isOpen) => (isOpen ? enter() : leave()), { immediate: true });
    onBeforeUnmount(leave);

    return { isTop: () => stack[stack.length - 1] === layer };
}
