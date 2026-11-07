import { describe, expect, it } from 'vitest';
// @ts-expect-error showcase data modules are plain JS
import { bookById, bookOfSection, books } from '../showcase/books/index.js';
// @ts-expect-error Vite `?raw` import: the pages map as text (it imports .vue files, which a unit test does not compile)
import componentsSections from '../showcase/books/components.sections.js?raw';
// @ts-expect-error Vite `?raw` import
import demosSections from '../showcase/books/demos.sections.js?raw';
// @ts-expect-error Vite `?raw` import
import guideSections from '../showcase/books/guide.sections.js?raw';

// The showcase has three books and a page lives in exactly one of them. This keeps the books apart: ids do not repeat
// (an address like #button must name one page), and every menu entry has its page and every page its menu entry.
// У шоукейса три книги, и страница живёт ровно в одной. Тест держит книги раздельными: id не повторяются (адрес вида
// #button называет одну страницу), у каждого пункта меню есть страница, у каждой страницы — пункт меню.

type Book = { id: string; nav: { id: string; items: { id: string }[] }[] };
const sectionsOf: Record<string, string> = {
    components: componentsSections as string,
    demos: demosSections as string,
    guide: guideSections as string,
};
const idsOf = (book: Book) => book.nav.flatMap((group) => group.items.map((item) => item.id));
const pagesOf = (source: string) => [...source.matchAll(/^\s*'([\w-]+)':\s*Demo\w+,?\s*$/gm)].map((m) => m[1]!);

describe('showcase books', () => {
    it('are components, demos and guide, in that order', () => {
        expect((books as Book[]).map((b) => b.id)).toEqual(['components', 'demos', 'guide']);
    });

    it('a section id is in one book only', () => {
        const all = (books as Book[]).flatMap(idsOf);
        expect(all.filter((id, i) => all.indexOf(id) !== i)).toEqual([]);
    });

    it('every menu entry has a page and every page a menu entry', () => {
        for (const book of books as Book[]) {
            const ids = idsOf(book).sort();
            const pages = pagesOf(sectionsOf[book.id]!).sort();
            expect(pages, book.id).toEqual(ids);
        }
    });

    it('an address finds the book of a section', () => {
        expect(bookOfSection('button')?.id).toBe('components');
        expect(bookOfSection('typeahead')?.id).toBe('demos');
        expect(bookOfSection('a11y')?.id).toBe('guide');
        expect(bookOfSection('nope')).toBeUndefined();
        expect(bookById('guide')?.id).toBe('guide');
    });

    it('the Components book holds components only: the foundations are in the Guide', () => {
        const ids = idsOf((books as Book[])[0]!);
        for (const moved of ['layers', 'typography', 'surface', 'backgrounds', 'locale', 'a11y', 'typeahead']) {
            expect(ids, moved).not.toContain(moved);
        }
    });
});
