import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { listenFocusLoss } from './focusLoss';

/**
 * What stops the autoplay of TaoCarousel: the mouse over it, the keyboard focus in it, a drag or a glide, the pause button, a hidden
 * tab. A hover is dropped when the window loses the focus (the `mouseleave` is swallowed then).
 * Что останавливает автопрокрутку TaoCarousel: мышь над ней, клавиатурный фокус в ней, перетаскивание или доводка, кнопка паузы,
 * скрытая вкладка. Наведение сбрасывается, когда окно теряет фокус (`mouseleave` тогда проглатывается).
 */
export interface CarouselPauseOptions {
    dragging: Ref<boolean>;
    gliding: Ref<boolean>;
    /** The strip is still on the page: the focus check runs a frame later. / Лента ещё на странице: проверка фокуса идёт кадром позже. */
    alive: () => boolean;
}

export function useCarouselPause(o: CarouselPauseOptions) {
    const hoverPaused = ref(false);
    const focusPaused = ref(false);
    /** The user pressed the pause button. / Нажата кнопка паузы. */
    const userPaused = ref(false);
    const pageHidden = ref(false);
    const paused = computed(
        () => hoverPaused.value || focusPaused.value || o.dragging.value || o.gliding.value || userPaused.value || pageHidden.value,
    );
    let focusFrame = 0;

    function onMouseEnter() {
        hoverPaused.value = true;
    }

    function onMouseLeave() {
        hoverPaused.value = false;
    }

    function hasKeyboardFocus(root: HTMLElement) {
        const active = document.activeElement;
        if (!(active instanceof HTMLElement) || !root.contains(active)) {
            return false;
        }

        try {
            return active.matches(':focus-visible');
        } catch {
            return true;
        }
    }

    function scheduleFocusPause(event: FocusEvent) {
        const root = event.currentTarget as HTMLElement;
        cancelAnimationFrame(focusFrame);
        focusFrame = requestAnimationFrame(() => {
            if (!o.alive()) {
                return;
            }

            focusPaused.value = hasKeyboardFocus(root);
        });
    }

    function onVisibilityChange() {
        pageHidden.value = document.hidden;
    }

    let stopFocusLoss: (() => void) | undefined;

    onMounted(() => {
        pageHidden.value = document.hidden;
        document.addEventListener('visibilitychange', onVisibilityChange);
        stopFocusLoss = listenFocusLoss(() => (hoverPaused.value = false));
    });

    onBeforeUnmount(() => {
        cancelAnimationFrame(focusFrame);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        stopFocusLoss?.();
    });

    return { hoverPaused, focusPaused, userPaused, pageHidden, paused, onMouseEnter, onMouseLeave, scheduleFocusPause };
}
