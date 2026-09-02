export type TaoStageStatus = 'wait' | 'work' | 'ok' | 'bad';

export interface TaoStageItem {
    key: string;
    label?: string;
    /** `danger` — синоним `bad` */
    status?: TaoStageStatus | 'danger';
}
