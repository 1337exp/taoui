import type { InjectionKey, Ref } from 'vue';

export type TaoSpoilerName = string | number;

export interface TaoSpoilerGroupContext {
    model: Readonly<Ref<TaoSpoilerName | null | undefined>>;
    setOpen: (name: TaoSpoilerName | null) => void;
}

export const spoilerGroupKey: InjectionKey<TaoSpoilerGroupContext> = Symbol('taoSpoilerGroup');
