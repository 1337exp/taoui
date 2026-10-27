import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoTimeline from '../src/components/TaoTimeline.vue';
import { timelineState, type TaoTimelineItem } from '../src/timeline';

const items: TaoTimelineItem[] = [
    { id: 'paid', title: 'Paid', time: '12 May, 14:03', datetime: '2026-05-12T14:03', tone: 'success' },
    { id: 'packed', title: 'Packed', description: 'Two boxes', icon: 'tao-check' },
    { id: 'sent', title: 'Sent' },
    { id: 'delivered', title: 'Delivered', tone: 'info' },
];

const feed = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
    mount(TaoTimeline, { props: { items, ...props }, slots: slots as never });
const rows = (w: ReturnType<typeof feed>) => w.findAll('.tao-timeline__item');

describe('timelineState', () => {
    it('done before the current event, upcoming after it, everything done without one', () => {
        expect([0, 1, 2].map((i) => timelineState(i, 1))).toEqual(['done', 'current', 'upcoming']);
        expect([0, 1].map((i) => timelineState(i, -1))).toEqual(['done', 'done']);
    });
});

describe('TaoTimeline', () => {
    it('is an ordered list of events with titles, descriptions and machine-readable times', () => {
        const w = feed();
        expect(w.element.tagName).toBe('OL');
        expect(rows(w)).toHaveLength(4);
        expect(rows(w)[0]!.find('.tao-timeline__title').text()).toBe('Paid');
        const time = rows(w)[0]!.find('time');
        expect(time.text()).toBe('12 May, 14:03');
        expect(time.attributes('datetime')).toBe('2026-05-12T14:03');
        expect(rows(w)[1]!.find('.tao-timeline__description').text()).toBe('Two boxes');
        expect(rows(w)[2]!.find('time').exists()).toBe(false);
    });

    it('a line joins each marker to the next; the last one has none; the rail is hidden from a screen reader', () => {
        const w = feed();
        expect(w.findAll('.tao-timeline__line')).toHaveLength(3);
        expect(rows(w)[3]!.find('.tao-timeline__line').exists()).toBe(false);
        expect(rows(w)[0]!.find('.tao-timeline__rail').attributes('aria-hidden')).toBe('true');
    });

    it('a tone colours the marker, no tone is the accent; an icon makes a bigger marker', () => {
        const w = feed();
        expect(rows(w)[0]!.find('.tao-timeline__marker').classes()).toContain('tao-tone-success');
        expect(rows(w)[2]!.find('.tao-timeline__marker').classes()).toContain('tao-tone-accent');
        expect(rows(w)[1]!.find('.tao-timeline__marker').classes()).toContain('tao-timeline__marker--icon');
        expect(rows(w)[1]!.find('.tao-timeline__marker svg').exists()).toBe(true);
    });

    it('active: done / current / upcoming, aria-current="step" on the current event', () => {
        const w = feed({ active: 'sent' });
        expect(w.classes()).toContain('tao-timeline--progress');
        expect(rows(w).map((r) => r.classes().find((c) => /--(done|current|upcoming)$/.test(c)))).toEqual([
            'tao-timeline__item--done',
            'tao-timeline__item--done',
            'tao-timeline__item--current',
            'tao-timeline__item--upcoming',
        ]);
        expect(rows(w)[2]!.attributes('aria-current')).toBe('step');
        expect(rows(w)[1]!.attributes('aria-current')).toBeUndefined();
    });

    it('without active it is a log: every event done, no progress line', () => {
        const w = feed();
        expect(w.classes()).not.toContain('tao-timeline--progress');
        expect(rows(w).every((r) => r.classes().includes('tao-timeline__item--done'))).toBe(true);
    });

    it('align: alternate marks every second event for the far side', () => {
        const w = feed({ align: 'alternate' });
        expect(w.classes()).toContain('tao-timeline--alternate');
        expect(rows(w).map((r) => r.classes().includes('tao-timeline__item--far'))).toEqual([false, true, false, true]);
    });

    it('slots get the item, its index and state: marker, title, content', () => {
        const w = feed(
            { active: 'packed' },
            {
                marker: ({ index }: { index: number }) => String(index + 1),
                title: ({ item, state }: { item: TaoTimelineItem; state: string }) => `${item.title} (${state})`,
                content: ({ active }: { active: boolean }) => (active ? 'now' : ''),
            },
        );
        expect(rows(w).map((r) => r.find('.tao-timeline__marker').text())).toEqual(['1', '2', '3', '4']);
        expect(rows(w)[0]!.find('.tao-timeline__marker').classes()).toContain('tao-timeline__marker--icon');
        expect(rows(w)[1]!.find('.tao-timeline__title').text()).toBe('Packed (current)');
        expect(rows(w)[1]!.text()).toContain('now');
        expect(rows(w)[0]!.text()).not.toContain('now');
    });

    it('size', () => {
        expect(feed({ size: 'small' }).classes()).toContain('tao-size-small');
    });
});
