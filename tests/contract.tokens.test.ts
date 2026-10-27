// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The public token contract. TaoUX ships a bridge (`@1337exp/taoux/taoui.css`) that points its --tx-* variables at
// these tokens, and its test reads `src/styles/semantic.css` by path. Changing the list or the file means changing
// TaoUX in the same release.
// Публичный контракт токенов: на них смотрит мост TaoUX, его тест читает `src/styles/semantic.css` по пути.

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path: string) => readFileSync(join(root, path), 'utf8');

export const contractTokens = [
    '--tao-color-accent',
    '--tao-color-accent-subtle',
    '--tao-color-bg',
    '--tao-color-surface',
    '--tao-color-surface-raised',
    '--tao-color-surface-sunken',
    '--tao-color-text',
    '--tao-color-text-strong',
    '--tao-color-text-muted',
    '--tao-color-border',
    '--tao-color-border-strong',
    '--tao-color-danger',
    '--tao-color-success',
];

describe('public token contract', () => {
    const semantic = read('src/styles/semantic.css');
    const light = read('src/styles/themes/light.css');

    it.each(contractTokens)('%s is defined in semantic.css (the file path is part of the contract)', (token) => {
        expect(semantic).toContain(`${token}:`);
    });

    it.each(contractTokens)('%s is set by the light theme as well', (token) => {
        expect(light).toContain(`${token}:`);
    });

    it('the size and surface context tokens that components rely on exist', () => {
        const size = read('src/styles/size.css');
        for (const token of ['--tao-control-height', '--tao-control-font-size', '--tao-indicator-size']) {
            expect(size).toContain(`${token}:`);
        }
    });
});
