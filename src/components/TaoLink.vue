<script lang="ts" setup>
import { computed, getCurrentInstance } from 'vue';

defineOptions({ name: 'TaoLink' });

interface Props {
    to?: string | Record<string, unknown>;
    /** Open in a new tab. / Открыть в новой вкладке. */
    newTab?: boolean;
    private?: boolean;
    exactPath?: boolean;
    /**
     * Underline: `always` (the default: in a line of text a link must not rest on colour alone), `hover` (only under the pointer
     * and the keyboard focus: for a link that is clear from its place, a menu, a card title), `none`.
     * Подчёркивание: `always` (по умолчанию: в строке текста ссылка не должна держаться на одном цвете), `hover` (только под
     * курсором и фокусом: ссылка, понятная по месту, пункт меню, заголовок карточки), `none`.
     */
    underline?: 'always' | 'hover' | 'none';
}

const props = withDefaults(defineProps<Props>(), {
    to: undefined,
    newTab: false,
    private: false,
    exactPath: false,
    underline: 'always',
});

const globals = getCurrentInstance()?.appContext.components ?? {};

// NuxtLink (Nuxt) → RouterLink (vue-router) → <a>.
// Nuxt первым: это обёртка над RouterLink с prefetch.
// Ищем в глобальном реестре, а не через resolveComponent — иначе Vue
// пишет warning, если Nuxt/vue-router в проекте нет.
const linkKind = globals.NuxtLink ? 'nuxt' : globals.RouterLink ? 'router' : 'a';
const linkComponent =
    linkKind === 'nuxt' ? globals.NuxtLink : linkKind === 'router' ? globals.RouterLink : 'a';

const linkProps = computed(() => {
    const newTab = props.newTab;
    const target = newTab ? '_blank' : undefined;
    const rel = (props.private && 'noopener noreferrer') || (newTab && 'noopener') || undefined;

    if (linkKind === 'a') {
        return {
            href: typeof props.to === 'string' ? props.to : undefined,
            target,
            rel,
        };
    }

    return {
        to: props.to,
        target,
        rel,
        ...(linkKind === 'nuxt' ? { exactPath: props.exactPath } : {}),
    };
});
</script>

<template>
    <component
        :is="linkComponent"
        v-bind="linkProps"
        class="tao-link"
        :class="{ 'tao-link--hover': underline === 'hover', 'tao-link--none': underline === 'none' }"
        draggable="false"
    >
        <slot />
    </component>
</template>
