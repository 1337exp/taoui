import { Comment, Fragment, Text, type VNode } from 'vue';

/**
 * The slots of a component as this file needs them: a name and a function. Not Vue's own `Slots`: its type of a slot changed between 3.5.x
 * releases (a slot that must be called with one argument), and a typed `defineSlots` is not assignable to it. Anything with named functions fits.
 * Слоты компонента в том виде, что нужен этому файлу: имя и функция. Не `Slots` из Vue: тип слота менялся между релизами 3.5.x (слот, который
 * надо звать с одним аргументом), и типизированный `defineSlots` ему не присваивается. Подходит всё, где есть именованные функции.
 */
export type SlotMap = { readonly [name: string]: ((...args: never[]) => unknown) | undefined };

/**
 * Whether a named slot of a component draws anything: the check for `v-if` on a wrapper. Plain slots only (no slot props):
 * it calls the slot with none. Call it at render time, from the template or from a `computed` the template reads.
 * Рисует ли что-нибудь именованный слот компонента: проверка для `v-if` на обёртке. Только простые слоты (без пропсов
 * слота): он вызывается без них. Вызывать при рендере, из шаблона или из `computed`, который читает шаблон.
 */
export function slotHas(slots: SlotMap, name = 'default'): boolean {
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
export function slotHasContent(result: unknown): boolean {
    if (!Array.isArray(result)) return false;
    return (result as VNode[]).some((node) => {
        if (node.type === Comment) return false;
        if (node.type === Text) return typeof node.children === 'string' && node.children.trim() !== '';
        if (node.type === Fragment) return Array.isArray(node.children) && slotHasContent(node.children as VNode[]);
        return true;
    });
}
