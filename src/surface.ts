/**
 * What a panel is made of: `flat` fill, `grain` (film grain), `glass` (blurred, translucent).
 * Из чего сделана панель: `flat` — заливка, `grain` — плёночное зерно, `glass` — размытое стекло.
 */
export type TaoSurface = 'flat' | 'grain' | 'glass';

export function surfaceClass(surface?: TaoSurface | null): string | undefined {
    return surface && surface !== 'flat' ? `tao-surface-${surface}` : undefined;
}
