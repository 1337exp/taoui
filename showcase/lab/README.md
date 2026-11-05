# Lab

Pages for working on one thing in detail, with the library read straight from `src/` (a change shows at once). They are
not part of the built showcase and not in the package.

| Page | What it is for |
|---|---|
| `/lab/rtl.html` | The same components twice, left to right and right to left (a container with `dir="rtl"`), to see what mirrors and what does not; the checkbox sets `dir` on `<html>` too, for the panels that are teleported to `<body>`. |
| `/lab/subpixel.html` | Do the floating parts stand on whole pixels? "Check all" opens `confirm()` (three kinds), `TaoModal`, `TaoDrawer`, `toast()` and `TaoTooltip` one after another and measures the position of the panel and of the text and buttons in it: a row is bad when its top is on a fraction of a pixel (a button on a fraction jumps when it is repainted under the pointer). It also says whether the room left over of a centred panel is odd. Run it in a window of each parity (the pane's Viewport menu, 845 and 846 high): a panel that is clean in one and not in the other lacks the half-pixel nudge (`useWholePixelPanel`). |
| `/lab/loader.html` | The animation of `TaoLoader` frame by frame: frames at chosen moments of the cycle (`?marks=0,25,50`), a scrubber, slow motion, live samples at small sizes, a light / dark background. `?variant=ring` picks a look. |

Run the showcase (`npm --prefix showcase run dev`, port 5179) and open `http://localhost:5179/lab/loader.html`.

A new page: copy `loader.html` + `loader.js`, change the component. The trick is small: a wrapper with `data-at="30"` has all
its animations paused at 30 % of the longest duration inside it (read from the CSS, so a new duration is followed), and
`data-slow` plays at the speed of the slider.

## RTL status (checked with `/lab/rtl.html`)

Not claimed yet. Mirrors by itself (flex / grid): the order of buttons, tags, tabs, segments, fields with `prefix` / `suffix`, the icons of Select, Combobox and Date, Alert, Stages, Breadcrumb, the columns of Table, the fill of Progress, the order of the pager. Not yet: the arrow keys (`ArrowRight` always means next: Tabs, Slider, Menu, Menubar, Toolbar, Tree, Calendar, Carousel, Heatmap, Split, ColorPicker, listNav), the direction of Slider (zero is always on the left), chevrons that stay as they are, floating panels (`bottom-start` is the left edge; panels teleported to `<body>` follow `dir` of `<html>` only), the steppers of InputNumber, a few literal `text-align: left`, the corners of Toast and ScrollTop.
