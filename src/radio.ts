import type { ComputedRef, InjectionKey, Ref } from 'vue';

export type TaoRadioValue = string | number | boolean;

export interface TaoRadioGroupContext {
    name: ComputedRef<string>;
    model: Readonly<Ref<TaoRadioValue | undefined>>;
    disabled: ComputedRef<boolean>;
    /** The group needs a pick: every radio carries the native `required`. / Группе нужен выбор: у каждого радио нативный `required`. */
    required?: ComputedRef<boolean>;
    setValue: (value: TaoRadioValue) => void;
}

export const radioGroupKey: InjectionKey<TaoRadioGroupContext> = Symbol('taoRadioGroup');
