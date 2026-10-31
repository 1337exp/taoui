import { describe, expect, it } from 'vitest';
import { fileMatchesAccept, partitionByAccept } from '../src/fileAccept';

const file = (name: string, type = '') => ({ name, type });

describe('fileMatchesAccept', () => {
    it('lets everything through without a filter', () => {
        for (const accept of ['', '*', '*/*', ' , ']) {
            expect(fileMatchesAccept(file('a.txt'), accept)).toBe(true);
        }
    });

    it('matches an extension, ignoring case', () => {
        expect(fileMatchesAccept(file('Track.JSON'), '.json')).toBe(true);
        expect(fileMatchesAccept(file('track.txt'), '.json')).toBe(false);
        expect(fileMatchesAccept(file('json'), '.json')).toBe(false);
    });

    it('matches a type and a whole family', () => {
        expect(fileMatchesAccept(file('a', 'application/json'), 'application/json')).toBe(true);
        expect(fileMatchesAccept(file('a.png', 'image/png'), 'image/*')).toBe(true);
        expect(fileMatchesAccept(file('a.mp4', 'video/mp4'), 'image/*')).toBe(false);
    });

    it('takes any of several tokens', () => {
        expect(fileMatchesAccept(file('a.txt', 'text/plain'), '.json, application/json, .txt')).toBe(true);
    });
});

describe('partitionByAccept', () => {
    it('keeps the order and separates the refused ones', () => {
        const files = [file('a.json'), file('b.txt'), file('c.json'), file('d.png')];
        const { accepted, rejected } = partitionByAccept(files, '.json');
        expect(accepted.map((f) => f.name)).toEqual(['a.json', 'c.json']);
        expect(rejected.map((f) => f.name)).toEqual(['b.txt', 'd.png']);
    });

    it('refuses nothing without a filter', () => {
        expect(partitionByAccept([file('a.txt')], '*').rejected).toEqual([]);
    });
});
