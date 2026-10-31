/**
 * Does a file pass an `accept` string, as in `<input type="file" accept>`: extensions (`.json`), a whole family (`image/*`), a type (`application/json`).
 * Проходит ли файл под строку `accept`, как у `<input type="file" accept>`: расширения (`.json`), семейство (`image/*`), тип (`application/json`).
 */
export function fileMatchesAccept(file: Pick<File, 'name' | 'type'>, accept: string): boolean {
    const tokens = accept
        .split(',')
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean);
    if (!tokens.length || tokens.includes('*') || tokens.includes('*/*')) {
        return true;
    }

    const name = file.name.toLowerCase();
    const mime = (file.type || '').toLowerCase();
    const dot = name.lastIndexOf('.');
    const ext = dot >= 0 ? name.slice(dot) : '';

    return tokens.some((token) => {
        if (token.startsWith('.')) {
            return ext === token;
        }
        if (token.endsWith('/*')) {
            return mime.startsWith(token.slice(0, -1));
        }
        return mime === token;
    });
}

/** Splits files into the ones that pass `accept` and the ones that do not. / Делит файлы на подошедшие под `accept` и не подошедшие. */
export function partitionByAccept<T extends Pick<File, 'name' | 'type'>>(files: T[], accept: string): { accepted: T[]; rejected: T[] } {
    const accepted: T[] = [];
    const rejected: T[] = [];
    for (const file of files) {
        (fileMatchesAccept(file, accept) ? accepted : rejected).push(file);
    }
    return { accepted, rejected };
}
