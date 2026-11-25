// PostCSS plugin of the build and of the showcase: the CSS of a component goes into the `tao.components` layer.
// The core stylesheet puts its own files into layers by `@import url() layer(...)` (src/styles/index.css); a component brings its CSS
// by itself, from a `.vue` style or from a stylesheet the component imports, so this wraps those. The order of the layers is written
// again at the top of every file: the order is then the same whichever file the browser meets first, and an app that imports
// one component before the core stylesheet does not turn the kit upside down. The CSS of an app is not in any layer, and a rule
// outside of a layer beats every rule inside one whatever its specificity: the app wins without `!important` and without `:deep`.
// Плагин PostCSS сборки и витрины: CSS компонента уходит в слой `tao.components`.
// Ядро стилей раскладывает свои файлы по слоям через `@import url() layer(...)` (src/styles/index.css); компонент приносит CSS сам,
// из стиля `.vue` или из таблицы, которую он импортирует, и вот это здесь заворачивается. Порядок слоёв записан заново в начале
// каждого файла: порядок тогда один, какой бы файл браузер ни встретил первым, и приложение, импортирующее один компонент раньше
// ядра, не переворачивает набор. CSS приложения ни в каком слое, а правило вне слоя бьёт любое правило в слое при любой
// специфичности: приложение побеждает без `!important` и без `:deep`.
export const TAO_LAYERS = ['tao.tokens', 'tao.themes', 'tao.base', 'tao.typography', 'tao.contexts', 'tao.components'];

// `src` is the folder of the kit's sources (the showcase and the apps have `.vue` files of their own, and those stay outside of the layers)
// `src` — папка исходников набора (у витрины и приложений свои `.vue`, и они остаются вне слоёв)
export function taoLayers(src) {
    const SRC = `${String(src).replaceAll('\\', '/').replace(/\/$/, '')}/`;
    return {
        postcssPlugin: 'tao-layers',
        Once(root, { AtRule }) {
            const file = (root.source && root.source.input && root.source.input.file) || '';
            const clean = file.split('?')[0];
            // the core stylesheet is layered by its own imports and the palettes are meant to beat the theme: neither is wrapped here
            const slashed = clean.replaceAll('\\', '/');
            const ours = (slashed.startsWith(SRC) && slashed.endsWith('.vue')) || slashed.endsWith('/styles/date-popup.css');
            if (!ours) {
                return;
            }
            const order = TAO_LAYERS.join(', ');
            const wrap = new AtRule({ name: 'layer', params: 'tao.components' });
            // `@charset` / `@import` must stay first; a component style has neither, so everything goes inside
            wrap.append(root.nodes.map((node) => node.clone()));
            root.removeAll();
            root.append(new AtRule({ name: 'layer', params: order }));
            root.append(wrap);
        },
    };
}
taoLayers.postcss = true;
