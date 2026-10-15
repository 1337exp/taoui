<script lang="ts" setup>
import { computed, getCurrentInstance } from 'vue';

defineOptions({ name: 'TaoLink' });

interface Props {
    to?: string | Record<string, unknown>;
    /** Open in a new tab. / Открыть в новой вкладке. */
    newTab?: boolean;
    /** @deprecated Use `newTab`. / Используйте `newTab`. */
    asNewTab?: boolean;
    private?: boolean;
    exactPath?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    to: undefined,
    newTab: false,
    asNewTab: false,
    private: false,
    exactPath: false,
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
    const newTab = props.newTab || props.asNewTab;
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
    <component :is="linkComponent" v-bind="linkProps" draggable="false">
        <slot />
    </component>
</template>
