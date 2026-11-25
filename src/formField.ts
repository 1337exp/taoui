import { computed, inject, onMounted, useId, type ComputedRef, type InjectionKey } from 'vue';
import type { TaoSize } from './size';

export interface TaoFormFieldContext {
    id: string;
    invalid: ComputedRef<boolean>;
    describedBy: ComputedRef<string | undefined>;
}

export const formFieldKey: InjectionKey<TaoFormFieldContext> = Symbol('taoFormField');

/**
 * The contract of a form control: what every field takes, under the same names. A control `extends` it and draws the control
 * with `useField(props)` and `nativeFieldAttrs(props)`.
 * Контракт элемента формы: что принимает каждое поле, под одними именами. Элемент `extends` его и рисует контрол через
 * `useField(props)` и `nativeFieldAttrs(props)`.
 */
export interface FieldProps {
    /** The id of the control, which the label of a `TaoFormField` points at; without it the field's own. / id элемента: на него указывает подпись `TaoFormField`; без него — свой. */
    id?: string;
    /** The name in a form: the value goes into `FormData` and a native submit. / Имя в форме: значение попадает в `FormData` и нативную отправку. */
    name?: string;
    /** Red frame and `aria-invalid`. The message goes to `error` of `TaoFormField`. / Красная рамка и `aria-invalid`. Текст ошибки — в `error` у `TaoFormField`. */
    invalid?: boolean;
    disabled?: boolean;
    /** Control size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
    size?: TaoSize;
    /** The field must be filled in (native `required`, so a form does not submit it empty). / Поле обязательно (нативный `required`: форма не отправит его пустым). */
    required?: boolean;
    /** Takes the focus when it appears. / Берёт фокус, когда появляется. */
    autofocus?: boolean;
}

/** A field whose value can be looked at but not changed: focusable, selectable, sent with the form. / Поле, значение которого можно смотреть, но не менять: фокус, выделение и отправка с формой остаются. */
export interface ReadableFieldProps extends FieldProps {
    readOnly?: boolean;
}

/**
 * What every form control needs from a surrounding TaoFormField: the id its label points at, the invalid state
 * (own `invalid` or the field's) and `aria-describedby`. Call it with the component props. `autofocus` is done here too.
 * Что нужно каждому контролу формы от окружающего TaoFormField: id для подписи, состояние ошибки и `aria-describedby`.
 * `autofocus` тоже здесь.
 */
export function useField(props: { invalid?: boolean; id?: string; autofocus?: boolean }) {
    const field = inject(formFieldKey, null);
    const localId = useId();
    const controlId = computed(() => props.id || field?.id || localId);
    const isInvalid = computed(() => Boolean(props.invalid) || Boolean(field?.invalid.value));
    const describedBy = computed(() => field?.describedBy.value);
    // the native `autofocus` is only honoured by a page that loads, not by a control a component draws later
    // нативный `autofocus` работает только при загрузке страницы, но не у контрола, который компонент нарисовал позже
    onMounted(() => {
        if (props.autofocus) {
            document.getElementById(controlId.value)?.focus();
        }
    });
    return { field, controlId, isInvalid, describedBy, localId };
}

/**
 * The native attributes the contract puts on the control itself: `name`, `required`, `readonly`. Bind it with `v-bind` on the
 * input (after the attributes of the user): `v-bind="nativeFieldAttrs(props)"`.
 * Нативные атрибуты, которые контракт ставит на сам элемент: `name`, `required`, `readonly`. Привязывать `v-bind` на input
 * (после атрибутов пользователя): `v-bind="nativeFieldAttrs(props)"`.
 */
export function nativeFieldAttrs(props: { name?: string; required?: boolean; readOnly?: boolean }) {
    return {
        name: props.name,
        required: props.required || undefined,
        readonly: props.readOnly || undefined,
    };
}
