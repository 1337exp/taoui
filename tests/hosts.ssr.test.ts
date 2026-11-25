// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString, type SSRContext } from '@vue/server-renderer';
import { describe, expect, it } from 'vitest';
import TaoHosts from '../src/components/TaoHosts.vue';

// A host draws only after it is mounted: on the server nothing goes into the page or into the teleports, whatever the number of hosts, so
// hydration agrees (the shells of the toast viewports were the mismatch).
// Хост рисует только после монтирования: на сервере в страницу и в телепорты ничего не попадает при любом числе хостов, поэтому гидратация
// сходится (несовпадением были оболочки viewport тостов).
describe('TaoHosts on the server', () => {
    it.each([1, 2])('%i host(s): the teleports are empty', async (count) => {
        const ctx: SSRContext = {};
        const app = createSSRApp(defineComponent({ render: () => h('div', Array.from({ length: count }, () => h(TaoHosts))) }));
        await renderToString(app, ctx);
        expect(ctx.teleports?.body ?? '').toBe('');
    });
});
