/**
 * The light / dark mode of a page, as the attributes the themes read: `data-tao-mode` is the mode, `data-tao-theme`
 * is a palette, or the older spelling of the mode (`dark` / `light`) of the default theme.
 * Светлый / тёмный режим страницы в виде атрибутов, которые читают темы: `data-tao-mode` — режим, `data-tao-theme` —
 * палитра либо старая запись режима (`dark` / `light`) темы по умолчанию.
 */
export type TaoMode = 'dark' | 'light';

/** The mode an element is in: `data-tao-mode`, else the old `data-tao-theme="light"`, else dark (the default). / Режим элемента. */
export function readTaoMode(el: Element): TaoMode {
    const mode = el.getAttribute('data-tao-mode');
    if (mode === 'light' || mode === 'dark') {
        return mode;
    }
    return el.getAttribute('data-tao-theme') === 'light' ? 'light' : 'dark';
}

/**
 * Puts an element into a mode. A palette (`data-tao-theme="lagoon"`) is kept: it has a light twin under the same name;
 * the old `dark` / `light` spelling of the default theme follows the mode, so the two attributes never disagree.
 * Переводит элемент в режим. Палитра сохраняется (у неё есть светлая пара под тем же именем); старая запись `dark` /
 * `light` темы по умолчанию идёт за режимом, чтобы два атрибута не спорили.
 */
export function applyTaoMode(el: Element, mode: TaoMode): void {
    el.setAttribute('data-tao-mode', mode);
    const theme = el.getAttribute('data-tao-theme');
    if (theme === 'dark' || theme === 'light') {
        el.setAttribute('data-tao-theme', mode);
    }
}
