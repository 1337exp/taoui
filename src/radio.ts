import type { ComputedRef, InjectionKey } from 'vue';

export type TaoRadioValue = string | number | boolean;

export interface TaoRadioGroupContext {
    name: ComputedRef<string>;
    model: ComputedRef<TaoRadioValue | undefined>;
    disabled: ComputedRef<boolean>;
    setValue: (value: TaoRadioValue) => void;
}

export const radioGroupKey: InjectionKey<TaoRadioGroupContext> = Symbol('taoRadioGroup');
