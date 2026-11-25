import { onMounted, ref, watch, type Ref } from 'vue';
import { resolveDensity, type TaoResolvedDensity } from '../density';
import { useDismiss } from '../dismiss';
import { useFloating, type TaoPlacement } from '../floating';
import { useLayer } from '../layers';
import { resolveSize, type TaoSize } from '../size';

/**
 * The plumbing every field with a pop-up repeated (a select, a combobox, a date, a range, a preset list): the panel hangs on
 * its anchor (`useFloating`), a press outside dismisses it (`useDismiss`), Escape belongs to the layer stack (`useLayer`), and a
 * panel that is teleported to `body` takes the size and the density resolved at its anchor. What differs between the fields stays
 * with them: when it opens, what dismissing and Escape do (close, commit, revert).
 * Всё, что повторяли поля со всплывающим окном (select, combobox, дата, период, список заготовок): панель висит на якоре
 * (`useFloating`), нажатие снаружи убирает её (`useDismiss`), Escape принадлежит стеку слоёв (`useLayer`), а панель в `body`
 * берёт размер и плотность, вычисленные у якоря. Различия между полями остаются у них: когда открывается, что делают уход и Escape.
 */
export interface PopupOptions {
    open: Ref<boolean>;
    /** What the panel hangs on (the trigger, or the field). / На чём висит панель (кнопка или поле). */
    anchor: Ref<HTMLElement | null>;
    panel: Ref<HTMLElement | null>;
    placement?: TaoPlacement;
    /** The panel is as wide as its anchor. / Панель шириной с якорь. */
    matchWidth?: boolean;
    /** Other elements that count as inside (the steppers next to a field), besides the anchor and the panel. / Другие элементы, которые считаются «внутри». */
    inside?: () => (Element | null | undefined)[];
    /** A press outside. / Нажатие снаружи. */
    onDismiss: () => void;
    /** Escape. / Escape. */
    onEscape: () => void;
    /** The panel scales with the field: its size is the `size` prop, else the size of the ancestors, and the density is the anchor's. Omit it for a panel that does not scale. / Панель масштабируется вместе с полем. */
    scale?: () => TaoSize | undefined;
}

export function usePopup(o: PopupOptions) {
    const { style, update } = useFloating(o.anchor, o.panel, o.open, { placement: o.placement ?? 'bottom-start', matchWidth: o.matchWidth });
    useDismiss(o.open, () => [o.anchor.value, ...(o.inside?.() ?? []), o.panel.value], o.onDismiss);
    useLayer(o.open, { onEscape: o.onEscape });

    /** The panel is teleported to `body`, so it gets the size resolved at the anchor. / Панель в `body` — размер берём у якоря. */
    const panelSize = ref<TaoSize>('medium');
    const panelDensity = ref<TaoResolvedDensity>('default');
    if (o.scale) {
        const take = () => {
            panelSize.value = resolveSize(o.anchor.value, o.scale!());
            panelDensity.value = resolveDensity(o.anchor.value);
        };
        watch(o.open, (isOpen) => {
            if (isOpen) {
                take();
            }
        });
        // a panel that is open on the first render: the anchor exists only once it is mounted
        // панель, открытая с первого рендера: у якоря есть элемент только после монтирования
        onMounted(() => {
            if (o.open.value) {
                take();
            }
        });
    }

    return { style, update, panelSize, panelDensity };
}

