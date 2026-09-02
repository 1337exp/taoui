<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'TaoAvatar' });

const props = withDefaults(
    defineProps<{
        src?: string;
        name?: string;
        alt?: string;
        size?: 'small' | 'medium' | 'large' | 's' | 'm' | 'l';
    }>(),
    {
        src: '',
        name: '',
        alt: '',
        size: 'medium',
    },
);

const sizeClass = computed(() => {
    if (props.size === 'small' || props.size === 's') {
        return 's';
    }
    if (props.size === 'large' || props.size === 'l') {
        return 'l';
    }
    return 'm';
});

const initials = computed(() => {
    const parts = props.name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
        return '';
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
});

const label = computed(() => props.alt || props.name || 'Аватар');
</script>

<template>
    <span class="tao-avatar" :class="`tao-avatar--${sizeClass}`" :title="name || undefined">
        <img v-if="src" class="tao-avatar__img" :src="src" :alt="label" />
        <span v-else class="tao-avatar__fallback" :aria-label="label">{{ initials || '?' }}</span>
    </span>
</template>

<style scoped>
.tao-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--tao-color-accent-subtle);
    color: var(--tao-color-accent);
    border-radius: var(--tao-radius-full);
    font-weight: 600;
    line-height: 1;
    user-select: none;
}

.tao-avatar--s {
    width: 24px;
    height: 24px;
    font-size: 10px;
}

.tao-avatar--m {
    width: 32px;
    height: 32px;
    font-size: var(--tao-font-size-xs);
}

.tao-avatar--l {
    width: 48px;
    height: 48px;
    font-size: var(--tao-font-size-md);
}

.tao-avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.tao-avatar__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
</style>
