import { describe, expect, it } from 'vitest';
import { cornerRadii, radiusVars, squaredCorners } from '../src/radius';

// 5.56.0: `radius` of a panel can be given by corner, apart from the components.
// 5.56.0: `radius` панели можно задать по углам, отдельно от компонентов.

describe('cornerRadii', () => {
    it('one length is every corner; a number is px', () => {
        expect(cornerRadii(12)).toEqual(['12px', '12px', '12px', '12px']);
        expect(cornerRadii(0)).toEqual(['0px', '0px', '0px', '0px']);
        expect(cornerRadii('1rem')).toEqual(['1rem', '1rem', '1rem', '1rem']);
        expect(cornerRadii('50%')).toEqual(['50%', '50%', '50%', '50%']);
    });

    it('an array follows CSS border-radius: 4 are the corners clockwise from the top left', () => {
        expect(cornerRadii([0, 0, 12, 12])).toEqual(['0px', '0px', '12px', '12px']);
        expect(cornerRadii([1, 2, 3, 4])).toEqual(['1px', '2px', '3px', '4px']);
    });

    it('2 values are the diagonals, 3 values the top left, the two others, the bottom right', () => {
        expect(cornerRadii([0, 12])).toEqual(['0px', '12px', '0px', '12px']);
        expect(cornerRadii([1, 2, 3])).toEqual(['1px', '2px', '3px', '2px']);
        expect(cornerRadii([8])).toEqual(['8px', '8px', '8px', '8px']);
    });

    it('a string of lengths means the same as an array', () => {
        expect(cornerRadii('0 0 16px 16px')).toEqual(['0px', '0px', '16px', '16px']);
        expect(cornerRadii('  4px   8px ')).toEqual(['4px', '8px', '4px', '8px']);
    });

    it('a length with spaces inside stays whole', () => {
        expect(cornerRadii('calc(1px + 2px) 0')).toEqual(['calc(1px + 2px)', '0px', 'calc(1px + 2px)', '0px']);
        expect(cornerRadii('var(--tao-radius-lg, 1px 2px)')).toEqual(['var(--tao-radius-lg, 1px 2px)', 'var(--tao-radius-lg, 1px 2px)', 'var(--tao-radius-lg, 1px 2px)', 'var(--tao-radius-lg, 1px 2px)']);
        expect(cornerRadii(['var(--a)', 'calc(1px + 2px)'])).toEqual(['var(--a)', 'calc(1px + 2px)', 'var(--a)', 'calc(1px + 2px)']);
    });

    it('an empty or null entry of an array is a square corner', () => {
        expect(cornerRadii([null as never, 12])).toEqual(['0px', '12px', '0px', '12px']);
        expect(cornerRadii(['', 12])).toEqual(['0px', '12px', '0px', '12px']);
    });

    it('nothing, too many values and an elliptical corner cannot be told', () => {
        expect(cornerRadii(undefined)).toBeNull();
        expect(cornerRadii(null)).toBeNull();
        expect(cornerRadii('')).toBeNull();
        expect(cornerRadii([])).toBeNull();
        expect(cornerRadii([1, 2, 3, 4, 5])).toBeNull();
        expect(cornerRadii('12px / 24px')).toBeNull();
        expect(cornerRadii('12px/24px')).toBeNull();
    });
});

describe('radiusVars', () => {
    it('no radius, no properties: the panel keeps its default', () => {
        expect(radiusVars(undefined)).toEqual({});
        expect(radiusVars('')).toEqual({});
    });

    it('equal corners are one property, as before', () => {
        expect(radiusVars(20)).toEqual({ '--tao-radius': '20px' });
        expect(radiusVars([8, 8, 8, 8])).toEqual({ '--tao-radius': '8px' });
        expect(radiusVars('var(--tao-radius-lg)')).toEqual({ '--tao-radius': 'var(--tao-radius-lg)' });
    });

    it('different corners: the shorthand and the four corners', () => {
        expect(radiusVars([0, 0, 12, 12])).toEqual({
            '--tao-radius': '0px 0px 12px 12px',
            '--tao-radius-tl': '0px',
            '--tao-radius-tr': '0px',
            '--tao-radius-br': '12px',
            '--tao-radius-bl': '12px',
        });
        expect(radiusVars('0 12px')['--tao-radius-bl']).toBe('12px');
    });

    it('what cannot be told goes on as it is', () => {
        expect(radiusVars('12px / 24px')).toEqual({ '--tao-radius': '12px / 24px' });
        expect(radiusVars('1px 2px 3px 4px 5px')).toEqual({ '--tao-radius': '1px 2px 3px 4px 5px' });
        expect(radiusVars([1, 2, 3, 4, 5])).toEqual({});
    });
});

// 5.57.0: `square` makes corners sharp and keeps the radius as it is
// 5.57.0: `square` делает углы прямыми и оставляет радиус как есть
describe('squaredCorners', () => {
    it('a side is its two corners, a corner is one', () => {
        expect(squaredCorners('top')).toEqual(['tl', 'tr']);
        expect(squaredCorners('bottom')).toEqual(['br', 'bl']);
        expect(squaredCorners('left')).toEqual(['tl', 'bl']);
        expect(squaredCorners('right')).toEqual(['tr', 'br']);
        expect(squaredCorners('bottom-left')).toEqual(['bl']);
    });

    it('several: an array or a space-separated string, each corner once, in a fixed order', () => {
        expect(squaredCorners(['bottom-right', 'top-left'])).toEqual(['tl', 'br']);
        expect(squaredCorners('top-left bottom-right')).toEqual(['tl', 'br']);
        expect(squaredCorners(['top', 'left'])).toEqual(['tl', 'tr', 'bl']);
        expect(squaredCorners(['top', 'top-left'])).toEqual(['tl', 'tr']);
    });

    it('nothing, an empty list and a name it does not know make nothing sharp', () => {
        expect(squaredCorners(undefined)).toEqual([]);
        expect(squaredCorners(null)).toEqual([]);
        expect(squaredCorners([])).toEqual([]);
        expect(squaredCorners('')).toEqual([]);
        expect(squaredCorners('middle')).toEqual([]);
    });
});

describe('radiusVars with square', () => {
    it('only the squared corners are written; the radius of the rest is left to the panel', () => {
        expect(radiusVars(undefined, 'top')).toEqual({ '--tao-radius-tl': '0px', '--tao-radius-tr': '0px' });
    });

    it('with a radius of its own the single property stays, the squared corners come on top', () => {
        expect(radiusVars(20, 'bottom-left')).toEqual({ '--tao-radius': '20px', '--tao-radius-bl': '0px' });
    });

    it('over an array the squares win', () => {
        const vars = radiusVars([8, 16, 24, 32], 'right');
        expect(vars['--tao-radius-tl']).toBe('8px');
        expect(vars['--tao-radius-tr']).toBe('0px');
        expect(vars['--tao-radius-br']).toBe('0px');
        expect(vars['--tao-radius-bl']).toBe('32px');
    });

    it('no square, nothing changes', () => {
        expect(radiusVars(20, undefined)).toEqual(radiusVars(20));
        expect(radiusVars(20, [])).toEqual({ '--tao-radius': '20px' });
    });
});
