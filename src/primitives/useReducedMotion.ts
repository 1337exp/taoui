// The user's «reduce motion» setting, live. Four components read `matchMedia('(prefers-reduced-motion: reduce)')` on their own (the carousel
// once on mount, the drawer and the tour at the moment of use, the marquee with its own listener), so a change of the setting after mount
// reached only one of them. The CSS keeps its own `@media (prefers-reduced-motion: reduce)` rules: this is for the motion that is done in script.
// Настройка «уменьшить движение» пользователя, живая. Четыре компонента сами читали `matchMedia('(prefers-reduced-motion: reduce)')` (карусель
// один раз при монтировании, drawer и tour в момент использования, marquee со своим слушателем), поэтому смена настройки после монтирования
// доходила лишь до одного. У CSS остаются свои правила `@media (prefers-reduced-motion: reduce)`: это для движения, которое делается в скрипте.
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

export function useReducedMotion(): Ref<boolean> {
    // false on the server and before the first mount: there is nothing to read there / false на сервере и до монтирования: читать там нечего
    const reduced = ref(false);
    let query: MediaQueryList | undefined;

    function update() {
        reduced.value = query?.matches === true;
    }

    onMounted(() => {
        query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        update();
        query?.addEventListener?.('change', update);
    });

    onBeforeUnmount(() => {
        query?.removeEventListener?.('change', update);
    });

    return reduced;
}
