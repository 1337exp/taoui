<script lang="ts" setup>
import { computed, resolveComponent } from 'vue';

interface Props {
    to?: string | Record<string, unknown>;
    asNewTab?: boolean;
    private?: boolean;
    exactPath?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    to: undefined,
    asNewTab: false,
    private: false,
    exactPath: false,
});

// В Nuxt-проекте <NuxtLink> зарегистрирован глобально и resolveComponent
// его находит — тогда используем клиентский роутинг. Вне Nuxt (или если
// компонент не найден) резолвится строкой — тогда рендерим обычный <a>.
// Так TaoLink работает и в Nuxt, и в чистом Vue без доп. настройки.
const linkComponent = computed(() => {
    const resolved = resolveComponent('NuxtLink');
    return typeof resolved === 'string' ? 'a' : resolved;
});

const linkProps = computed(() => {
    const target = props.asNewTab ? '_blank' : undefined;
    const rel = (props.private && 'noopener noreferrer') || (props.asNewTab && 'noopener') || undefined;

    if (linkComponent.value === 'a') {
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
        exactPath: props.exactPath,
    };
});
</script>

<template>
    <component :is="linkComponent" v-bind="linkProps" draggable="false">
        <slot />
    </component>
</template>
