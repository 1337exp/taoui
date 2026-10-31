/**
 * The order the digits of `TaoCounter` start to roll in. The digit that changed on the right goes first and the ones
 * to its left follow one after another, so they land in turn, like the wheels of an odometer, not all at once.
 * Pure, so it is tested without a DOM.
 * В каком порядке начинают катиться цифры `TaoCounter`. Первой идёт изменившаяся цифра справа, левые за ней, одна за
 * другой: они встают по очереди, как колёсики одометра, а не разом. Чистая логика, без DOM.
 */

/**
 * For every digit of `next` (left to right): 0 for the first digit that rolls, 1 for the next one to the left, and so on.
 * A digit that stays has no turn (0). The digits are lined up by their right edge, so 99 → 100 changes all three. With no
 * `previous` (the first render) nothing rolls and every rank is 0.
 * Для каждой цифры `next` (слева направо): 0 у той, что катится первой, 1 у следующей левее и так далее. Цифра, которая не
 * меняется, очереди не занимает (0). Цифры выравниваются по правому краю, поэтому 99 → 100 меняет все три. Без `previous`
 * (первый показ) ничего не катится, все ранги 0.
 */
export function rollRanks(previous: readonly string[] | undefined, next: readonly string[]): number[] {
    if (!previous) {
        return next.map(() => 0);
    }
    const ranks = next.map(() => 0);
    let rank = 0;
    for (let offset = 1; offset <= next.length; offset += 1) {
        const index = next.length - offset;
        if (previous[previous.length - offset] !== next[index]) {
            ranks[index] = rank;
            rank += 1;
        }
    }
    return ranks;
}
