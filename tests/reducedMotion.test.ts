import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// 5.57.2: the overlays that slide, bounce or fade obey `prefers-reduced-motion` (the modal fade had no rule, the drawer slid and the toast bounced regardless)
// 5.57.2: оверлеи, которые выезжают, отскакивают или гаснут, слушаются `prefers-reduced-motion` (у модалки не было правила, drawer выезжал, а тост отскакивал в любом случае)

/** The body of the reduced-motion block of a component, or '' when it has none. / Тело блока reduced-motion у компонента или '', если его нет. */
function reducedBlock(file: string): string {
    const source = readFileSync(file, 'utf8');
    const start = source.indexOf('@media (prefers-reduced-motion: reduce)');
    if (start === -1) {
        return '';
    }
    let depth = 0;
    for (let i = source.indexOf('{', start); i < source.length; i += 1) {
        if (source[i] === '{') depth += 1;
        if (source[i] === '}') {
            depth -= 1;
            if (depth === 0) {
                return source.slice(start, i + 1);
            }
        }
    }
    return '';
}

describe('reduced motion of the overlays', () => {
    it('TaoModal: the fade is off', () => {
        const block = reducedBlock('src/components/TaoModal.vue');
        expect(block).toMatch(/\.tao-modal-fade-enter-active,\s*\.tao-modal-fade-leave-active \{\s*transition: none;/);
    });

    it('TaoDrawer: the scrim and the sliding panel are off, for all three sides', () => {
        const block = reducedBlock('src/components/TaoDrawer.vue');
        for (const side of ['right', 'left', 'bottom']) {
            for (const phase of ['enter', 'leave']) {
                expect(block, `${side} ${phase}`).toContain(`.tao-drawer-${side}-${phase}-active,`);
                expect(block, `${side} ${phase} panel`).toContain(`.tao-drawer-${side}-${phase}-active .tao-drawer__panel`);
            }
        }
        expect(block).toMatch(/transition: none;/);
    });

    it('TaoToastViewport: no bounce on the way in, no fade-out and no fold of the row on the way out', () => {
        const block = reducedBlock('src/components/TaoToastViewport.vue');
        for (const place of ['top', 'bottom', 'center']) {
            expect(block, place).toContain(`.tao-toast-${place}-enter-active :deep(.tao-toast)`);
            expect(block, place).toContain(`.tao-toast-${place}-leave-active :deep(.tao-toast)`);
            expect(block, place).toMatch(new RegExp(`\\.tao-toast-${place}-leave-active(,| \\{)`));
        }
        expect(block).toMatch(/animation: none;/);
        expect(block).toMatch(/transition: none;/);
    });
});
