import type { ComputedRef, InjectionKey } from 'vue';

export type TaoListSize = 'small' | 'medium' | 'large';

export interface TaoListContext {
    size: ComputedRef<TaoListSize>;
}

export const taoListKey: InjectionKey<TaoListContext> = Symbol('taoList');
