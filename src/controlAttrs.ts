import { useAttrs } from 'vue';

/**
 * A field is a wrapper around its control (an input, a textarea, a button, a checkbox): the attributes a user gives it
 * are meant for the control (`aria-label`, `name`, `autocomplete`, `inputmode`, `placeholder`, listeners, `data-*`),
 * the looks for the wrapper (`class`, `style`). Vue puts them all on the root by default, where an `aria-label` names
 * nothing: a screen reader read the field without its name. With `inheritAttrs: false` the component splits them.
 * They are functions read in the render: `useAttrs()` is not reactive, the render re-runs when the attributes change.
 * Поле — обёртка вокруг элемента управления: атрибуты, которые ему дают, предназначены элементу (`aria-label`, `name`,
 * `autocomplete`, `inputmode`, слушатели, `data-*`), внешний вид — обёртке (`class`, `style`). Vue по умолчанию кладёт
 * всё на корень, где `aria-label` ничего не называет: скринридер читал поле без имени. С `inheritAttrs: false`
 * компонент их разделяет. Это функции, читаемые в рендере: `useAttrs()` не реактивен, а рендер повторяется при смене
 * атрибутов.
 */
export function useControlAttrs() {
    const attrs = useAttrs();
    return {
        /** `class` and `style`, for the wrapper. / `class` и `style` — для обёртки. */
        rootAttrs: () => ({ class: attrs.class, style: attrs.style }),
        /** Everything else, for the control. / Всё остальное — для элемента управления. */
        controlAttrs: () => {
            const { class: _class, style: _style, ...rest } = attrs;
            return rest;
        },
    };
}
