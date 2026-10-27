import { onBeforeUnmount, toValue, watch, type MaybeRefOrGetter } from 'vue';

/**
 * Calls `onDismiss` when a pointer goes down outside the given elements while `open`.
 * The capture phase is deliberate: an app that stops propagation on its own panel still closes the popup.
 * Вызывает `onDismiss`, когда нажатие произошло вне заданных элементов, пока `open`. Фаза перехвата нарочно:
 * приложение, гасящее событие у своей панели, всё равно закроет окно.
 */
export function useDismiss(
    open: MaybeRefOrGetter<boolean>,
    inside: () => (Element | null | undefined)[],
    onDismiss: () => void,
) {
    function onPointer(event: PointerEvent) {
        const target = event.target as Node | null;
        if (target && inside().some((el) => el?.contains(target))) {
            return;
        }
        onDismiss();
    }

    function stop() {
        if (typeof document !== 'undefined') {
            document.removeEventListener('pointerdown', onPointer, true);
        }
    }

    watch(
        () => toValue(open),
        (isOpen) => {
            if (typeof document === 'undefined') {
                return;
            }
            stop();
            if (isOpen) {
                document.addEventListener('pointerdown', onPointer, true);
            }
        },
        { immediate: true },
    );

    onBeforeUnmount(stop);
}
