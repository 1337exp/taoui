import type { ComputedRef, InjectionKey } from 'vue';
import type { TaoSize } from './size';

/** Same scale as TaoSize. / Та же шкала, что TaoSize. */
export type TaoListSize = TaoSize;

export interface TaoListContext {
    size: ComputedRef<TaoListSize>;
}

export const taoListKey: InjectionKey<TaoListContext> = Symbol('taoList');
