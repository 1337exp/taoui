import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import TaoAvatar from '../src/components/TaoAvatar.vue';
import TaoPagination from '../src/components/TaoPagination.vue';
import { detectTaoLanguage, formatText, localeEn, localeRu, matchTaoLanguage, parseAcceptLanguage, setTaoLocale } from '../src/locale';

// 5.27.0: a text may be plural forms; the language of the user can be asked for.
// 5.27.0: текст может быть формами множественного числа; язык пользователя можно спросить.

afterEach(() => setTaoLocale(localeEn));

describe('plural forms in a text', () => {
    const files = { one: '{count} файл', few: '{count} файла', many: '{count} файлов', other: '{count} файла' };

    it('a plain string is the same for every number, as before', () => {
        expect(formatText('{count} files', { count: 1 })).toBe('1 files');
        expect(formatText('Slide {n} of {count}', { n: 2, count: 5 })).toBe('Slide 2 of 5');
    });

    it('forms are chosen by the plural rules of the language', () => {
        const pick = (n: number) => formatText(files, { count: n }, 'ru-RU');
        expect([1, 2, 5, 11, 21, 22, 25].map(pick)).toEqual(['1 файл', '2 файла', '5 файлов', '11 файлов', '21 файл', '22 файла', '25 файлов']);
        expect(formatText({ one: '{count} file', other: '{count} files' }, { count: 1 }, 'en-US')).toBe('1 file');
        expect(formatText({ one: '{count} file', other: '{count} files' }, { count: 2 }, 'en-US')).toBe('2 files');
    });

    it('the number is count, or n; a form that is missing is other; no number is other', () => {
        expect(formatText({ one: '{n} page', other: '{n} pages' }, { n: 1 }, 'en')).toBe('1 page');
        expect(formatText({ other: '{count} things' }, { count: 1 }, 'en')).toBe('1 things');
        expect(formatText({ one: 'one', other: 'many {count}' }, { count: '99+' }, 'en')).toBe('many 99+');
    });

    it('a tag Intl does not know does not break it', () => {
        expect(formatText({ one: 'one', other: 'other' }, { count: 1 }, 'x-nonsense-tag-that-is-not-valid')).toMatch(/one|other/);
    });

    it('without a code it follows the language in effect', () => {
        setTaoLocale(localeRu);
        expect(formatText(files, { count: 5 })).toBe('5 файлов');
    });
});

describe('the built-in texts that depend on a number', () => {
    it('the badge of an avatar: 1 notification, 5 notifications, in both languages', () => {
        const label = (count: number) => mount(TaoAvatar, { props: { name: 'A', count } }).attributes('title');
        expect(label(1)).toContain('1 notification');
        expect(label(1)).not.toContain('1 notifications');
        expect(label(5)).toContain('5 notifications');
        setTaoLocale(localeRu);
        expect(label(1)).toContain('1 уведомление');
        expect(label(3)).toContain('3 уведомления');
        expect(label(5)).toContain('5 уведомлений');
    });

    it('a string given by hand still works', () => {
        const wrapper = mount(TaoAvatar, { props: { name: 'A', count: 4, notificationsLabel: '{count} new' } });
        expect(wrapper.attributes('title')).toContain('4 new');
    });

    it('the jump buttons of a pager say pages in the right form', () => {
        const labels = (jump: number) => mount(TaoPagination, { props: { page: 10, total: 1000, pageSize: 10, jump } }).findAll('[aria-label]').map((n) => n.attributes('aria-label')!);
        expect(labels(5)).toContain('Back 5 pages');
        setTaoLocale(localeRu);
        expect(labels(5)).toContain('Назад на 5 страниц');
        expect(labels(3)).toContain('Назад на 3 страницы');
    });
});

describe('matchTaoLanguage', () => {
    it('exact, then by language, in the order of the wishes', () => {
        expect(matchTaoLanguage(['ru-RU', 'en'], ['en', 'ru'])).toBe('ru');
        expect(matchTaoLanguage(['en-GB'], ['ru', 'en'])).toBe('en');
        expect(matchTaoLanguage(['en'], ['ru', 'en-GB'])).toBe('en-GB');
        expect(matchTaoLanguage(['pt-BR', 'de-AT'], ['de', 'ru'])).toBe('de');
        expect(matchTaoLanguage(['RU-ru'], ['en', 'ru-RU'])).toBe('ru-RU');
    });

    it('an exact tag beats a language match of an earlier wish', () => {
        expect(matchTaoLanguage(['en-US', 'ru'], ['ru', 'en-GB', 'en-US'])).toBe('en-US');
    });

    it('nothing fits: the fallback, or the first supported', () => {
        expect(matchTaoLanguage(['ja'], ['en', 'ru'])).toBe('en');
        expect(matchTaoLanguage(['ja'], ['en', 'ru'], 'ru')).toBe('ru');
        expect(matchTaoLanguage([], [])).toBe('');
    });
});

describe('parseAcceptLanguage', () => {
    it('orders by weight, keeps the order of equals, drops * and q=0', () => {
        expect(parseAcceptLanguage('ru-RU,ru;q=0.9,en;q=0.8,*;q=0.1')).toEqual(['ru-RU', 'ru', 'en']);
        expect(parseAcceptLanguage('en;q=0.5, de, fr;q=0')).toEqual(['de', 'en']);
        expect(parseAcceptLanguage('')).toEqual([]);
        expect(parseAcceptLanguage(undefined)).toEqual([]);
    });
});

describe('detectTaoLanguage', () => {
    it('reads the browser, or the wishes you give; no wishes: the fallback', () => {
        expect(detectTaoLanguage(['en', 'ru'], { requested: ['ru-RU'] })).toBe('ru');
        expect(detectTaoLanguage(['en', 'ru'], { requested: [], fallback: 'ru' })).toBe('ru');
        expect(['en', 'ru']).toContain(detectTaoLanguage(['en', 'ru']));
    });

    it('works with the Accept-Language of a request', () => {
        expect(detectTaoLanguage(['en', 'ru'], { requested: parseAcceptLanguage('ru,en;q=0.5') })).toBe('ru');
    });
});
