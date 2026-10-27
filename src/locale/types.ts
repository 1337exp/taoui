import type { TaoStageStatus } from '../stage';

/**
 * Every built-in text of the library. Keys repeat prop names: `locale.select.placeholder`
 * is the default of TaoSelect `placeholder`; a prop passed by hand always wins.
 *
 * Все встроенные тексты библиотеки. Ключи повторяют имена пропсов: `locale.select.placeholder` —
 * значение по умолчанию для `placeholder` у TaoSelect; переданный руками проп всегда главнее.
 */
export interface TaoLocale {
    /** BCP 47 tag for dates (Intl), e.g. `ru-RU`, `en-US`. / Тег языка для дат. */
    code: string;
    alert: { closeLabel: string };
    avatar: {
        fallbackLabel: string;
        /** `{count}` — the number in the badge. / число в бейдже. */
        notificationsLabel: string;
        dotLabels: Record<'success' | 'danger' | 'warning' | 'info' | 'neutral', string>;
    };
    breadcrumb: { ariaLabel: string };
    card: { closeLabel: string };
    carousel: {
        ariaLabel: string;
        prevLabel: string;
        nextLabel: string;
        dotsLabel: string;
        pauseLabel: string;
        playLabel: string;
        /** `{n}`, `{count}`. */
        slideLabel: string;
    };
    combobox: {
        placeholder: string;
        emptyText: string;
        clearText: string;
        /** Row that adds a new value; `{text}` — what was typed. / Строка «добавить»; `{text}` — введённое. */
        createText: string;
    };
    confirm: { ok: string; cancel: string };
    copy: { copyLabel: string; successText: string };
    date: { placeholder: string; todayText: string; clearText: string; prevMonthLabel: string; nextMonthLabel: string };
    dateRange: {
        placeholder: string;
        todayText: string;
        clearText: string;
        prevMonthLabel: string;
        nextMonthLabel: string;
    };
    drawer: { closeLabel: string };
    dropdownMenu: { menuLabel: string };
    menubar: { ariaLabel: string };
    nav: { ariaLabel: string; moreLabel: string };
    tree: { ariaLabel: string; loadingLabel: string };
    contextMenu: { menuLabel: string };
    empty: { title: string };
    fileDrop: {
        clearLabel: string;
        /** `{name}` — file name. / имя файла. */
        removeLabel: string;
        /** Default text inside the zone. / Текст зоны по умолчанию. */
        zoneText: string;
        /** Bytes, kilobytes, megabytes. / Байты, килобайты, мегабайты. */
        units: [string, string, string];
        decimalSeparator: string;
    };
    inputNumber: { incrementLabel: string; decrementLabel: string };
    list: { emptyText: string };
    modal: { closeLabel: string };
    pagination: {
        ariaLabel: string;
        prevLabel: string;
        nextLabel: string;
        /** `{page}`. */
        pageLabel: string;
        /** `{n}` — pages skipped by «…». / сколько страниц перескакивает «…». */
        jumpPrevLabel: string;
        jumpNextLabel: string;
        /** `{from}`, `{to}`, `{total}`. */
        totalText: string;
        /** When there are no rows. / Когда строк нет. */
        emptyTotalText: string;
    };
    quantity: { decrementLabel: string; removeLabel: string; incrementLabel: string };
    scrollTop: { ariaLabel: string };
    select: { placeholder: string; clearText: string };
    stages: { ariaLabel: string; statusLabels: Record<TaoStageStatus, string> };
    table: { emptyText: string };
    tag: { closeLabel: string };
    colorPicker: {
        /** Square of saturation and brightness. / Квадрат насыщенности и яркости. */
        areaLabel: string;
        hueLabel: string;
        alphaLabel: string;
        hexLabel: string;
        /** Switch of the input mode (HEX, RGB, HSL). / Переключатель способа ввода. */
        modeLabel: string;
        swatchesLabel: string;
        eyedropperLabel: string;
        /** Trigger of TaoColorInput. / Кнопка TaoColorInput. */
        chooseLabel: string;
    };
    scrubber: { playLabel: string; pauseLabel: string; restartLabel: string };
    toast: { closeLabel: string };
}

type DeepPartial<T> = T extends string | unknown[] ? T : { [K in keyof T]?: DeepPartial<T[K]> };

/** Any subset of a locale, at any depth; the rest comes from the base. / Любая часть локали на любой глубине; остальное — из базовой. */
export type TaoLocaleOverrides = DeepPartial<TaoLocale>;
