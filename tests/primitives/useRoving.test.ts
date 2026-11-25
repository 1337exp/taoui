import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useRoving } from '../../src/primitives/useRoving';

// v6: one keyboard contract for lists, menus, trees, tabs and command lists
// v6: один клавиатурный контракт для списков, меню, деревьев, вкладок и командных списков

const key = (k: string, extra: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', { key: k, cancelable: true, ...extra });
    return event;
};

function make(options: Partial<Parameters<typeof useRoving>[0]> = {}, enabled = [true, true, false, true], start = 0) {
    const active = ref(start);
    const onMove = vi.fn();
    const nav = useRoving({ enabled: () => enabled, active, onMove, ...options });
    const press = (k: string, extra: Partial<KeyboardEventInit> = {}) => {
        const event = key(k, extra);
        const handled = nav.onKeydown(event);
        return { handled, prevented: event.defaultPrevented };
    };
    return { active, onMove, press };
}

describe('useRoving', () => {
    it('vertical: the up and down arrows walk, a disabled item is skipped, the ends wrap by default', () => {
        const { active, press } = make();
        press('ArrowDown');
        expect(active.value).toBe(1);
        press('ArrowDown');
        expect(active.value).toBe(3);
        press('ArrowDown');
        expect(active.value).toBe(0);
        press('ArrowUp');
        expect(active.value).toBe(3);
    });

    it('vertical ignores the left and right arrows, horizontal ignores up and down, both takes all four', () => {
        expect(make().press('ArrowRight').handled).toBe(false);
        expect(make({ orientation: 'horizontal' }).press('ArrowDown').handled).toBe(false);
        const h = make({ orientation: 'horizontal' });
        h.press('ArrowRight');
        expect(h.active.value).toBe(1);
        for (const k of ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']) expect(make({ orientation: 'both' }).press(k).handled).toBe(true);
        const b = make({ orientation: 'both' });
        b.press('ArrowRight');
        b.press('ArrowDown');
        expect(b.active.value).toBe(3);
        b.press('ArrowLeft');
        expect(b.active.value).toBe(1);
    });

    it('loop: false stops at the ends, but still takes the key', () => {
        const { active, press } = make({ loop: false }, [true, true, true], 2);
        const result = press('ArrowDown');
        expect(active.value).toBe(2);
        expect(result).toEqual({ handled: true, prevented: true });
    });

    it('Home and End go to the first and the last enabled item', () => {
        const { active, press } = make({}, [false, true, true, false], 1);
        press('End');
        expect(active.value).toBe(2);
        press('Home');
        expect(active.value).toBe(1);
    });

    it('onMove is called with the new index after a key moved it, and not when nothing can be reached', () => {
        const { onMove, press } = make();
        press('ArrowDown');
        expect(onMove).toHaveBeenCalledWith(1);
        const none = make({}, [false, false]);
        none.press('ArrowDown');
        expect(none.onMove).not.toHaveBeenCalled();
    });

    it('type-ahead: a printable key jumps to the item whose label starts with it; a space alone is not a letter', () => {
        const labels = ['Alpha', 'Beta', 'Gamma', 'Bravo'];
        const { active, press } = make({ labels: () => labels }, [true, true, true, true], 0);
        press('g');
        expect(active.value).toBe(2);
        // a space with nothing typed before it is «activate», not a letter (inside a word it is a letter)
        expect(make({ labels: () => labels }).press(' ').handled).toBe(false);
        expect(make({ labels: () => labels }).press('c', { ctrlKey: true }).handled).toBe(false);
    });

    it('without labels there is no type-ahead, and an unrelated key is left alone', () => {
        const { press } = make();
        expect(press('a').handled).toBe(false);
        expect(press('Enter')).toEqual({ handled: false, prevented: false });
    });
});
