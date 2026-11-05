import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the component source as text
import confirmSource from '../src/components/TaoConfirmHost.vue?raw';
import { centringNudge } from '../src/pixelSnap';

// 5.27.1: a centred panel must not stand on a half pixel, or a button in it jumps when it is repainted under the pointer.
// 5.27.1: отцентрованная панель не должна стоять на половинке пикселя, иначе кнопка в ней прыгает при перерисовке под указателем.

describe('centringNudge', () => {
    it('is 1 when the room left over is odd (the panel would start on a half), else 0', () => {
        expect(centringNudge(846, 143)).toBe(1);
        expect(centringNudge(846, 118)).toBe(0);
        expect(centringNudge(757, 143)).toBe(0);
        expect(centringNudge(100, 100)).toBe(0);
        expect(centringNudge(101, 100)).toBe(1);
    });

    it('works from whole pixels: a fractional size is rounded first, and the order does not matter', () => {
        expect(centringNudge(845.6, 142.8)).toBe(centringNudge(846, 143));
        expect(centringNudge(143, 846)).toBe(1);
    });
});

describe('TaoConfirmHost keeps whole pixels', () => {
    const source = confirmSource as string;

    it('the line heights are whole pixels at the default sizes (16 x 1.25, 14 x 1.5)', () => {
        expect(source).toMatch(/font-size: var\(--tao-font-size-lg\);\s*font-weight: 600;[\s\S]*?line-height: 1\.25;/);
        expect(source).toMatch(/font-size: var\(--tao-font-size-md\);\s*line-height: 1\.5;/);
    });

    it('the panel is snapped when it opens and when the window is resized', () => {
        expect(source).toContain('centringNudge(box.clientHeight, panel.offsetHeight)');
        expect(source).toContain("window.addEventListener('resize', snapPanel)");
        expect(source).toContain("window.removeEventListener('resize', snapPanel)");
    });
});
