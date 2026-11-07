import { mount } from '@vue/test-utils';
import { Comment, createVNode, type Component } from 'vue';
import { describe, expect, it } from 'vitest';
import TaoAlert from '../src/components/TaoAlert.vue';
import TaoCard from '../src/components/TaoCard.vue';
import TaoDonut from '../src/components/TaoDonut.vue';
import TaoEmpty from '../src/components/TaoEmpty.vue';
import TaoFieldset from '../src/components/TaoFieldset.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoInputGroup from '../src/components/TaoInputGroup.vue';
import TaoSpoiler from '../src/components/TaoSpoiler.vue';
import TaoSwitch from '../src/components/TaoSwitch.vue';
import TaoTag from '../src/components/TaoTag.vue';

// 5.30.0: a slot that is there but draws nothing (a wrapper component forwarding a slot it was not given, an inner
// `v-if` that is false) must not leave its frame: no padded empty body, no empty label gap, no empty addon. The component
// asks what the slot draws (src/slots.ts), not whether it exists.
// 5.30.0: слот, который есть, но ничего не рисует (обёртка пробрасывает слот, которого ей не дали; внутренний `v-if`
// ложен), не оставляет рамки: ни пустого тела с отступами, ни пустого зазора подписи, ни пустого аддона.

const empty = () => [createVNode(Comment, null, 'v-if')];

type Case = [name: string, component: Component, props: Record<string, unknown>, slot: string, wrapper: string];
const cases: Case[] = [
    ['TaoAlert body', TaoAlert, {}, 'default', '.tao-alert__message'],
    ['TaoCard header', TaoCard, {}, 'header', '.tao-card__header'],
    ['TaoCard title', TaoCard, {}, 'title', '.tao-card__title-block'],
    ['TaoCard body', TaoCard, {}, 'default', '.tao-card__body'],
    ['TaoCard footer', TaoCard, {}, 'footer', '.tao-card__footer'],
    ['TaoDonut centre', TaoDonut, { value: 40 }, 'default', '.tao-donut__centre'],
    ['TaoEmpty icon', TaoEmpty, {}, 'icon', '.tao-empty__icon'],
    ['TaoEmpty text', TaoEmpty, {}, 'default', '.tao-empty__text'],
    ['TaoEmpty action', TaoEmpty, {}, 'action', '.tao-empty__action'],
    ['TaoFieldset legend', TaoFieldset, {}, 'legend', '.tao-fieldset__legend'],
    ['TaoInput prefix', TaoInput, {}, 'prefix', '.tao-input__affix--prefix'],
    ['TaoInput suffix', TaoInput, {}, 'suffix', '.tao-input__affix--suffix'],
    ['TaoInputGroup before', TaoInputGroup, {}, 'before', '.tao-input-group__addon--before'],
    ['TaoInputGroup after', TaoInputGroup, {}, 'after', '.tao-input-group__addon--after'],
    ['TaoSpoiler title', TaoSpoiler, {}, 'title', '.tao-spoiler__title'],
    ['TaoSwitch label', TaoSwitch, { modelValue: false }, 'default', '.tao-switch__label'],
    ['TaoTag prefix', TaoTag, {}, 'prefix', '.tao-tag__prefix'],
];

describe('a slot that draws nothing leaves no wrapper', () => {
    it.each(cases)('%s', (_name, component, props, slot, wrapper) => {
        const nothing = mount(component, { props, slots: { [slot]: empty } });
        expect(nothing.find(wrapper).exists()).toBe(false);
        // the control: the same slot with real content keeps its wrapper / то же с настоящим содержимым — обёртка на месте
        const something = mount(component, { props, slots: { [slot]: () => 'x' } });
        expect(something.find(wrapper).exists()).toBe(true);
    });

    it('a card with every slot empty draws no content block, and a card with only media is media only', () => {
        const w = mount(TaoCard, { slots: { header: empty, title: empty, sub: empty, default: empty, footer: empty } });
        expect(w.find('.tao-card__content').exists()).toBe(false);
        const media = mount(TaoCard, { slots: { media: () => 'm', default: empty } });
        expect(media.find('.tao-card__content').exists()).toBe(false);
    });

    it('an empty body of a collapsible alert draws neither the collapsing wrapper nor the message', () => {
        const w = mount(TaoAlert, { props: { collapsible: true, title: 'T' }, slots: { default: empty } });
        expect(w.find('.tao-alert__message').exists()).toBe(false);
        expect(w.find('.tao-alert__fold').exists()).toBe(false);
    });
});
