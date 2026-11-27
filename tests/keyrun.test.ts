import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import TaoDragNumber from '../src/components/TaoDragNumber.vue';
import TaoInputNumber from '../src/components/TaoInputNumber.vue';
import TaoQuantity from '../src/components/TaoQuantity.vue';

// A held arrow key is one action: every repeat writes the model (`update:modelValue`), and the whole run is ONE `commit`, on the keyup (as a
// held ± button is). An app that closes a history step on `commit` gets one step for two seconds of holding, not twenty.
// Зажатая стрелка это одно действие: каждый повтор пишет модель (`update:modelValue`), а вся серия это ОДИН `commit` на keyup (как у зажатой
// кнопки ±). Приложение, которое закрывает шаг истории на `commit`, получает один шаг за две секунды удержания, а не двадцать.

const mounted: VueWrapper[] = [];
afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount();
    document.body.innerHTML = '';
});

type Case = { name: string; component: unknown; props: Record<string, unknown> };
const cases: Case[] = [
    { name: 'TaoDragNumber', component: TaoDragNumber, props: { modelValue: 5, min: 0, max: 100 } },
    { name: 'TaoInputNumber', component: TaoInputNumber, props: { modelValue: 5, min: 0, max: 100 } },
    { name: 'TaoQuantity', component: TaoQuantity, props: { modelValue: 5, min: 0, max: 100 } },
];

function make(c: Case) {
    const updates: number[] = [];
    const commits: number[] = [];
    const options = {
        attachTo: document.body,
        props: {
            ...c.props,
            'onUpdate:modelValue': (value: number) => {
                updates.push(value);
                void w.setProps({ modelValue: value });
            },
            onCommit: (value: number) => commits.push(value),
        },
    };
    const w = mount(c.component as never, options as never) as VueWrapper;
    mounted.push(w);
    return { w, updates, commits };
}

describe.each(cases)('$name: a held arrow', (c) => {
    it('five repeats are five updates and one commit, on the keyup', async () => {
        const { w, updates, commits } = make(c);
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('keydown', { key: 'ArrowUp' });
        for (let i = 0; i < 4; i += 1) await input.trigger('keydown', { key: 'ArrowUp', repeat: true });
        expect(updates).toEqual([6, 7, 8, 9, 10]);
        expect(commits).toEqual([]);
        await input.trigger('keyup', { key: 'ArrowUp' });
        expect(commits).toEqual([10]);
    });

    it('a single press is one step: the keydown writes, the keyup commits', async () => {
        const { w, updates, commits } = make(c);
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('keydown', { key: 'ArrowDown' });
        expect(updates).toEqual([4]);
        expect(commits).toEqual([]);
        await input.trigger('keyup', { key: 'ArrowDown' });
        expect(commits).toEqual([4]);
    });

    it('losing the focus while the key is down commits the run once (the keyup never comes), and a late keyup adds nothing', async () => {
        const { w, commits } = make(c);
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('keydown', { key: 'ArrowUp' });
        await input.trigger('keydown', { key: 'ArrowUp', repeat: true });
        await input.trigger('blur');
        expect(commits).toEqual([7]);
        await input.trigger('keyup', { key: 'ArrowUp' });
        expect(commits).toEqual([7]);
    });

    it('a keyup that follows no step commits nothing', async () => {
        const { w, commits } = make(c);
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('keyup', { key: 'ArrowUp' });
        expect(commits).toEqual([]);
    });
});

describe('TaoQuantity: a step and the blur that follows are one commit', () => {
    it('the same number is not committed twice', async () => {
        const { w, commits } = make(cases[2]!);
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('keydown', { key: 'ArrowUp' });
        await input.trigger('keyup', { key: 'ArrowUp' });
        await input.trigger('blur');
        expect(commits).toEqual([6]);
    });
});
