<script lang="ts" setup>
import { provide } from 'vue';
import { spoilerGroupKey, type TaoSpoilerName } from '../spoiler';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoSpoilerGroup' });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoSpoilerGroup', { onChange: 'use `v-model` (`update:modelValue`): `change` is not emitted' });

const emit = defineEmits<{
}>();

// the open panel: `v-model` when the parent keeps it, a state of its own when it does not
// открытая панель: `v-model`, если её держит родитель, и собственное состояние, если нет
const model = defineModel<TaoSpoilerName | null>({ default: null });

function setOpen(name: TaoSpoilerName | null) {
    model.value = name;
}

provide(spoilerGroupKey, {
    model,
    setOpen,
});
</script>

<template>
    <div class="tao-spoiler-group">
        <slot />
    </div>
</template>

<style scoped>
.tao-spoiler-group {
    overflow: hidden;
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-panel);
}

.tao-spoiler-group :deep(.tao-spoiler) {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid var(--tao-color-border);
}

.tao-spoiler-group :deep(.tao-spoiler:last-child) {
    border-bottom: none;
}
</style>
