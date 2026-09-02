/**
 * Win / скриншот / Alt-Tab часто глотают mouseleave и pointerup —
 * жест или hover остаются «нажатыми». Слушатель дергает callback,
 * когда окно реально теряет фокус.
 */
export function listenFocusLoss(onLoss: () => void) {
    function onVisibilityChange() {
        if (document.hidden) {
            onLoss();
        }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onLoss);
    window.addEventListener('pagehide', onLoss);

    return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('blur', onLoss);
        window.removeEventListener('pagehide', onLoss);
    };
}
