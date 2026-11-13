let locks = 0;
let previousOverflow = '';
let previousGutter: string | null = null;

export function isBrowser() {
    return typeof document !== 'undefined';
}

export function lockBodyScroll() {
    if (!isBrowser()) {
        return;
    }

    if (locks === 0) {
        const root = document.documentElement;
        // A page with a classic scrollbar loses it when the body is locked, and the page gets wider by the width of the
        // bar: everything shifts sideways. Keep the place of the bar (scrollbar-gutter) while it is locked. Only when
        // the bar is there: on a short page nothing is reserved, so nothing shifts the other way.
        // Страница с обычной полосой прокрутки теряет её при запрете, становится шире на её ширину, и всё сдвигается вбок.
        // Пока заперто, место полосы держит scrollbar-gutter. Только если полоса есть: на короткой странице ничего не
        // резервируется, чтобы не сдвинуть её в другую сторону.
        if (root.clientWidth > 0 && window.innerWidth > root.clientWidth) {
            previousGutter = root.style.getPropertyValue('scrollbar-gutter');
            root.style.setProperty('scrollbar-gutter', 'stable');
        }
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }

    locks += 1;
}

export function unlockBodyScroll() {
    if (!isBrowser() || locks === 0) {
        return;
    }

    locks -= 1;
    if (locks === 0) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = '';
        if (previousGutter !== null) {
            if (previousGutter) {
                document.documentElement.style.setProperty('scrollbar-gutter', previousGutter);
            } else {
                document.documentElement.style.removeProperty('scrollbar-gutter');
            }
            previousGutter = null;
        }
    }
}
