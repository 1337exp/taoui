export type TaoStageStatus = 'wait' | 'work' | 'ok' | 'bad';

export interface TaoStageItem {
    id: string;
    label?: string;
    status?: TaoStageStatus;
}
