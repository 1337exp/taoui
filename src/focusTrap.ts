const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusable(root: HTMLElement) {
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0 || el === document.activeElement,
    );
}

export function trapTab(event: KeyboardEvent, root: HTMLElement) {
    if (event.key !== 'Tab') {
        return;
    }

    const items = getFocusable(root);
    if (!items.length) {
        event.preventDefault();
        root.focus();
        return;
    }

    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
    }

    if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}
