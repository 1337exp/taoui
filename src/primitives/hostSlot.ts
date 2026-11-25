import { shallowRef } from 'vue';

/**
 * The one place that draws a thing which many hosts could draw (the toasts, the confirm dialog): the first host to claim it is the owner,
 * the others wait in line, and when the owner goes away the next one in line becomes the owner at once, so the survivor starts drawing
 * what is waiting in the store. The owner is a ref, so a host that lost the claim redraws when it wins it. On the server nobody holds
 * anything (one module serves every request) and every host counts as the owner.
 * Одно место, где рисуют то, что могли бы рисовать многие хосты (тосты, диалог подтверждения): первый занявший становится
 * владельцем, остальные стоят в очереди, а когда владелец уходит, следующий становится владельцем сразу и начинает рисовать то, что
 * ждёт в хранилище. Владелец это ref, поэтому хост, проигравший заявку, перерисуется, когда её выиграет. На сервере никто ничего не
 * держит (один модуль обслуживает все запросы), и каждый хост считается владельцем.
 */
export function createHostSlot() {
    const line: symbol[] = [];
    const owner = shallowRef<symbol | null>(null);
    const isClient = () => typeof window !== 'undefined';

    return {
        /** Joins the line (once); the first in line owns the place. / Встаёт в очередь (один раз); первый в очереди владеет местом. */
        claim(who: symbol) {
            if (!isClient()) {
                return;
            }
            if (!line.includes(who)) {
                line.push(who);
            }
            owner.value = line[0] ?? null;
        },
        /** Leaves the line; the next one in line owns the place. / Уходит из очереди; следующий в очереди получает место. */
        release(who: symbol) {
            const at = line.indexOf(who);
            if (at !== -1) {
                line.splice(at, 1);
            }
            owner.value = line[0] ?? null;
        },
        /** Reactive: does this host draw now? / Реактивно: рисует ли этот хост сейчас? */
        isOwner: (who: symbol) => !isClient() || owner.value === who,
        /** Is any host in place? / Есть ли хоть один хост? */
        has: () => owner.value !== null,
    };
}
