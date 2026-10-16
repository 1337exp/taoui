import { camelize, getCurrentInstance } from 'vue';

// Replaced by the app's bundler (Vite, webpack); the library build leaves it as is.
// Заменяет сборщик приложения (Vite, webpack); сборка библиотеки оставляет как есть.
declare const process: { env: { NODE_ENV?: string } };

function isDev(): boolean {
    try {
        return process.env.NODE_ENV !== 'production';
    } catch {
        // plain <script type="module"> without a bundler / без сборщика
        return false;
    }
}

const warned = new Set<string>();

/**
 * One console warning per component + name, dev builds only.
 * Одно предупреждение на компонент + имя, только в dev-сборке.
 */
export function deprecationWarning(component: string, what: string, instead: string) {
    if (!isDev()) {
        return;
    }

    const key = `${component}:${what}`;
    if (warned.has(key)) {
        return;
    }
    warned.add(key);
    console.warn(`[TaoUI] ${component}: ${what} is deprecated — ${instead}. It will be removed in 3.0.`);
}

/**
 * Warns about deprecated props and listeners the parent actually passed (defaults do not count).
 * Keys are camelCase prop names or `onEvent` listener names; values say what to use instead.
 * Call from `setup`.
 *
 * Предупреждает об устаревших пропсах и обработчиках, которые родитель реально передал (дефолты не считаются).
 * Ключи — имена пропсов в camelCase или `onEvent`; значения — чем заменить. Вызывать из `setup`.
 */
export function warnDeprecated(component: string, replacements: Record<string, string>) {
    if (!isDev()) {
        return;
    }

    const passed = getCurrentInstance()?.vnode.props;
    if (!passed) {
        return;
    }

    const names = new Set(Object.keys(passed).map((name) => camelize(name)));
    for (const [name, instead] of Object.entries(replacements)) {
        if (!names.has(name)) {
            continue;
        }
        const isListener = /^on[A-Z]/.test(name);
        const label = isListener ? `event "${name[2]!.toLowerCase()}${name.slice(3)}"` : `prop "${name}"`;
        deprecationWarning(component, label, instead);
    }
}
