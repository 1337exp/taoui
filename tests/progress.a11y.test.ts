import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoProgress from '../src/components/TaoProgress.vue';

// 5.57.2: a progress bar is a progressbar for a screen reader (it was silent: no role, no value)
// 5.57.2: полоса прогресса — progressbar для скринридера (раньше молчала: ни роли, ни значения)
describe('TaoProgress as a progressbar', () => {
    it('has the role and the value, 0..100', () => {
        const w = mount(TaoProgress, { props: { progress: 42 } });
        expect(w.attributes('role')).toBe('progressbar');
        expect(w.attributes('aria-valuemin')).toBe('0');
        expect(w.attributes('aria-valuemax')).toBe('100');
        expect(w.attributes('aria-valuenow')).toBe('42');
    });

    it('keeps the value inside 0..100, and a broken one is 0', () => {
        expect(mount(TaoProgress, { props: { progress: 250 } }).attributes('aria-valuenow')).toBe('100');
        expect(mount(TaoProgress, { props: { progress: -5 } }).attributes('aria-valuenow')).toBe('0');
        expect(mount(TaoProgress, { props: { progress: Number.NaN } }).attributes('aria-valuenow')).toBe('0');
    });

    it('an aria-label you give it lands on the element that has the role', () => {
        const w = mount(TaoProgress, { props: { progress: 10 }, attrs: { 'aria-label': 'Upload' } });
        expect(w.attributes('role')).toBe('progressbar');
        expect(w.attributes('aria-label')).toBe('Upload');
    });

    it('follows the value', async () => {
        const w = mount(TaoProgress, { props: { progress: 10 } });
        await w.setProps({ progress: 80 });
        expect(w.attributes('aria-valuenow')).toBe('80');
    });
});
