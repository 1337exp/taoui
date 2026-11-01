import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import TaoDrawer from '../src/components/TaoDrawer.vue';

// 5.19.0: a bottom sheet of your own: no cross, your own header, pulled down by the grip.
// 5.19.0: свой нижний лист: без крестика, своя шапка, лист тянут вниз за ручку.

afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = '';
});

const $ = (selector: string) => document.body.querySelector<HTMLElement>(selector);

function sheet(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    return mount(TaoDrawer, { props: { modelValue: true, side: 'bottom', title: 'Comments', ...props }, slots: { default: '<p>text</p>', ...slots } as never, attachTo: document.body });
}

function pointer(target: Element, type: string, y: number, init: Record<string, unknown> = {}) {
    const event = new Event(type, { bubbles: true, cancelable: true }) as Event & Record<string, unknown>;
    const fields = { pointerId: 1, isPrimary: true, pointerType: 'touch', button: 0, clientY: y, timeStamp: 0, ...init };
    for (const [key, value] of Object.entries(fields)) {
        Object.defineProperty(event, key, { value, configurable: true });
    }
    target.dispatchEvent(event);
}

describe('TaoDrawer showClose', () => {
    it('hides only the cross: the title stays, Escape and the backdrop still close it', async () => {
        const wrapper = sheet({ showClose: false });
        expect($('.tao-drawer__close')).toBeNull();
        expect($('.tao-drawer__title')?.textContent).toBe('Comments');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
        $('.tao-drawer__overlay')!.click();
        expect(wrapper.emitted('update:modelValue')?.length).toBe(2);
    });

    it('no header at all without a title, a cross or a slot', () => {
        sheet({ showClose: false, title: '' });
        expect($('.tao-drawer__header')).toBeNull();
    });

    it('closable off: no cross, and nothing closes it', () => {
        const wrapper = sheet({ closable: false });
        expect($('.tao-drawer__close')).toBeNull();
        $('.tao-drawer__overlay')!.click();
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
});

describe('TaoDrawer #header', () => {
    it('replaces the whole header and hands over close()', async () => {
        const wrapper = sheet({}, { header: '<template #header="{ close }"><b class="mine">Comments 275</b><button class="own-x" @click="close">x</button></template>' });
        expect($('.mine')?.textContent).toBe('Comments 275');
        expect($('.tao-drawer__title')).toBeNull();
        expect($('.tao-drawer__close')).toBeNull();
        $('.own-x')!.click();
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });
});

describe('TaoDrawer swipeToClose', () => {
    function pull(from: Element, to: number, height = 400) {
        const panel = $('.tao-drawer__panel')!;
        Object.defineProperty(panel, 'offsetHeight', { value: height, configurable: true });
        pointer(from, 'pointerdown', 100);
        pointer(from, 'pointermove', 100 + to / 2, { timeStamp: 300 });
        pointer(from, 'pointermove', 100 + to, { timeStamp: 900 });
        pointer(from, 'pointerup', 100 + to, { timeStamp: 900 });
        return panel;
    }

    it('closes when the grip is pulled far enough', async () => {
        const wrapper = sheet();
        pull($('.tao-drawer__grip')!, 200);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('comes back when pulled little, and does not close', async () => {
        const wrapper = sheet();
        const panel = pull($('.tao-drawer__header')!, 30);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        expect(panel.style.transform).toBe('');
    });

    it('does not start from a button of the header or from the content', async () => {
        const wrapper = sheet();
        pull($('.tao-drawer__close')!, 300);
        pull($('.tao-drawer__content p')!, 300);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('is off with swipeToClose=false, with closable=false and on a side drawer', async () => {
        for (const props of [{ swipeToClose: false }, { closable: false }, { side: 'right' }]) {
            const wrapper = sheet(props);
            pull($('.tao-drawer__header')!, 300);
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted('update:modelValue'), JSON.stringify(props)).toBeUndefined();
            wrapper.unmount();
        }
    });

    it('a pull that grazes the sheet does not close it; swipeThreshold says how far is far enough', async () => {
        const half = sheet();
        pull($('.tao-drawer__grip')!, 120);
        await half.vm.$nextTick();
        expect(half.emitted('update:modelValue')).toBeUndefined();
        half.unmount();
        const quarter = sheet({ swipeThreshold: 0.25 });
        pull($('.tao-drawer__grip')!, 120);
        await quarter.vm.$nextTick();
        expect(quarter.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('a pull does not select the title: no selection while the sheet is in the hand, and it is given back after', async () => {
        sheet();
        const panel = $('.tao-drawer__panel')!;
        pointer($('.tao-drawer__header')!, 'pointerdown', 100);
        expect(panel.style.userSelect).toBe('none');
        pointer($('.tao-drawer__header')!, 'pointerup', 100);
        expect(panel.style.userSelect).toBe('');
    });

    it('a pointer that vanishes lets go: the blur of the window, the hidden tab and a taken capture settle the sheet back, no close', async () => {
        const releases: Array<() => void> = [
            () => window.dispatchEvent(new Event('blur')),
            () => {
                Object.defineProperty(document, 'hidden', { value: true, configurable: true });
                document.dispatchEvent(new Event('visibilitychange'));
                Object.defineProperty(document, 'hidden', { value: false, configurable: true });
            },
            () => pointer($('.tao-drawer__panel')!, 'lostpointercapture', 0),
        ];
        for (const release of releases) {
            const wrapper = sheet();
            const panel = $('.tao-drawer__panel')!;
            Object.defineProperty(panel, 'offsetHeight', { value: 400, configurable: true });
            pointer($('.tao-drawer__grip')!, 'pointerdown', 100);
            pointer($('.tao-drawer__grip')!, 'pointermove', 400, { timeStamp: 900 });
            expect(panel.style.transform).not.toBe('');
            release();
            await wrapper.vm.$nextTick();
            expect(panel.style.transform).toBe('');
            expect(panel.style.userSelect).toBe('');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
            // the next pull starts again: nothing is held / следующая тяга начинается заново: ничего не держится
            pointer($('.tao-drawer__grip')!, 'pointerdown', 100);
            expect(panel.style.userSelect).toBe('none');
            pointer($('.tao-drawer__grip')!, 'pointerup', 100);
            wrapper.unmount();
        }
    });

    it('if the parent keeps it open, the sheet comes back', async () => {
        const wrapper = sheet();
        const panel = pull($('.tao-drawer__grip')!, 300);
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();
        // the test parent did not change modelValue: it is still open and the panel is back in place
        expect(wrapper.props('modelValue')).toBe(true);
        expect(panel.style.transform).toBe('');
    });
});
