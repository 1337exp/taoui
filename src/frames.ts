/**
 * The `bordered` prop of a decorative panel over the frames context (`src/styles/contexts/frames.css`): not set, the
 * panel follows the context; `true` / `false` sets the two tokens for the panel's own area.
 * Проп `bordered` декоративной панели поверх контекста рамок: не задан — панель идёт за контекстом; `true` / `false`
 * выставляет два токена для её собственной области.
 */
export function frameStyle(bordered?: boolean | null): Record<string, string> | undefined {
    if (bordered === undefined || bordered === null) {
        return undefined;
    }
    return bordered ? { '--tao-frame-alpha': '100%', '--tao-frame-tint': '0%', '--tao-frame-fill': '0%' } : { '--tao-frame-alpha': '0%', '--tao-frame-tint': '6%', '--tao-frame-fill': '100%' };
}
