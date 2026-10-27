<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { TaoSize } from '../size';
import { toneClass, type TaoTone } from '../tone';
import { useLocaleText, useTaoLocale } from '../locale';

defineOptions({ name: 'TaoAvatar' });

const appLocale = useTaoLocale();

type TaoAvatarDot = TaoTone;

const props = withDefaults(
    defineProps<{
        src?: string;
        name?: string;
        alt?: string;
        /**
         * 24 / 32 / 48px. Content, not a control: does not inherit the size of ancestors.
         * Контент, не контрол: размер предков не наследует. `s` / `m` / `l` устарели.
         */
        size?: TaoSize;
        /** Точка статуса. `true` = success (в сети). */
        dot?: boolean | TaoAvatarDot;
        /** Счётчик в углу. 0 и пустое не рисуются, больше 99 — «99+». */
        count?: number | string;
        fallbackLabel?: string;
        /** `{count}` — число в бейдже. */
        notificationsLabel?: string;
        dotLabels?: Partial<Record<TaoAvatarDot, string>>;
    }>(),
    {
        src: '',
        name: '',
        alt: '',
        size: 'medium',
        dot: false,
        count: undefined,
        dotLabels: () => ({}),
    },
);
const l10n = useLocaleText(props, 'avatar');

const sizeClass = computed(() => {
    if (props.size === 'small') {
        return 's';
    }
    if (props.size === 'large') {
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

const dotTone = computed((): TaoAvatarDot | null => {
    if (!props.dot) {
        return null;
    }
    if (props.dot === true) {
        return 'success';
    }
    return props.dot;
});

const badge = computed(() => {
    if (props.count === undefined || props.count === '') {
        return '';
    }
    const numeric = typeof props.count === 'number' ? props.count : Number(props.count);
    if (Number.isFinite(numeric)) {
        if (numeric <= 0) {
            return '';
        }
        return numeric > 99 ? '99+' : String(numeric);
    }
    return String(props.count);
});

const label = computed(() => {
    const base = props.alt || props.name || l10n.value.fallbackLabel;
    const extra: string[] = [];
    if (dotTone.value) {
        extra.push(props.dotLabels[dotTone.value] ?? appLocale.value.avatar.dotLabels[dotTone.value]);
    }
    if (badge.value) {
        extra.push(l10n.value.notificationsLabel.replace('{count}', badge.value));
    }
    return extra.length ? `${base}, ${extra.join(', ')}` : base;
});

const imgFailed = ref(false);
const showImage = computed(() => Boolean(props.src) && !imgFailed.value);

watch(
    () => props.src,
    () => {
        imgFailed.value = false;
    },
);

function onImgError() {
    imgFailed.value = true;
}

</script>

<template>
    <span class="tao-avatar" :class="`tao-avatar--${sizeClass}`" :title="label">
        <span class="tao-avatar__face">
            <img v-if="showImage" class="tao-avatar__img" :src="src" :alt="label" @error="onImgError" />
            <span v-else class="tao-avatar__fallback" :aria-label="label">{{ initials || '?' }}</span>
        </span>
        <span
            v-if="dotTone"
            class="tao-avatar__dot"
            :class="toneClass(dotTone)"
            aria-hidden="true"
        ></span>
        <span v-if="badge" class="tao-avatar__badge" aria-hidden="true">{{ badge }}</span>
    </span>
</template>

<style scoped>
.tao-avatar {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    user-select: none;
}

.tao-avatar__face {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background: var(--tao-color-accent-subtle);
    color: var(--tao-color-accent);
    border-radius: var(--tao-radius-full);
    font-weight: 600;
    line-height: 1;
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

.tao-avatar__dot {
    position: absolute;
    right: -1px;
    bottom: -1px;
    box-sizing: border-box;
    border: 2px solid var(--tao-color-bg);
    border-radius: var(--tao-radius-full);
    background: var(--tao-tone);
}

.tao-avatar--s .tao-avatar__dot {
    width: 8px;
    height: 8px;
    border-width: 1px;
}

.tao-avatar--m .tao-avatar__dot {
    width: 10px;
    height: 10px;
}

.tao-avatar--l .tao-avatar__dot {
    width: 12px;
    height: 12px;
}

.tao-avatar__badge {
    position: absolute;
    top: -6px;
    right: -6px;
    z-index: 1;
    box-sizing: border-box;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--tao-color-bg);
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-danger);
    color: var(--tao-color-on-danger);
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
}

.tao-avatar--s .tao-avatar__badge {
    top: -5px;
    right: -5px;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    font-size: 9px;
}

.tao-avatar--l .tao-avatar__badge {
    min-width: 18px;
    height: 18px;
    font-size: 11px;
}
</style>
