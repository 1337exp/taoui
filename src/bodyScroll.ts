let locks = 0;
let previousOverflow = '';

export function isBrowser() {
    return typeof document !== 'undefined';
}

export function lockBodyScroll() {
    if (!isBrowser()) {
        return;
    }

    if (locks === 0) {
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
    }
}
