import type { TaoPaletteDef } from './palette';

/**
 * The ready-made palettes. `data-tao-theme="<name>"` turns one on (dark); add `data-tao-mode="light"` for its light twin.
 * The CSS is `@1337exp/taoui/styles/palettes/<name>.css` (or `index.css` for all), generated from these stops.
 * Готовые палитры. `data-tao-theme="<name>"` включает палитру (тёмную), `data-tao-mode="light"` — её светлую версию.
 */
export const taoPalettes: readonly TaoPaletteDef[] = [
    { name: 'sunset', label: 'Sunset', stops: ['#EA6113', '#F88F22', '#FBB931', '#FFE3B3'] },
    { name: 'marple', label: 'Marple', stops: ['#CA2851', '#FF6766', '#FFB173', '#FFE3B3'] },
    { name: 'violet-dusk', label: 'Violet Dusk', stops: ['#502D55', '#935073', '#F6DBC0', '#F8F4E9'] },
    { name: 'ocean-blue', label: 'Ocean Blue', stops: ['#03045E', '#0277B6', '#48CBE4', '#CBF0F8'] },
    { name: 'pinheiro', label: 'Pinheiro', stops: ['#0B2A24', '#15574A', '#2E9E7E', '#B7E7CE'], status: { success: '#7fbf2f' } },
    { name: 'tokyo-night', label: 'Tokyo Night', stops: ['#130F40', '#5B2A86', '#C724B1', '#FF7EE3'] },
    { name: 'lagoon', label: 'Lagoon', stops: ['#031B2B', '#11BACA', '#FFA24D', '#A60E35'], accent: 1 },
];
