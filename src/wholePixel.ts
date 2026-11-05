import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from 'vue';
import { centringNudge } from './pixelSnap';

/**
 * Keeps a centred panel (a confirm, a dialog) on whole pixels while it is open: when the room left over in its box is odd it gets a margin of
 * 1px, which moves it by half a pixel. Looks again when the panel opens, when its size changes (its content changed) and when the window is
 * resized. See `centringNudge` for why.
 * Держит отцентрованную панель (подтверждение, диалог) на целых пикселях, пока она открыта: когда оставшееся место в её блоке нечётное,
 * ей ставится отступ 1px, и она сдвигается на полпикселя. Смотрит заново, когда панель открылась, когда изменился её размер (изменилось
 * содержимое) и когда изменили размер окна. Зачем это — см. `centringNudge`.
 */
export function useWholePixelPanel(panel: Ref<HTMLElement | null>, open: () => boolean): void {
    let observer: ResizeObserver | null = null;

    function snap() {
        const el = panel.value;
        const box = el?.parentElement;
        if (!el || !box) {
            return;
        }
        el.style.marginTop = '';
        el.style.marginTop = centringNudge(box.clientHeight, el.offsetHeight) ? '1px' : '';
    }

    function stop() {
        observer?.disconnect();
        observer = null;
    }

    watch(
        open,
        async (isOpen) => {
            stop();
            if (!isOpen) {
                return;
            }
            await nextTick();
            snap();
            if (panel.value && typeof ResizeObserver !== 'undefined') {
                observer = new ResizeObserver(snap);
                observer.observe(panel.value);
            }
        },
        { immediate: true },
    );

    onMounted(() => window.addEventListener('resize', snap));
    onBeforeUnmount(() => {
        window.removeEventListener('resize', snap);
        stop();
    });
}
