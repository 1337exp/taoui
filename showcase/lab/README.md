# Lab

Pages for working on one thing in detail, with the library read straight from `src/` (a change shows at once). They are
not part of the built showcase and not in the package.

| Page | What it is for |
|---|---|
| `/lab/rtl.html` | The same components twice, left to right and right to left (a container with `dir="rtl"`), to see what mirrors and what does not; the checkbox sets `dir` on `<html>` too, for the panels that are teleported to `<body>`. |
| `/lab/loader.html` | The animation of `TaoLoader` frame by frame: frames at chosen moments of the cycle (`?marks=0,25,50`), a scrubber, slow motion, live samples at small sizes, a light / dark background. `?variant=ring` picks a look. |

Run the showcase (`npm --prefix showcase run dev`, port 5179) and open `http://localhost:5179/lab/loader.html`.

A new page: copy `loader.html` + `loader.js`, change the component. The trick is small: a wrapper with `data-at="30"` has all
its animations paused at 30 % of the longest duration inside it (read from the CSS, so a new duration is followed), and
`data-slow` plays at the speed of the slider.

## RTL status (checked with `/lab/rtl.html`)

Not claimed yet. Mirrors by itself (flex / grid): the order of buttons, tags, tabs, segments, fields with `prefix` / `suffix`, the icons of Select, Combobox and Date, Alert, Stages, Breadcrumb, the columns of Table, the fill of Progress, the order of the pager. Not yet: the arrow keys (`ArrowRight` always means next: Tabs, Slider, Menu, Menubar, Toolbar, Tree, Calendar, Carousel, Heatmap, Split, ColorPicker, listNav), the direction of Slider (zero is always on the left), chevrons that stay as they are, floating panels (`bottom-start` is the left edge; panels teleported to `<body>` follow `dir` of `<html>` only), the steppers of InputNumber, a few literal `text-align: left`, the corners of Toast and ScrollTop.
