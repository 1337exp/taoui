import { nextTick, onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';

/**
 * Where a floating panel sits against its anchor: a side, optionally aligned to the start or the end of it
 * (`bottom-start` = below, left edges aligned; `bottom-end` = below, right edges aligned; `top` = above, centred).
 * Где панель стоит относительно якоря: сторона и, при желании, выравнивание по началу или концу.
 */
export type TaoPlacement =
    | 'top' | 'top-start' | 'top-end'
    | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'left' | 'left-start' | 'left-end'
    | 'right' | 'right-start' | 'right-end';

export type TaoSide = 'top' | 'bottom' | 'left' | 'right';

export interface FloatingInput {
    /** The anchor box in viewport coordinates (getBoundingClientRect). / Рамка якоря. */
    anchor: { left: number; top: number; width: number; height: number };
    /** The size of the panel. / Размер панели. */
    size: { width: number; height: number };
    viewport: { width: number; height: number };
    placement?: TaoPlacement;
    /** Space between the anchor and the panel. / Зазор между якорем и панелью. */
    gap?: number;
    /** Space kept free at the viewport edges. / Отступ от краёв окна. */
    pad?: number;
    /** Open on the opposite side when the wanted one is too tight. / Открыться с другой стороны, если места мало. */
    flip?: boolean;
}

export interface FloatingResult {
    top: number;
    left: number;
    /** The side actually used (after a flip). / Реально выбранная сторона. */
    side: TaoSide;
    /** Where the anchor centre falls on the panel, for an arrow. / Куда попадает центр якоря на панели (для стрелки). */
    anchorOffset: { x: number; y: number };
}

const opposite: Record<TaoSide, TaoSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Pure placement maths. The wanted side flips only when it does not fit and the opposite one has more room;
 * the result is then clamped into the viewport on both axes.
 * Чистая математика. Сторона переворачивается, только если не влезает и напротив больше места;
 * затем результат зажимается в окно по обеим осям.
 */
export function computePosition(input: FloatingInput): FloatingResult {
    const { anchor, size, viewport, placement = 'bottom-start', gap = 4, pad = 8, flip = true } = input;
    const [wanted, align] = placement.split('-') as [TaoSide, 'start' | 'end' | undefined];

    const space: Record<TaoSide, number> = {
        bottom: viewport.height - (anchor.top + anchor.height) - gap - pad,
        top: anchor.top - gap - pad,
        right: viewport.width - (anchor.left + anchor.width) - gap - pad,
        left: anchor.left - gap - pad,
    };

    let side = wanted;
    const need = side === 'top' || side === 'bottom' ? size.height : size.width;
    if (flip && space[side] < need && space[opposite[side]] > space[side]) {
        side = opposite[side];
    }

    const vertical = side === 'top' || side === 'bottom';
    // across the main axis: start / end / centre against the anchor
    const alignAcross = (start: number, anchorSize: number, panelSize: number) =>
        align === 'start' ? start : align === 'end' ? start + anchorSize - panelSize : start + anchorSize / 2 - panelSize / 2;

    let top: number;
    let left: number;
    if (vertical) {
        left = alignAcross(anchor.left, anchor.width, size.width);
        top = side === 'bottom' ? anchor.top + anchor.height + gap : anchor.top - size.height - gap;
    } else {
        top = alignAcross(anchor.top, anchor.height, size.height);
        left = side === 'right' ? anchor.left + anchor.width + gap : anchor.left - size.width - gap;
    }

    // an end-aligned panel that sticks out on the left falls back to the start edge (a menu at the left of the page)
    if (vertical && align === 'end' && left < pad) {
        left = anchor.left;
    }

    left = Math.max(pad, Math.min(left, viewport.width - pad - size.width));
    top = Math.max(pad, Math.min(top, viewport.height - pad - size.height));

    return {
        top,
        left,
        side,
        anchorOffset: { x: anchor.left + anchor.width / 2 - left, y: anchor.top + anchor.height / 2 - top },
    };
}

export interface UseFloatingOptions {
    placement?: MaybeRefOrGetter<TaoPlacement | undefined>;
    gap?: number;
    pad?: number;
    flip?: boolean;
    /** The panel is as wide as the anchor (Select, Combobox). / Панель по ширине якоря. */
    matchWidth?: boolean;
}

/**
 * Keeps a teleported panel next to its anchor while `open`: measures after render, then follows scroll and resize
 * (one capturing listener pair, removed on close). Returns the inline style, the side in use and `update()`.
 * Держит телепортированную панель рядом с якорем, пока `open`: меряет после рендера и следит за scroll и resize.
 */
export function useFloating(
    anchor: Ref<HTMLElement | null>,
    panel: Ref<HTMLElement | null>,
    open: MaybeRefOrGetter<boolean>,
    options: UseFloatingOptions = {},
) {
    const style = ref<Record<string, string>>({ top: '0px', left: '0px' });
    const side = ref<TaoSide>('bottom');
    const anchorOffset = ref({ x: 0, y: 0 });
    /** False until the first measurement: a panel can stay invisible until then. / Пока нет первого замера — false. */
    const placed = ref(false);

    function update() {
        const anchorEl = anchor.value;
        const panelEl = panel.value;
        if (!anchorEl || !panelEl || typeof window === 'undefined') {
            return;
        }

        const rect = anchorEl.getBoundingClientRect();
        const result = computePosition({
            anchor: rect,
            size: { width: options.matchWidth ? rect.width : panelEl.offsetWidth, height: panelEl.offsetHeight },
            viewport: { width: window.innerWidth, height: window.innerHeight },
            placement: toValue(options.placement),
            gap: options.gap,
            pad: options.pad,
            flip: options.flip,
        });

        side.value = result.side;
        anchorOffset.value = result.anchorOffset;
        style.value = {
            top: `${result.top}px`,
            left: `${result.left}px`,
            ...(options.matchWidth ? { width: `${rect.width}px` } : {}),
        };
        placed.value = true;
    }

    function onViewportChange() {
        if (toValue(open)) {
            update();
        }
    }

    watch(
        () => toValue(open),
        async (isOpen) => {
            if (typeof window === 'undefined') {
                return;
            }
            if (!isOpen) {
                placed.value = false;
                window.removeEventListener('resize', onViewportChange);
                window.removeEventListener('scroll', onViewportChange, true);
                return;
            }
            window.addEventListener('resize', onViewportChange);
            window.addEventListener('scroll', onViewportChange, true);
            await nextTick();
            update();
        },
        { immediate: true },
    );

    watch(() => toValue(options.placement), () => onViewportChange());

    onBeforeUnmount(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', onViewportChange);
            window.removeEventListener('scroll', onViewportChange, true);
        }
    });

    return { style, side, anchorOffset, placed, update };
}
