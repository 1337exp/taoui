import type { ComputedRef, InjectionKey } from 'vue';
import type { TaoRadioValue } from './radio';

export type TaoSegmentedSize = 'small' | 'medium' | 'large';

export interface TaoSegmentedContext {
    name: ComputedRef<string>;
    model: ComputedRef<TaoRadioValue | undefined>;
    disabled: ComputedRef<boolean>;
    size: ComputedRef<TaoSegmentedSize>;
    setValue: (value: TaoRadioValue) => void;
}

export const segmentedKey: InjectionKey<TaoSegmentedContext> = Symbol('taoSegmented');
