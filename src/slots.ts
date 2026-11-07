import { Comment, Fragment, Text, type Slots, type VNode } from 'vue';

/**
 * Whether a named slot of a component draws anything: the check for `v-if` on a wrapper. Plain slots only (no slot props):
 * it calls the slot with none. Call it at render time, from the template or from a `computed` the template reads.
 * Рисует ли что-нибудь именованный слот компонента: проверка для `v-if` на обёртке. Только простые слоты (без пропсов
 * слота): он вызывается без них. Вызывать при рендере, из шаблона или из `computed`, который читает шаблон.
 */
export function slotHas(slots: Slots, name = 'default'): boolean {
    return slotHasContent(slots[name]?.());
}

/**
 * Whether the vnodes of a slot draw anything. `$slots.default` is there even when the content is `<template v-if="false">`
 * or only an empty `<i v-if>`: the slot function exists, but it returns comments. Asking `$slots.default` then leaves an
 * empty wrapper, and a gap beside it, where there is nothing to show. Call it at render time, with the slot's result.
 * Рисует ли что-нибудь содержимое слота. `$slots.default` есть и тогда, когда внутри `<template v-if="false">` или пустой
 * `<i v-if>`: функция слота существует, но возвращает комментарии. Если спрашивать `$slots.default`, останется пустая
 * обёртка и зазор рядом с ней там, где показывать нечего. Вызывать при рендере, с результатом слота.
 */
export function slotHasContent(nodes: VNode[] | undefined): boolean {
    if (!nodes) return false;
    return nodes.some((node) => {
        if (node.type === Comment) return false;
        if (node.type === Text) return typeof node.children === 'string' && node.children.trim() !== '';
        if (node.type === Fragment) return Array.isArray(node.children) && slotHasContent(node.children as VNode[]);
        return true;
    });
}
