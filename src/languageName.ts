/** A language: its code, and its name when the engine's autonym is not what you want. / Язык: код и, если автоним движка не годится, название. */
export interface TaoLanguageOption {
    code: string;
    label?: string;
}

/**
 * The name of a language in that language itself (an autonym): `ru` → `Русский`, `en` → `English`, `pt-BR` → `Português (Brasil)`.
 * It comes from the engine (`Intl.DisplayNames`), so there is no table to keep; where the engine does not know the code (or has
 * no `Intl.DisplayNames`) the code in capitals is the name. The first letter is capitalised: a list of names reads as a list.
 * Название языка на нём самом (автоним): `ru` → `Русский`, `en` → `English`. Берётся у движка (`Intl.DisplayNames`), таблицу
 * вести не нужно; где движок код не знает (или нет `Intl.DisplayNames`), названием служит код заглавными. Первая буква
 * заглавная: список названий читается как список.
 */
export function taoLanguageName(code: string): string {
    try {
        const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
        if (name && name.toLowerCase() !== code.toLowerCase()) {
            return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
        }
    } catch {
        // a malformed tag or an engine without DisplayNames: the code stands for the name
        // кривой тег или движок без DisplayNames: названием служит код
    }
    return code.toUpperCase();
}
