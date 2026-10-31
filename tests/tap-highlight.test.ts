import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import
import semanticCss from '../src/styles/tokens/semantic.css?raw';
// @ts-expect-error Vite `?raw` import
import baseCss from '../src/styles/base.css?raw';

// 5.18.0: no system flash on a tap, one token to bring a flash of your own back.
// 5.18.0: нет системной вспышки при нажатии, один токен возвращает свою.

describe('tap highlight', () => {
    it('is transparent by default, as a token', () => {
        expect(semanticCss).toMatch(/--tao-tap-highlight:\s*transparent;/);
    });

    it('is applied once, on the root, and reads the token (the property is inherited)', () => {
        expect(baseCss).toMatch(/html\s*\{\s*-webkit-tap-highlight-color:\s*var\(--tao-tap-highlight\);\s*\}/);
    });
});
