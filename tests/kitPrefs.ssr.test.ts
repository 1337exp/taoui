// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { afterEach, describe, expect, it } from 'vitest';
import { createKitPrefs } from '../src/kitPrefs';
import { localeEn, localeRu, setTaoLocale, taoLocale, useTaoLocale } from '../src/locale';

// On the server one module serves every request: the language of a request goes to its own tree, never into the global locale.
// На сервере один модуль обслуживает все запросы: язык запроса уходит в его собственное дерево, а не в глобальную локаль.

afterEach(() => setTaoLocale(localeEn));

// the language is provided to the tree below the component that calls createKitPrefs (the root of the app, as in a real one)
// язык выдаётся дереву ниже компонента, который зовёт createKitPrefs (корень приложения, как в настоящем)
const Page = defineComponent({
    setup() {
        const locale = useTaoLocale();
        return () => h('p', locale.value.select.placeholder);
    },
});

function app(code: string) {
    return createSSRApp(
        defineComponent({
            setup() {
                createKitPrefs({ storage: null, locale: code, locales: { en: localeEn, ru: localeRu } });
                return () => h(Page);
            },
        }),
    );
}

describe('createKitPrefs on the server', () => {
    it('each request gets its own language and the global locale is not touched', async () => {
        const a = await renderToString(app('ru'));
        // a request in Russian must not leave the next request (and the whole process) in Russian
        expect(taoLocale().code).toBe(localeEn.code);
        const b = await renderToString(app('en'));
        expect(a).toContain(localeRu.select.placeholder);
        expect(b).toContain(localeEn.select.placeholder);
    });
});
