// Vite plugin of the library build: gives every module back the `import` of its CSS.
// Vite's library mode writes the CSS of a module as its own file but drops the `import` of it from the JS, so a consumer who imports one
// component would get the component and not its styles. With the import in place the bundler of the consumer takes the CSS together with the
// component, and an unused component brings nothing. A component with an unscoped `<style>` and nothing else gets its CSS attached to the
// entry by Vite, so a CSS file named like a component (`components/TaoKbd.css`) goes to that component's module; the entries (`index.js`,
// `plugin.js`) import no CSS at all (only `styles.js`, which exists to produce the core stylesheet).
// Плагин сборки библиотеки: возвращает каждому модулю `import` его CSS.
// Библиотечный режим Vite пишет CSS модуля отдельным файлом, но выбрасывает его `import` из JS, и потребитель, который импортирует один
// компонент, получил бы компонент без стилей. С импортом на месте сборщик потребителя берёт CSS вместе с компонентом, а неиспользуемый
// компонент ничего не приносит. У компонента только с unscoped `<style>` Vite приписывает CSS входу, поэтому файл CSS с именем компонента
// (`components/TaoKbd.css`) отдаётся модулю этого компонента; входы (`index.js`, `plugin.js`) CSS не импортируют вовсе (кроме `styles.js`,
// который нужен, чтобы получить ядро стилей).
import { dirname, posix } from 'node:path';
import type { Plugin } from 'vite';

type CssChunk = { type: 'chunk'; fileName: string; code: string; isEntry: boolean; viteMetadata?: { importedCss: Set<string> } };

export function injectCssImports(): Plugin {
    return {
        name: 'tao-inject-css-imports',
        enforce: 'post',
        generateBundle(_, bundle) {
            const chunks = Object.values(bundle).filter((item): item is never => item.type === 'chunk') as unknown as CssChunk[];

            // `components/TaoKbd.vue.js` is the wrapper a barrel imports; `components/TaoKbd2.vue.js` is the script part inside it
            // `components/TaoKbd.vue.js` — обёртка, которую импортирует баррель; `components/TaoKbd2.vue.js` — скриптовая часть внутри
            const owners = new Map<string, string>();
            for (const chunk of chunks) {
                const match = /^(.*\/)?([^/]+?)\.vue\.js$/.exec(chunk.fileName);
                if (match && !/2$/.test(match[2]!)) {
                    owners.set(`${match[1] ?? ''}${match[2]}.css`, chunk.fileName);
                }
            }

            const wanted = new Map<string, Set<string>>();
            const want = (into: string, css: string) => {
                if (!wanted.has(into)) wanted.set(into, new Set());
                wanted.get(into)!.add(css);
            };
            for (const chunk of chunks) {
                for (const file of chunk.viteMetadata?.importedCss ?? []) {
                    const owner = owners.get(file);
                    if (owner) {
                        want(owner, file);
                    } else if (!chunk.isEntry || chunk.fileName === 'styles.js') {
                        want(chunk.fileName, file);
                    }
                }
            }

            for (const chunk of chunks) {
                const files = wanted.get(chunk.fileName);
                if (!files) continue;
                const here = dirname(chunk.fileName);
                const imports = [...files].map((file) => {
                    const relative = posix.relative(here, file);
                    return `import "${relative.startsWith('.') ? relative : `./${relative}`}";`;
                });
                chunk.code = `${imports.join('\n')}\n${chunk.code}`;
            }
        },
    };
}
