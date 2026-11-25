import type { ComputedRef, InjectionKey, Ref } from 'vue';
import type { TaoRadioValue } from './radio';
import type { TaoSize } from './size';

export interface TaoSegmentedContext {
    name: ComputedRef<string>;
    model: Readonly<Ref<TaoRadioValue | undefined>>;
    disabled: ComputedRef<boolean>;
    /** The group needs a pick: every option carries the native `required`. / Группе нужен выбор: у каждого варианта нативный `required`. */
    required?: ComputedRef<boolean>;
    setValue: (value: TaoRadioValue) => void;
}

export const segmentedKey: InjectionKey<TaoSegmentedContext> = Symbol('taoSegmented');
