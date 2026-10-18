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
        return;
    }

    // Safari on macOS skips buttons and links with Tab by default, so the browser's last stop can differ from
    // our `last`. Let the browser move focus, then pull it back if it left the root.
    // Safari на macOS по умолчанию пропускает кнопки и ссылки по Tab, и последняя остановка браузера может
    // не совпасть с нашим `last`. Даём браузеру сдвинуть фокус и возвращаем, если он вышел за root.
    const backwards = event.shiftKey;
    setTimeout(() => {
        if (!root.isConnected || root.contains(document.activeElement)) {
            return;
        }
        (backwards ? last : first).focus();
    }, 0);
}
