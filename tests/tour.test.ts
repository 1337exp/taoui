import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoTour from '../src/components/TaoTour.vue';
import { holeClipPath, isInView, resolveTourTarget, spotlightRect } from '../src/tour';

// 5.25.0: TaoTour, the lit window and the card of a guided tour; the steps come from you or from TaoUX `tour`.
// 5.25.0: TaoTour, освещённое окно и карточка тура; шаги ваши или из TaoUX `tour`.

afterEach(() => {
    document.body.innerHTML = '';
});

function target(html = '<button id="go">Go</button>') {
    document.body.insertAdjacentHTML('beforeend', html);
    const el = document.querySelector<HTMLElement>('#go')!;
    // happy-dom has no layout: the target needs a box to be "shown"
    el.getClientRects = () => [{ width: 10, height: 10 }] as unknown as DOMRectList;
    el.getBoundingClientRect = () => ({ top: 100, left: 50, width: 80, height: 30, right: 130, bottom: 130, x: 50, y: 100, toJSON: () => ({}) });
    return el;
}

describe('geometry', () => {
    it('the lit window is the target grown by the padding', () => {
        expect(spotlightRect({ top: 100, left: 50, width: 80, height: 30 }, 6)).toEqual({ top: 94, left: 44, width: 92, height: 42 });
    });

    it('the hole is a clip-path over the whole screen with the window cut out; the corner radius is cut down to fit', () => {
        const path = holeClipPath({ top: 10, left: 10, width: 20, height: 6 }, { width: 200, height: 100 }, 8);
        expect(path).toMatch(/^path\(evenodd, "M0 0H200V100H0Z/);
        expect(path).toContain('A3 3 0 0 1');
    });

    it('knows whether a box is inside the viewport', () => {
        const view = { width: 400, height: 300 };
        expect(isInView({ top: 20, left: 20, width: 50, height: 50 }, view, 8)).toBe(true);
        expect(isInView({ top: 280, left: 20, width: 50, height: 50 }, view, 8)).toBe(false);
        expect(isInView({ top: 2, left: 20, width: 50, height: 50 }, view, 8)).toBe(false);
    });
});

describe('resolveTourTarget', () => {
    it('finds a selector, an element and a function; a missing, hidden or invalid one is null', () => {
        const el = target();
        expect(resolveTourTarget('#go')).toBe(el);
        expect(resolveTourTarget(el)).toBe(el);
        expect(resolveTourTarget(() => el)).toBe(el);
        expect(resolveTourTarget('#nope')).toBeNull();
        expect(resolveTourTarget('###')).toBeNull();
        expect(resolveTourTarget(null)).toBeNull();
        el.getClientRects = () => [] as unknown as DOMRectList;
        expect(resolveTourTarget('#go')).toBeNull();
    });
});

describe('TaoTour', () => {
    const base = { step: { id: 'a', target: '#go', title: 'Hello', text: 'Press it' }, index: 1, count: 3 };

    it('draws nothing while there is no step', () => {
        mount(TaoTour, { props: { step: null }, attachTo: document.body });
        expect(document.querySelector('.tao-tour')).toBeNull();
    });

    it('is a dialog named by the title and described by the text, with the lit window over a target', async () => {
        target();
        const wrapper = mount(TaoTour, { props: base, attachTo: document.body });
        await nextTick();
        await nextTick();
        const card = document.querySelector('.tao-tour__card')!;
        expect(card.getAttribute('role')).toBe('dialog');
        const title = document.getElementById(card.getAttribute('aria-labelledby')!)!;
        expect(title.textContent).toBe('Hello');
        expect(document.getElementById(card.getAttribute('aria-describedby')!)!.textContent).toBe('Press it');
        expect(document.querySelector('.tao-tour__hole')).not.toBeNull();
        expect(card.textContent).toContain('Step 2 of 3');
        wrapper.unmount();
    });

    it('a step without a target (or one that is not on the page) is a card in the middle over a full dim', async () => {
        const wrapper = mount(TaoTour, { props: { step: { id: 'x', title: 'Welcome' }, index: 0, count: 2 }, attachTo: document.body });
        await nextTick();
        expect(document.querySelector('.tao-tour__card--centered')).not.toBeNull();
        expect(document.querySelector('.tao-tour__dim')).not.toBeNull();
        expect(document.querySelector('.tao-tour__hole')).toBeNull();
        await wrapper.setProps({ step: { id: 'y', target: '#absent', title: 'Lost' } });
        await nextTick();
        expect(document.querySelector('.tao-tour__card--centered')).not.toBeNull();
        wrapper.unmount();
    });

    it('the buttons say what the model does: no Back on the first step, Done on the last, no Skip on the last', async () => {
        const wrapper = mount(TaoTour, { props: { ...base, index: 0 }, attachTo: document.body });
        await nextTick();
        const texts = () => [...document.querySelectorAll('.tao-tour__actions button')].map((b) => b.textContent?.trim());
        expect(texts()).toEqual(['Skip', 'Next']);
        await wrapper.setProps({ index: 1 });
        expect(texts()).toEqual(['Skip', 'Back', 'Next']);
        await wrapper.setProps({ index: 2 });
        expect(texts()).toEqual(['Back', 'Done']);
        wrapper.unmount();
    });

    it('asks for next, prev and skip: with the buttons, the arrows and Escape', async () => {
        target();
        const wrapper = mount(TaoTour, { props: base, attachTo: document.body });
        await nextTick();
        const buttons = [...document.querySelectorAll<HTMLButtonElement>('.tao-tour__actions button')];
        buttons.find((b) => b.textContent?.includes('Next'))!.click();
        buttons.find((b) => b.textContent?.includes('Back'))!.click();
        buttons.find((b) => b.textContent?.includes('Skip'))!.click();
        const card = document.querySelector('.tao-tour__card')!;
        card.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        card.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(wrapper.emitted('next')).toHaveLength(2);
        expect(wrapper.emitted('prev')).toHaveLength(2);
        expect(wrapper.emitted('skip')).toHaveLength(2);
        wrapper.unmount();
    });

    it('the page stays shut, except for the target when the step is interactive', async () => {
        target();
        const wrapper = mount(TaoTour, { props: base, attachTo: document.body });
        await nextTick();
        expect((document.querySelector('.tao-tour__blocker') as HTMLElement).style.clipPath).toBe('');
        await wrapper.setProps({ interactive: true });
        expect((document.querySelector('.tao-tour__blocker') as HTMLElement).style.clipPath).toContain('path(evenodd');
        wrapper.unmount();
    });

    it('the texts can be given', async () => {
        const wrapper = mount(TaoTour, { props: { step: { id: 'x', title: 'T' }, index: 0, count: 2, nextLabel: 'Go on', skipLabel: 'Enough' }, attachTo: document.body });
        await nextTick();
        expect(document.querySelector('.tao-tour__actions')!.textContent).toContain('Go on');
        expect(document.querySelector('.tao-tour__actions')!.textContent).toContain('Enough');
        wrapper.unmount();
    });
});
