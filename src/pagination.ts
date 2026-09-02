export type TaoPaginationItem =
    | { type: 'page'; page: number }
    | { type: 'ellipsis'; id: 'left' | 'right' };

export function buildPaginationItems(
    page: number,
    pageCount: number,
    siblingCount = 1,
): TaoPaginationItem[] {
    if (pageCount <= 0) {
        return [];
    }

    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, index) => ({ type: 'page' as const, page: index + 1 }));
    }

    const current = Math.min(Math.max(page, 1), pageCount);
    const siblings = Math.max(0, siblingCount);
    const left = Math.max(2, current - siblings);
    const right = Math.min(pageCount - 1, current + siblings);
    const items: TaoPaginationItem[] = [{ type: 'page', page: 1 }];

    if (left > 2) {
        items.push({ type: 'ellipsis', id: 'left' });
    }

    for (let next = left; next <= right; next += 1) {
        items.push({ type: 'page', page: next });
    }

    if (right < pageCount - 1) {
        items.push({ type: 'ellipsis', id: 'right' });
    }

    items.push({ type: 'page', page: pageCount });
    return items;
}
