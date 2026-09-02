<script lang="ts" setup>
import { ref } from 'vue';

defineOptions({ name: 'TaoFileDrop' });

interface Props {
    /** Текущий список файлов — компонент сам не хранит состояние
     * количества файлов, оно всегда отражает то, что передал родитель.
     * Это и даёт возможность подтверждения: родитель решает, когда
     * именно менять modelValue (сразу или после ответа в модалке). */
    modelValue?: File[];
    size?: 'small' | 'medium' | 'large';
    accept?: string;
    multiple?: boolean;
    showClear?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    size: 'medium',
    accept: '*',
    multiple: false,
    showClear: false,
});

const emit = defineEmits<{
    'update:modelValue': [files: File[]];
    files: [files: File[]];
    /** Запрос на очистку — компонент НЕ очищает себя сам. Родитель решает:
     * очистить сразу (emit → v-model = []) или сперва показать модалку
     * подтверждения и очистить только после ответа пользователя. */
    'clear-request': [];
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging.value = true;
}

function handleDragLeave() {
    isDragging.value = false;
}

function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging.value = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        processFiles(files);
    }
}

function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        processFiles(input.files);
    }
}

function requestClear() {
    emit('clear-request');
}

function processFiles(fileList: FileList) {
    const files = Array.from(fileList);
    const result = !props.multiple && files.length > 1 ? [files[0]!] : files;

    emit('update:modelValue', result);
    emit('files', result);

    // сбрасываем input, чтобы повторный выбор того же файла тоже сработал
    const el = fileInput.value;
    if (el) {
        el.type = 'text';
        el.type = 'file';
    }
}
</script>

<template>
    <div class="tao-file-drop">
        <button
            v-if="showClear && modelValue.length"
            type="button"
            class="tao-file-drop__clear"
            aria-label="Очистить файлы"
            @click="requestClear"
        >
            ✕
        </button>

        <label
            class="tao-file-drop__zone"
            :class="[`tao-file-drop__zone--${size}`, { 'tao-file-drop__zone--dragging': isDragging }]"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
        >
            <slot>Перетащите файл сюда или нажмите, чтобы выбрать</slot>

            <input
                ref="fileInput"
                class="tao-sr-only"
                type="file"
                :accept="accept"
                :multiple="multiple"
                @change="handleFileSelect"
                @click.stop
            />
        </label>
    </div>
</template>

<style scoped>
.tao-file-drop {
    display: flex;
    gap: var(--tao-space-3);
    user-select: none;
}

.tao-file-drop__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    text-align: center;
    border: 2px dashed var(--tao-color-danger);
    border-radius: var(--tao-radius-panel);
    color: var(--tao-color-danger);
    background-color: var(--tao-color-danger-subtle);
    cursor: pointer;
    font-family: inherit;
    transition: var(--tao-transition-base);
}

.tao-file-drop__clear:hover {
    background-color: color-mix(in srgb, var(--tao-color-danger) 22%, transparent);
}

.tao-file-drop__zone {
    flex-grow: 1;
    font-size: var(--tao-font-size-sm);
    font-family: var(--tao-font-family);
    letter-spacing: 0.01rem;
    text-align: center;
    color: var(--tao-color-text-muted);
    border: 2px dashed var(--tao-color-border-strong);
    border-radius: var(--tao-radius-panel);
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-file-drop__zone:hover,
.tao-file-drop__zone:focus-within {
    background-color: var(--tao-color-accent-subtle);
    border-color: var(--tao-color-accent);
}

.tao-file-drop__zone--dragging {
    border-color: var(--tao-color-text-strong);
    background-color: var(--tao-color-surface-sunken);
}

.tao-file-drop__zone--small {
    padding: var(--tao-space-5) var(--tao-space-4);
}

.tao-file-drop__zone--medium {
    padding: var(--tao-space-8) var(--tao-space-5);
}

.tao-file-drop__zone--large {
    padding: var(--tao-space-10) var(--tao-space-6);
}
</style>
