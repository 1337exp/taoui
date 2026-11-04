# Lab

Pages for working on one thing in detail, with the library read straight from `src/` (a change shows at once). They are
not part of the built showcase and not in the package.

| Page | What it is for |
|---|---|
| `/lab/loader.html` | The animation of `TaoLoader` frame by frame: frames at chosen moments of the cycle (`?marks=0,25,50`), a scrubber, slow motion, live samples at small sizes, a light / dark background. `?variant=ring` picks a look. |

Run the showcase (`npm --prefix showcase run dev`, port 5179) and open `http://localhost:5179/lab/loader.html`.

A new page: copy `loader.html` + `loader.js`, change the component. The trick is small: a wrapper with `data-at="30"` has all
its animations paused at 30 % of the longest duration inside it (read from the CSS, so a new duration is followed), and
`data-slow` plays at the speed of the slider.
