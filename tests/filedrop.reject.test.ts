import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoFileDrop from '../src/components/TaoFileDrop.vue';

// 5.17.0: a file that does not pass `accept` is reported by `reject`, not dropped without a word.
// 5.17.0: файл, не прошедший `accept`, приходит в `reject`, а не пропадает молча.

function choose(wrapper: ReturnType<typeof mount>, files: File[]) {
    const input = wrapper.find('input[type=file]');
    Object.defineProperty(input.element, 'files', { value: files, configurable: true });
    return input.trigger('change');
}

const json = new File(['{}'], 'track.json', { type: 'application/json' });
const text = new File(['x'], 'track.txt', { type: 'text/plain' });

describe('TaoFileDrop reject', () => {
    it('reports a refused file and sends no change', async () => {
        const wrapper = mount(TaoFileDrop, { props: { accept: '.json' } });
        await choose(wrapper, [text]);
        expect(wrapper.emitted('reject')?.[0]).toEqual([[text]]);
        expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('in a mixed batch keeps the good file and reports the bad one', async () => {
        const wrapper = mount(TaoFileDrop, { props: { accept: '.json', multiple: true } });
        await choose(wrapper, [json, text]);
        expect(wrapper.emitted('reject')?.[0]).toEqual([[text]]);
        expect(wrapper.emitted('change')?.[0]).toEqual([[json]]);
    });

    it('says nothing when every file passes', async () => {
        const wrapper = mount(TaoFileDrop, { props: { accept: '.json' } });
        await choose(wrapper, [json]);
        expect(wrapper.emitted('reject')).toBeUndefined();
        expect(wrapper.emitted('change')?.[0]).toEqual([[json]]);
    });
});
