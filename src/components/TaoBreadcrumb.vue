<script lang="ts" setup>
import TaoLink from './TaoLink.vue';
import type { TaoBreadcrumbItem } from '../breadcrumb';

defineOptions({ name: 'TaoBreadcrumb' });

defineProps<{
    items: TaoBreadcrumbItem[];
}>();
</script>

<template>
    <nav class="tao-breadcrumb" aria-label="Хлебные крошки">
        <ol class="tao-breadcrumb__list">
            <li v-for="(item, index) in items" :key="`${item.label}-${index}`" class="tao-breadcrumb__item">
                <span v-if="index > 0" class="tao-breadcrumb__sep" aria-hidden="true">/</span>
                <span v-if="index === items.length - 1" class="tao-breadcrumb__current" aria-current="page">
                    {{ item.label }}
                </span>
                <TaoLink v-else-if="item.to" class="tao-breadcrumb__link" :to="item.to">{{ item.label }}</TaoLink>
                <span v-else class="tao-breadcrumb__link">{{ item.label }}</span>
            </li>
        </ol>
    </nav>
</template>

<style scoped>
.tao-breadcrumb__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--tao-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: var(--tao-font-size-sm);
}

.tao-breadcrumb__item {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-1);
}

.tao-breadcrumb__sep {
    color: var(--tao-color-text-muted);
}

.tao-breadcrumb__link {
    color: var(--tao-color-text-muted);
}

.tao-breadcrumb__current {
    color: var(--tao-color-text-strong);
    font-weight: 500;
}
</style>
