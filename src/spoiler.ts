import type { ComputedRef, InjectionKey } from 'vue';

export type TaoSpoilerName = string | number;

export interface TaoSpoilerGroupContext {
    model: ComputedRef<TaoSpoilerName | null | undefined>;
    setOpen: (name: TaoSpoilerName | null) => void;
}

export const spoilerGroupKey: InjectionKey<TaoSpoilerGroupContext> = Symbol('taoSpoilerGroup');
