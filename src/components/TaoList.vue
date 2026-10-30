<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { firstEnabled, lastEnabled, stepEnabled } from '../listNav';
import { sizeClass, type TaoSize } from '../size';
import { toCssLength, type TaoLength } from '../length';
import { useTaoLocale } from '../locale';

defineOptions({ name: 'TaoList' });

const appLocale = useTaoLocale();

const props = withDefaults(
    defineProps<{
        /** Row height; items inherit it. Without it — the size of ancestors. / Высота строк, item наследует. Без него — размер предков. */
        size?: TaoSize;
        /** Рамка, как у списка файлов. */
        bordered?: boolean;
        /** Линии между строками. */
        divided?: boolean;
        /** Скролл, если строки не влезают. Число — пиксели. */
        maxHeight?: TaoLength;
        /** Показать `#empty` вместо строк. */
        empty?: boolean;
        ariaLabel?: string;
        /**
         * One Tab stop for the whole list: the arrows move between the rows, Home / End to the first and the last;
         * disabled rows are skipped. Tab comes back to the row it left (the selected one the first time). A row's
         * stop is its button (`clickable`) or the row itself.
         * Одна остановка Tab на весь список: стрелки ходят по строкам, Home / End — в начало и в конец; недоступные
         * пропускаются. Tab возвращается в строку, из которой ушёл (в первый раз — в выбранную). Остановка строки — её
         * кнопка (`clickable`) или сама строка.
         */
        roving?: boolean;
    }>(),
    {
        bordered: true,
        divided: true,
        empty: false,
        ariaLabel: '',
        roving: false,
    },
);

const listStyle = computed(() => {
    const value = toCssLength(props.maxHeight);
    return value ? { maxHeight: value } : undefined;
});

//---]>
// roving: the rows come through the slot, so they are read from the markup (the direct `li` children); a mutation
// observer follows rows added and removed
// roving: строки приходят слотом, поэтому читаются из разметки (прямые дети `li`); за добавленными и убранными
// строками следит MutationObserver

const listRef = ref<HTMLUListElement | null>(null);
const current = ref(-1);

interface Row {
    el: HTMLElement;
    target: HTMLElement;
    enabled: boolean;
}

function rows(): Row[] {
    const list = listRef.value;
    if (!list) {
        return [];
    }
    return [...list.children]
        .filter((el): el is HTMLElement => el instanceof HTMLElement && el.tagName === 'LI' && !el.classList.contains('tao-list__empty'))
        .map((el) => {
            const hit = [...el.children].find((child): child is HTMLButtonElement => child.matches('button.tao-list-item__hit'));
            return { el, target: hit ?? el, enabled: el.getAttribute('aria-disabled') !== 'true' && !hit?.disabled };
        });
}

const isSelected = (row: Row) =>
    row.el.classList.contains('tao-list-item--selected') || row.el.getAttribute('aria-current') === 'true' || row.target.getAttribute('aria-current') === 'true';

function sync() {
    if (!props.roving) {
        return;
    }
    const all = rows();
    let index = current.value;
    if (!all[index]?.enabled) {
        const selected = all.findIndex((row) => row.enabled && isSelected(row));
        index = selected >= 0 ? selected : all.findIndex((row) => row.enabled);
    }
    current.value = index;
    all.forEach((row, i) => row.target.setAttribute('tabindex', i === index ? '0' : '-1'));
}

function release() {
    for (const row of rows()) {
        row.target.removeAttribute('tabindex');
    }
}

function onKeydown(event: KeyboardEvent) {
    if (!props.roving || event.altKey || event.metaKey) {
        return;
    }
    const all = rows();
    const from = all.findIndex((row) => row.target === event.target);
    // a key inside a row's own control (an input, a menu) stays with it / клавиша внутри элемента строки остаётся ему
    if (from < 0) {
        return;
    }
    const enabled = all.map((row) => row.enabled);
    const to =
        event.key === 'ArrowDown' ? stepEnabled(enabled, from, 1, false)
        : event.key === 'ArrowUp' ? stepEnabled(enabled, from, -1, false)
        : event.key === 'Home' ? firstEnabled(enabled)
        : event.key === 'End' ? lastEnabled(enabled)
        : -2;
    if (to === -2) {
        return;
    }
    event.preventDefault();
    if (to >= 0 && to !== from) {
        current.value = to;
        sync();
        all[to]!.target.focus();
    }
}

function onFocusIn(event: FocusEvent) {
    if (!props.roving) {
        return;
    }
    const index = rows().findIndex((row) => row.target === event.target);
    if (index >= 0 && index !== current.value) {
        current.value = index;
        sync();
    }
}

let observer: MutationObserver | undefined;
onMounted(() => {
    sync();
    if (typeof MutationObserver !== 'undefined' && listRef.value) {
        // childList only: the tabindex this sets is an attribute, so it does not wake the observer again
        // только childList: tabindex, который ставится здесь, — атрибут, и наблюдатель от него не просыпается
        observer = new MutationObserver(() => sync());
        observer.observe(listRef.value, { childList: true, subtree: true });
    }
});
onBeforeUnmount(() => observer?.disconnect());
watch(
    () => props.roving,
    (on) => nextTick(() => (on ? sync() : release())),
);
</script>

<template>
    <ul
        ref="listRef"
        class="tao-list"
        :class="[
            sizeClass(size),
            {
                'tao-list--bordered': bordered,
                'tao-list--divided': divided,
                'tao-list--plain': !bordered,
                'tao-list--empty': empty,
                'tao-list--scroll': Boolean(maxHeight),
                'tao-list--roving': roving,
            },
        ]"
        :style="listStyle"
        :aria-label="ariaLabel || undefined"
        @keydown="onKeydown"
        @focusin="onFocusIn"
    >
        <li v-if="empty" class="tao-list__empty">
            <slot name="empty">{{ appLocale.list.emptyText }}</slot>
        </li>
        <slot v-else />
    </ul>
</template>

<style scoped>
.tao-list {
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
}

/* a row that is its own Tab stop shows the focus like a clickable row does / строка-остановка показывает фокус, как кликабельная */
.tao-list--roving > :deep(li[tabindex]) {
    outline: none;
}

.tao-list--roving > :deep(li[tabindex]:focus-visible) {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-list--bordered {
    overflow: hidden;
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-control);
}

.tao-list--plain {
    padding: var(--tao-space-1);
    background: transparent;
}

.tao-list--scroll {
    overflow: auto;
}

.tao-list--divided :deep(.tao-list-item:not(:last-child)) {
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-list--plain :deep(.tao-list-item) {
    border-radius: var(--tao-radius-sm);
}

.tao-list__empty {
    margin: 0;
    padding: var(--tao-space-3);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size-secondary);
    line-height: 1.45;
    text-align: center;
}
</style>
