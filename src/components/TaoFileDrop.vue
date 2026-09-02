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
    /** Имена выбранных файлов под зоной. Снять файл — сразу в `v-model`. */
    list?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    size: 'medium',
    accept: '*',
    multiple: false,
    showClear: false,
    list: true,
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

function sameFile(a: File, b: File) {
    return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

function commit(files: File[]) {
    emit('update:modelValue', files);
    emit('files', files);
}

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

function removeAt(index: number) {
    commit(props.modelValue.filter((_, item) => item !== index));
}

function processFiles(fileList: FileList) {
    const incoming = Array.from(fileList);
    if (!incoming.length) {
        return;
    }

    let result: File[];
    if (!props.multiple) {
        result = [incoming[0]!];
    } else {
        result = [...props.modelValue];
        for (const file of incoming) {
            if (!result.some((item) => sameFile(item, file))) {
                result.push(file);
            }
        }
    }

    commit(result);

    const el = fileInput.value;
    if (el) {
        el.type = 'text';
        el.type = 'file';
    }
}

function formatSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} Б`;
    }
    const kb = bytes / 1024;
    if (kb < 1024) {
        const value = kb < 10 ? kb.toFixed(1) : String(Math.round(kb));
        return `${value.replace('.', ',')} КБ`;
    }
    const mb = kb / 1024;
    const value = mb < 10 ? mb.toFixed(1) : String(Math.round(mb));
    return `${value.replace('.', ',')} МБ`;
}

function fileKey(file: File, index: number) {
    return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}
</script>

<template>
    <div class="tao-file-drop">
        <div class="tao-file-drop__row">
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

        <ul v-if="list && modelValue.length" class="tao-file-drop__list">
            <li v-for="(file, index) in modelValue" :key="fileKey(file, index)" class="tao-file-drop__file">
                <span class="tao-file-drop__name">{{ file.name }}</span>
                <span class="tao-file-drop__meta">{{ formatSize(file.size) }}</span>
                <button
                    type="button"
                    class="tao-file-drop__remove"
                    :aria-label="`Убрать «${file.name}»`"
                    @click="removeAt(index)"
                >
                    ✕
                </button>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.tao-file-drop {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
    user-select: none;
}

.tao-file-drop__row {
    display: flex;
    gap: var(--tao-space-3);
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

.tao-file-drop__list {
    margin: 0;
    padding: 0;
    overflow: hidden;
    list-style: none;
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-control);
}

.tao-file-drop__file {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    min-width: 0;
    min-height: 36px;
    padding: 0 var(--tao-space-2) 0 var(--tao-space-3);
    border-bottom: 1px solid var(--tao-color-border);
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text);
}

.tao-file-drop__file:last-child {
    border-bottom: none;
}

.tao-file-drop__name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    font-size: var(--tao-font-size-sm);
    text-overflow: ellipsis;
    white-space: nowrap;
    user-select: text;
}

.tao-file-drop__meta {
    flex-shrink: 0;
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-text-muted);
}

.tao-file-drop__remove {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: var(--tao-radius-sm);
    background: none;
    color: var(--tao-color-text-muted);
    font: inherit;
    font-size: var(--tao-font-size-sm);
    line-height: 1;
    cursor: pointer;
}

.tao-file-drop__remove:hover {
    color: var(--tao-color-danger);
    background: var(--tao-color-danger-subtle);
}

.tao-file-drop__remove:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}
</style>
