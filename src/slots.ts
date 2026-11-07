import { Comment, Fragment, Text, type VNode } from 'vue';

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
