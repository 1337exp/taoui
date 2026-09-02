<script lang="ts" setup>
import { ref } from 'vue';

defineOptions({ name: 'TaoInputGroup' });

const focused = ref(false);

function onFocusIn() {
    focused.value = true;
}

function onFocusOut(event: FocusEvent) {
    const root = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (!next || !root.contains(next)) {
        focused.value = false;
    }
}
</script>

<template>
    <div
        class="tao-input-group"
        :class="{ 'tao-input-group--focused': focused }"
        role="group"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
    >
        <div v-if="$slots.before" class="tao-input-group__addon tao-input-group__addon--before">
            <slot name="before" />
        </div>
        <div class="tao-input-group__field">
            <slot />
        </div>
        <div v-if="$slots.after" class="tao-input-group__addon tao-input-group__addon--after">
            <slot name="after" />
        </div>
    </div>
</template>

<style scoped>
.tao-input-group {
    display: flex;
    align-items: stretch;
    width: 100%;
    min-width: 0;
    border-radius: var(--tao-radius-control);
}

.tao-input-group--focused {
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-input-group:has(.tao-input-shell--invalid) {
    box-shadow: none;
}

.tao-input-group--focused:has(.tao-input-shell--invalid) {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-input-group__field {
    display: flex;
    flex: 1 1 auto;
    align-items: stretch;
    align-self: stretch;
    min-width: 0;
}

.tao-input-group__field :deep(.tao-input-wrapper) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-self: stretch;
    min-width: 0;
    gap: 0;
}

.tao-input-group__field :deep(.tao-input-shell) {
    flex: 1 1 auto;
    align-self: stretch;
    border-radius: 0;
    box-shadow: none;
}

.tao-input-group__field :deep(.tao-input) {
    align-self: stretch;
    line-height: 1.25;
}

.tao-input-group__addon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    align-self: stretch;
    padding: 0 var(--tao-space-3);
    border: 1px solid var(--tao-color-border-strong);
    background: var(--tao-color-surface-sunken);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-sm);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    transition: var(--tao-transition-base);
}

.tao-input-group__addon--before {
    border-right: 0;
    border-radius: var(--tao-radius-control) 0 0 var(--tao-radius-control);
}

.tao-input-group__addon--after {
    border-left: 0;
    border-radius: 0 var(--tao-radius-control) var(--tao-radius-control) 0;
}

.tao-input-group__field:not(:first-child) :deep(.tao-input-shell) {
    border-left: 0;
}

.tao-input-group__field:not(:last-child) :deep(.tao-input-shell) {
    border-right: 0;
}

.tao-input-group__field:first-child :deep(.tao-input-shell) {
    border-radius: var(--tao-radius-control) 0 0 var(--tao-radius-control);
}

.tao-input-group__field:last-child :deep(.tao-input-shell) {
    border-radius: 0 var(--tao-radius-control) var(--tao-radius-control) 0;
}

.tao-input-group__field:only-child :deep(.tao-input-shell) {
    border-radius: var(--tao-radius-control);
}

.tao-input-group--focused .tao-input-group__addon,
.tao-input-group--focused :deep(.tao-input-shell) {
    border-color: var(--tao-color-accent);
}

.tao-input-group:has(.tao-input-shell--invalid) .tao-input-group__addon,
.tao-input-group:has(.tao-input-shell--invalid) :deep(.tao-input-shell) {
    border-color: var(--tao-color-danger);
}

.tao-input-group__addon:has(.tao-button) {
    padding: 0;
    background: transparent;
}

.tao-input-group__addon :deep(.tao-button) {
    align-self: stretch;
    height: auto;
    border: none;
    border-radius: 0 var(--tao-radius-control) var(--tao-radius-control) 0;
}

.tao-input-group__addon--before :deep(.tao-button) {
    border-radius: var(--tao-radius-control) 0 0 var(--tao-radius-control);
}

.tao-input-group__addon :deep(.tao-button:focus-visible) {
    outline-offset: -2px;
}
</style>
