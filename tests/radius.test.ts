import { describe, expect, it } from 'vitest';
import { cornerRadii, radiusVars } from '../src/radius';

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
