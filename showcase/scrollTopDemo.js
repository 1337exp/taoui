import { reactive } from 'vue'

// Shared by App.vue (the one real TaoScrollTop of the page) and DemoScrollTop (its controls).
export const scrollTopDemo = reactive({ variant: 'solid', side: 'right', label: 'on' })
