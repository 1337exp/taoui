import { ref, type Ref } from 'vue';
import { glideDuration, glideTarget } from './carousel';

/**
 * The momentum of TaoCarousel: after a mouse drag the strip rolls on from the speed it was let go at and settles on a slide; the
 * wheel settles the same way from rest. The pointer positions of the drag give the release speed. The strip is the component's: this
 * only moves its `scrollLeft` and says where it landed.
 * Инерция TaoCarousel: после перетаскивания мышью лента катится дальше с той скоростью, с какой её отпустили, и встаёт на слайд;
 * колёсико доводит так же с места. Позиции указателя при протяжке дают скорость отпускания. Лента принадлежит компоненту: здесь
 * только двигается её `scrollLeft` и сообщается, где она остановилась.
 */
export interface CarouselGlideOptions {
    track: Ref<HTMLElement | null>;
    /** Slide width + gap; 0 while the strip is not measured. / Ширина слайда + зазор; 0, пока лента не измерена. */
    pitch: () => number;
    reducedMotion: Ref<boolean>;
    /** The real slide a scrollLeft stands on. / Настоящий слайд, на котором стоит scrollLeft. */
    nearest: (scrollLeft?: number) => number;
    setIndex: (index: number) => void;
    /** A cycle goes back to its middle set when a glide ends. / Цикл возвращается в средний набор, когда доводка кончилась. */
    recenter: () => void;
}

export function useCarouselGlide(o: CarouselGlideOptions) {
    /** Momentum after a mouse drag: scroll-snap stays off until the glide lands on a slide. / Инерция после перетаскивания мышью. */
    const gliding = ref(false);
    let glideFrame = 0;
    /** Recent pointer positions for the release speed. / Последние позиции указателя — для скорости при отпускании. */
    let samples: { x: number; t: number }[] = [];

    function record(x: number) {
        const t = performance.now();
        samples.push({ x, t });
        while (samples.length > 2 && t - samples[0]!.t > 100) {
            samples.shift();
        }
    }

    function clearSamples() {
        samples = [];
    }

    /** Scroll speed at release, px/ms; 0 if the pointer stood still before letting go. Forgets the samples. / Скорость прокрутки при отпускании. */
    function releaseVelocity() {
        const first = samples[0];
        const last = samples[samples.length - 1];
        samples = [];
        if (!first || !last || last.t === first.t || performance.now() - last.t > 80) {
            return 0;
        }
        // pointer moves right → content scrolls left / указатель вправо → прокрутка влево
        return -(last.x - first.x) / (last.t - first.t);
    }

    function cancel() {
        if (!glideFrame) {
            return;
        }
        cancelAnimationFrame(glideFrame);
        glideFrame = 0;
        gliding.value = false;
    }

    /** Where momentum would stop, rounded to a whole slide. / Где остановит инерция, с точностью до целого слайда. */
    function target(from: number, velocity: number) {
        const el = o.track.value;
        const pitch = o.pitch();
        if (!el || pitch <= 0) {
            return from;
        }
        return glideTarget(from, velocity, pitch, el.scrollWidth - el.clientWidth);
    }

    function finish() {
        glideFrame = 0;
        gliding.value = false;
        o.recenter();
        o.setIndex(o.nearest());
    }

    /**
     * Ease-out from the current position to `to`. Its starting speed matches the release speed,
     * so the strip keeps moving the way it was thrown and settles on a slide.
     * Плавно к `to`; начальная скорость равна скорости броска — полоса не дёргается и встаёт на слайд.
     */
    function glide(to: number, velocity: number) {
        const el = o.track.value;
        if (!el) {
            return;
        }

        cancel();
        const from = el.scrollLeft;
        const distance = to - from;
        o.setIndex(o.nearest(to));

        if (Math.abs(distance) < 1 || o.reducedMotion.value) {
            el.scrollLeft = to;
            return;
        }

        const duration = glideDuration(distance, velocity);
        const start = performance.now();
        gliding.value = true;

        const frame = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            el.scrollLeft = from + distance * (1 - (1 - t) ** 3);
            if (t < 1) {
                glideFrame = requestAnimationFrame(frame);
                return;
            }
            finish();
        };
        glideFrame = requestAnimationFrame(frame);
    }

    return { gliding, record, clearSamples, releaseVelocity, cancel, target, glide };
}
