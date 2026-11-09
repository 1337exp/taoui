import type { TaoStageStatus } from '../stage';

/**
 * Every built-in text of the library. Keys repeat prop names: `locale.select.placeholder`
 * is the default of TaoSelect `placeholder`; a prop passed by hand always wins.
 *
 * Все встроенные тексты библиотеки. Ключи повторяют имена пропсов: `locale.select.placeholder` —
 * значение по умолчанию для `placeholder` у TaoSelect; переданный руками проп всегда главнее.
 */
/**
 * A text that depends on a number: one form per plural category of the language (`one`, `few`, `many`, `other`…,
 * as `Intl.PluralRules` names them). Only `other` is required; a form that is missing falls back to it.
 * Текст, зависящий от числа: по форме на каждую категорию множественного числа языка (`one`, `few`, `many`, `other`…,
 * как их называет `Intl.PluralRules`). Обязательна только `other`; недостающая форма заменяется ею.
 */
export interface TaoPluralForms {
    other: string;
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
}

/** A text: a plain string (the same for every number) or plural forms. / Текст: просто строка (одна на любое число) или формы множественного числа. */
export type TaoText = string | TaoPluralForms;

export interface TaoLocale {
    /** BCP 47 tag for dates (Intl), e.g. `ru-RU`, `en-US`. / Тег языка для дат. */
    code: string;
    alert: { closeLabel: string; detailsLabel: string };
    /** What a screen reader hears when the status of TaoPinCode changes. / Что слышит скринридер при смене статуса. */
    pinCode: {
        successText: string;
        errorText: string;
        /** `{n}` of `{count}`: the name of one cell (5.8.4; optional for locales written before). / имя одной клетки */
        cellLabel?: string;
    };
    avatar: {
        fallbackLabel: string;
        /** `{count}` — the number in the badge. A string or plural forms. / число в бейдже. Строка или формы числа. */
        notificationsLabel: TaoText;
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
    /** The button says what a click does. / Кнопка говорит, что сделает клик. */
    /** `{n}` of `{count}` in `progressLabel`. / `{n}` из `{count}` в `progressLabel`. */
    tour: { nextLabel: string; prevLabel: string; skipLabel: string; doneLabel: string; progressLabel: string };
    presetInput: { nextLabel: string; prevLabel: string };
    themeToggle: { toLightLabel: string; toDarkLabel: string; toSystemLabel: string };
    loader: { label: string };
    date: {
        placeholder: string;
        todayText: string;
        clearText: string;
        prevMonthLabel: string;
        nextMonthLabel: string;
        /**
         * The calendar button of an `editable` TaoDate (5.6). Optional, so a locale written before it still type-checks;
         * without it the English text is used.
         * Кнопка календаря у `editable` TaoDate (5.6). Необязательна, чтобы локаль, написанная раньше, проходила типы.
         */
        calendarLabel?: string;
    };
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
    /** `counterText`: `{checked}`, `{total}`. */
    checklist: { selectAllLabel: string; counterText: string };
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
    toolbar: { overflowLabel: string };
    pagination: {
        ariaLabel: string;
        prevLabel: string;
        nextLabel: string;
        /** `{page}`. */
        pageLabel: string;
        /** `{n}` — pages skipped by «…». A string or plural forms. / сколько страниц перескакивает «…». Строка или формы числа. */
        jumpPrevLabel: TaoText;
        jumpNextLabel: TaoText;
        /** The text before the page field. / Текст перед полем страницы. */
        goToText: string;
        /** `{count}` — the number of pages. / число страниц. */
        goToLabel: string;
        /** The caption of the page size choice (5.7); optional for locales written before. / Подпись выбора размера страницы. */
        perPageText?: string;
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
        /** What the field of TaoColorInput says while it has no colour (an empty value). / Что говорит поле TaoColorInput, пока цвета нет (пустое значение). */
        placeholder: string;
        /** The button that empties an optional colour (`clearable`). / Кнопка, очищающая необязательный цвет (`clearable`). */
        clearText: string;
    };
    scrubber: { playLabel: string; pauseLabel: string; restartLabel: string };
    /** The field of an `editable` slider. / Поле слайдера с `editable`. */
    slider: { editLabel: string };
    toast: { closeLabel: string };
}

type DeepPartial<T> = T extends string | unknown[] ? T : { [K in keyof T]?: DeepPartial<T[K]> };

/** Any subset of a locale, at any depth; the rest comes from the base. / Любая часть локали на любой глубине; остальное — из базовой. */
export type TaoLocaleOverrides = DeepPartial<TaoLocale>;
