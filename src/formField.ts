import type { ComputedRef, InjectionKey } from 'vue';

export interface TaoFormFieldContext {
    id: string;
    invalid: ComputedRef<boolean>;
    describedBy: ComputedRef<string | undefined>;
}

export const formFieldKey: InjectionKey<TaoFormFieldContext> = Symbol('taoFormField');
