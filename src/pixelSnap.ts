/**
 * A panel centred in a box stands on a fraction of a pixel when the room left over is odd (a box of 846px, a panel of 143px: the gap is
 * 703, so the panel starts at 351.5). Its text and buttons then stand on halves, and a button jumps by a pixel when it is repainted under
 * the pointer. A margin of 1px on the panel moves a centred panel by half a pixel, which brings it back to a whole one.
 * Панель, отцентрованная в блоке, стоит на доле пикселя, когда оставшееся место нечётное (блок 846px, панель 143px: зазор 703,
 * панель начинается с 351,5). Её текст и кнопки тогда стоят на половинках, и кнопка прыгает на пиксель, когда её перерисовывают под
 * указателем. Отступ 1px у панели сдвигает отцентрованную панель на полпикселя, и она снова стоит на целом.
 *
 * Returns the margin in px (0 or 1) to put on the panel, from the whole-pixel sizes of the box and of the panel.
 * Возвращает отступ в px (0 или 1), который нужно поставить панели, по целым размерам блока и панели.
 */
export function centringNudge(box: number, panel: number): 0 | 1 {
    return Math.abs(Math.round(box) - Math.round(panel)) % 2 === 1 ? 1 : 0;
}
