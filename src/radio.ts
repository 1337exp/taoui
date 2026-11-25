import type { ComputedRef, InjectionKey, Ref } from 'vue';

export type TaoRadioValue = string | number | boolean;

export interface TaoRadioGroupContext {
    name: ComputedRef<string>;
    model: Readonly<Ref<TaoRadioValue | undefined>>;
    disabled: ComputedRef<boolean>;
    setValue: (value: TaoRadioValue) => void;
}

export const radioGroupKey: InjectionKey<TaoRadioGroupContext> = Symbol('taoRadioGroup');
