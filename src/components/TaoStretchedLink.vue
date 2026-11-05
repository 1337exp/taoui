<script lang="ts" setup>
import TaoLink from './TaoLink.vue';

defineOptions({ name: 'TaoStretchedLink' });

// A TaoLink that stretches over its container (put `tao-stretched` on it); see styles/contexts/stretch.css.
// No comment inside the template: in development it would make a second root and the attributes would not pass on.

interface Props {
    /** The address, as in TaoLink. / Адрес, как у TaoLink. */
    to?: string | Record<string, unknown>;
    /** Open in a new tab. / Открыть в новой вкладке. */
    newTab?: boolean;
    private?: boolean;
    exactPath?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    to: undefined,
    newTab: false,
    private: false,
    exactPath: false,
});
</script>

<template>
    <TaoLink class="tao-stretched-link" v-bind="props">
        <slot />
    </TaoLink>
</template>
