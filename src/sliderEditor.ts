import { nextTick, ref, watch, type Ref } from 'vue';
import { nearestThumb, snapValue, type TaoSliderScale } from './slider';

/**
 * Typing the value of TaoSlider (`editable`): a field over the bar, in the place of the number. Enter or leaving the field sets the
 * text, snapped to the scale and kept in range (a text that is not a number changes nothing, as in TaoInputNumber); Esc drops it.
 * Ввод значения у TaoSlider (`editable`): поле поверх полосы, на месте цифры. Enter или уход из поля ставит набранное, прижатое
 * к шкале и в границах (не число значение не меняет, как у TaoInputNumber); Esc отменяет.
 */

/** Десятичная запись: «0x10» или «1e500» значением не считаем, хотя Number() их разберёт. / A decimal text: "0x10" or "1e500" is not a value, though Number() reads it. */
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

/** The number a typed text means, or null when it is not a plain decimal. / Число, которое значит набранный текст, или null, если это не десятичная запись. */
export function parseTyped(text: string): number | null {
    const typed = text.trim().replace(/\s/g, '').replace(',', '.');
    if (!DECIMAL.test(typed)) return null;
    const parsed = Number(typed);
    return Number.isFinite(parsed) ? parsed : null;
}

export interface SliderEditorOptions {
    /** Editing is allowed now (`editable` and not `disabled`). / Правка сейчас разрешена (`editable` и не `disabled`). */
    enabled: () => boolean;
    values: () => readonly number[];
    scale: () => TaoSliderScale;
    /** The thumb that was last touched; the editor moves it to the thumb being edited. / Ручка, которой касались последней. */
    activeThumb: Ref<number>;
    /** Puts a thumb on a value (already snapped). / Ставит ручку в значение (уже прижатое). */
    set: (index: number, target: number, final: boolean) => void;
    /** Ends a drag that is going on. / Завершает идущее перетаскивание. */
    stopDrag: () => void;
    focusThumb: (index: number) => void;
    /** The value under the pointer. / Значение под указателем. */
    valueUnder: (event: MouseEvent) => number;
}

export function useSliderEditor(o: SliderEditorOptions) {
    const editorRef = ref<HTMLInputElement | null>(null);
    /** Номер ручки, значение которой набирают; null: поле закрыто. / The thumb being typed for; null: the field is closed. */
    const editing = ref<number | null>(null);
    const draft = ref('');

    function open(index: number) {
        if (!o.enabled()) return;
        o.stopDrag();
        o.activeThumb.value = index;
        draft.value = String(o.values()[index]);
        editing.value = index;
        void nextTick(() => {
            editorRef.value?.focus();
            editorRef.value?.select();
        });
    }

    /** Закрывает поле и возвращает номер ручки, которую правили (null, если поле уже закрыто). / Closes the field and returns the thumb that was edited (null: already closed). */
    function close(refocus: boolean): number | null {
        const index = editing.value;
        editing.value = null;
        if (refocus && index !== null) void nextTick(() => o.focusThumb(index));
        return index;
    }

    /** Ставит набранное; уход из поля (blur) ставит тоже. / Sets the typed text; leaving the field (blur) sets it too. */
    function commit(refocus = false) {
        const index = close(refocus);
        if (index === null) return;
        const parsed = parseTyped(draft.value);
        if (parsed === null) return;
        o.set(index, snapValue(parsed, o.scale()), true);
    }

    function cancel() {
        close(true);
    }

    /** Правый клик (на сенсоре долгое нажатие) и двойной клик по полосе: правим ближайшую к указателю ручку. / A right click (a long press on touch) or a double click on the bar edits the thumb nearest to the pointer. */
    function onGesture(event: MouseEvent) {
        if (!o.enabled()) return;
        event.preventDefault();
        open(nearestThumb(o.values(), o.valueUnder(event), o.activeThumb.value));
    }

    watch(
        () => !o.enabled(),
        (off) => {
            if (off) editing.value = null;
        },
    );

    return { editorRef, editing, draft, open, commit, cancel, onGesture };
}
