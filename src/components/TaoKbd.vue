<script lang="ts" setup>
defineOptions({ name: 'TaoKbd' });

/**
 * A key: `T`, `Ctrl+K`, `⌘`. One look for every place that shows a key (a button, a tooltip, a menu, a command list).
 * `cap` (default) is a key cap: a quiet fill of the text colour behind the key, so it fits any tone, any theme and any
 * background it sits on. `plain` is the key as muted text with no cap, for a column of keys in a menu or a list.
 * Клавиша: `T`, `Ctrl+K`, `⌘`. Один вид для всех мест, где показывается клавиша (кнопка, подсказка, меню, список команд).
 * `cap` (по умолчанию): значок клавиши, тихая заливка цветом текста, поэтому подходит любому тону, теме и фону.
 * `plain`: клавиша приглушённым текстом без значка, для колонки клавиш в меню или списке.
 */
withDefaults(
    defineProps<{
        variant?: 'cap' | 'plain';
    }>(),
    {
        variant: 'cap',
    },
);
</script>

<template>
    <kbd class="tao-kbd" :class="{ 'tao-kbd--plain': variant === 'plain' }"><slot /></kbd>
</template>

<style>
/* :where keeps the specificity at zero: the place that holds a key (a button, a menu row) sets its own size and position
   :where держит специфичность нулевой: место, где стоит клавиша (кнопка, строка меню), само задаёт размер и положение */
:where(.tao-kbd) {
    display: inline-grid;
    place-items: center;
    box-sizing: border-box;
    min-width: 1.6em;
    /* the capital of a letter sits a little above the middle of its line box (the room under it is for the descenders), so the cap
       takes a bit more room on top: the letter then looks centred
       заглавная буква стоит чуть выше середины строки (место под ней для хвостов), поэтому сверху значку чуть больше места */
    padding: 0.22em 0.45em 0.15em;
    border-radius: max(4px, calc(var(--tao-radius-control) * 0.6));
    background: color-mix(in srgb, currentColor 16%, transparent);
    font: inherit;
    font-size: var(--tao-font-size-xs);
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
}

:where(.tao-kbd--plain) {
    display: inline;
    min-width: 0;
    padding: 0;
    border-radius: 0;
    background: none;
    color: var(--tao-color-text-muted);
    font-size: inherit;
    font-weight: inherit;
    font-variant-numeric: tabular-nums;
    line-height: inherit;
}
</style>
