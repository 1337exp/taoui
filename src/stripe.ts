import { toneClass, type TaoToneName } from './tone';

/** Which side of a panel the stripe is on. / С какой стороны панели полоса. */
export type TaoStripe = 'top' | 'left' | 'bottom';

/** The stripe colour: a tone (the accent by default) or the palette gradient. / Цвет полосы: тон или градиент палитры. */
export type TaoStripeTone = TaoToneName | 'gradient';

/**
 * Classes that draw the stripe (see the Stripe block in styles/contexts/surface.css). No stripe, no classes.
 * Классы, которые рисуют полосу. Без полосы классов нет.
 */
export function stripeClasses(stripe?: TaoStripe | null, tone: TaoStripeTone = 'accent'): string[] {
    if (!stripe) {
        return [];
    }
    return [`tao-stripe-${stripe}`, tone === 'gradient' ? 'tao-stripe-gradient' : toneClass(tone)];
}
