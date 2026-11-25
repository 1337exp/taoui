import { computed, inject, useId, type ComputedRef, type InjectionKey } from 'vue';

export interface TaoFormFieldContext {
    id: string;
    invalid: ComputedRef<boolean>;
    describedBy: ComputedRef<string | undefined>;
}

export const formFieldKey: InjectionKey<TaoFormFieldContext> = Symbol('taoFormField');

/**
 * What every form control needs from a surrounding TaoFormField: the id its label points at, the invalid state
 * (own `invalid` or the field's) and `aria-describedby`. Call it with the component props.
 * Что нужно каждому контролу формы от окружающего TaoFormField: id для подписи, состояние ошибки и `aria-describedby`.
 */
export function useField(props: { invalid?: boolean; id?: string }) {
    const field = inject(formFieldKey, null);
    const localId = useId();
    const controlId = computed(() => props.id || field?.id || localId);
    const isInvalid = computed(() => Boolean(props.invalid) || Boolean(field?.invalid.value));
    const describedBy = computed(() => field?.describedBy.value);
    return { field, controlId, isInvalid, describedBy, localId };
}
