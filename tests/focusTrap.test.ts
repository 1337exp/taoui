import { afterEach, describe, expect, it, vi } from 'vitest';
import { trapTab } from '../src/focusTrap';

function setup() {
    document.body.innerHTML = `
        <button id="outside">outside</button>
        <div id="root" tabindex="-1">
            <input id="a" /><input id="b" /><button id="ok">ok</button>
        </div>`;
    const root = document.getElementById('root')!;
    // happy-dom has no layout: pretend everything is rendered
    document.querySelectorAll('#root *').forEach((el) => {
        (el as HTMLElement).getClientRects = () => [{}] as unknown as DOMRectList;
    });
    return { root, a: document.getElementById('a')!, ok: document.getElementById('ok')!, outside: document.getElementById('outside')! };
}

function tab(shiftKey = false) {
    return new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
}

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

describe('trapTab', () => {
    it('wraps from the last to the first element', () => {
        const { root, a, ok } = setup();
        ok.focus();
        const event = tab();
        trapTab(event, root);
        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(a);
    });

    it('pulls focus back when the browser skipped the trailing button and left the root (Safari)', () => {
        vi.useFakeTimers();
        const { root, a, outside } = setup();
        document.getElementById('b')!.focus();
        trapTab(tab(), root);
        outside.focus(); // what the browser does: the button is not tabbable, so focus leaves
        vi.runAllTimers();
        expect(document.activeElement).toBe(a);
    });

    it('leaves focus alone when it stayed inside', () => {
        vi.useFakeTimers();
        const { root, a } = setup();
        a.focus();
        trapTab(tab(), root);
        document.getElementById('b')!.focus();
        vi.runAllTimers();
        expect(document.activeElement).toBe(document.getElementById('b'));
    });
});
