/**
 * Picks, out of the languages your app has, the one the user would like most. The user's wishes are
 * `navigator.languages` (the browser) or a list you give (the `Accept-Language` of a request, on the server). A tag matches
 * a supported one exactly (`ru-RU` and `ru-ru`), or by its language (`ru-RU` asks for `ru`; `en` is answered by `en-GB`).
 * Выбирает из языков вашего приложения тот, что пользователь хотел бы больше всего. Пожелания пользователя — это
 * `navigator.languages` (браузер) или список, который вы дадите (`Accept-Language` запроса на сервере). Тег подходит
 * поддерживаемому точно (`ru-RU` и `ru-ru`) или по языку (`ru-RU` просит `ru`; на `en` отвечает `en-GB`).
 */

const language = (tag: string) => tag.toLowerCase().split(/[-_]/)[0] ?? '';

/**
 * The best of `supported` for the wishes in `requested` (most wanted first), or `fallback` (the first of `supported` by
 * default). Pure: the same wishes always give the same answer, on the server too.
 * Лучший из `supported` для пожеланий `requested` (самое желаемое первым) либо `fallback` (по умолчанию первый из
 * `supported`). Чистая: одни и те же пожелания всегда дают один ответ, и на сервере тоже.
 */
export function matchTaoLanguage(requested: readonly string[], supported: readonly string[], fallback: string = supported[0] ?? ''): string {
    // wish by wish, the first wish first: its exact tag, else a tag of its language
    // желание за желанием, первое первым: его точный тег, иначе тег его языка
    for (const wish of requested) {
        const found = supported.find((tag) => tag.toLowerCase() === wish.toLowerCase()) ?? supported.find((tag) => language(tag) === language(wish));
        if (found) {
            return found;
        }
    }
    return fallback;
}

/**
 * The tags of an `Accept-Language` header, the most wanted first (`ru-RU,ru;q=0.9,en;q=0.8`); `*` and `q=0` are left out.
 * Теги заголовка `Accept-Language`, самый желаемый первым; `*` и `q=0` отбрасываются.
 */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
    if (!header) {
        return [];
    }
    return header
        .split(',')
        .map((part, index) => {
            const [tag = '', ...params] = part.trim().split(';');
            const q = params.map((p) => /^\s*q\s*=\s*([\d.]+)\s*$/.exec(p)?.[1]).find((v) => v !== undefined);
            return { tag: tag.trim(), q: q === undefined ? 1 : Number(q), index };
        })
        .filter((entry) => entry.tag && entry.tag !== '*' && entry.q > 0)
        .sort((a, b) => b.q - a.q || a.index - b.index)
        .map((entry) => entry.tag);
}

export interface DetectTaoLanguageOptions {
    /** What to answer when nothing matches; the first of `supported` by default. / Что ответить, если ничего не подошло. */
    fallback?: string;
    /** The wishes, instead of `navigator.languages`: for the server, or for a language you got yourself. / Пожелания вместо `navigator.languages`. */
    requested?: readonly string[];
}

/**
 * The language of the user, one of `supported`: `detectTaoLanguage(['en', 'ru'])`. In a browser it reads `navigator.languages`; where
 * there is none (a server) it answers `fallback`, unless you pass `requested`. It only answers: it does not change the language of the
 * components (`setTaoLocale` does) and does not remember anything. Typical use: `saved ?? detectTaoLanguage(['en', 'ru'])`.
 * Язык пользователя, один из `supported`. В браузере читает `navigator.languages`; где его нет (сервер), отвечает `fallback`, если не
 * передать `requested`. Только отвечает: язык компонентов не меняет (это делает `setTaoLocale`) и ничего не запоминает.
 */
export function detectTaoLanguage(supported: readonly string[], options: DetectTaoLanguageOptions = {}): string {
    const browser = typeof navigator !== 'undefined' ? [...(navigator.languages?.length ? navigator.languages : [navigator.language])] : [];
    return matchTaoLanguage(options.requested ?? browser.filter(Boolean), supported, options.fallback);
}
