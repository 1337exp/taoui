import { devWarning } from './deprecate';

const tones: readonly string[] = ['accent', 'neutral', 'success', 'danger', 'warning', 'info'];

/** Status color shared by Alert, Tag, Button `tone`, Avatar `dot`, toast. / Цвет статуса, общий для Alert, Tag, Button `tone`, Avatar `dot`, toast. */
export type TaoTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

/** A tone, or the theme's own accent (what a component uses when no tone is given). / Тон или акцент темы (то, что берёт компонент без тона). */
export type TaoToneName = TaoTone | 'accent';

/**
 * Class that sets the `--tao-tone*` tokens on an element (see styles/tone.css).
 * Unlike a size, a tone does not inherit: no tone → the accent.
 * Класс с токенами тона для элемента (см. styles/tone.css). В отличие от размера, тон не наследуется: без тона — акцент.
 */
export function toneClass(tone?: TaoToneName | null): string {
    if (tone && !tones.includes(tone)) {
        devWarning(`tone:${tone}`, `unknown tone "${tone}": use ${tones.join(' / ')}. The element gets no tone colours.`);
    }
    return `tao-tone-${tone || 'accent'}`;
}
