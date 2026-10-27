import type { ComputedRef, InjectionKey } from 'vue';
import type { TaoRadioValue } from './radio';
import type { TaoSize } from './size';

export interface TaoSegmentedContext {
    name: ComputedRef<string>;
    model: ComputedRef<TaoRadioValue | undefined>;
    disabled: ComputedRef<boolean>;
    setValue: (value: TaoRadioValue) => void;
}

export const segmentedKey: InjectionKey<TaoSegmentedContext> = Symbol('taoSegmented');
