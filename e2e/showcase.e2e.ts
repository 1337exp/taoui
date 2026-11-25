import type { Browser, Page } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { launch, newPage, section, startShowcase } from './harness';

// What the unit tests cannot see: real layout, computed style, real focus, the media query of reduced motion. About ten checks of the
// promises the kit makes, against the showcase in a real Chrome or Edge.
// То, чего не видят модульные тесты: настоящая вёрстка, вычисленные стили, настоящий фокус, media query reduced motion. Около десяти проверок
// обещаний набора против витрины в настоящем Chrome или Edge.

let server: Awaited<ReturnType<typeof startShowcase>>;
let browser: Browser | null = null;

beforeAll(async () => {
    browser = await launch();
    if (!browser) throw new Error('Neither Chrome nor Edge could be launched: the real-browser tests need one of them');
    server = await startShowcase();
});
afterAll(async () => {
    await browser?.close();
    server?.stop();
});

async function open(options: { reducedMotion?: 'reduce' | 'no-preference' } = {}) {
    const { context, page } = await newPage(browser!, server.url, options);
    return { page, close: () => context.close() };
}

/** The nth button in the section whose heading matches. / n-я кнопка в разделе, чей заголовок подходит. */
const sectionButton = (page: Page, heading: RegExp, nth = 0) => page.locator('section', { has: page.locator('h2', { hasText: heading }) }).locator('button').nth(nth);

const anyInert = (page: Page) => page.evaluate(() => [...document.body.children].some((el) => el.hasAttribute('inert')));

describe('the kit in a real browser', () => {
    it('the CSS of an app outside of the layers beats the kit, without !important', async () => {
        const { page, close } = await open();
        await section(page, 'button');
        const colour = await page.evaluate(() => {
            const style = document.createElement('style');
            // no transition: a computed value read in the middle of one is not the end value
            style.textContent = '.tao-button { background-color: rgb(1, 2, 3); transition: none; }';
            document.head.append(style);
            return getComputedStyle(document.querySelector('.tao-button')!).backgroundColor;
        });
        expect(colour).toBe('rgb(1, 2, 3)');
        await close();
    });

    it('one radius knob: the steps are whole pixels and follow the base', async () => {
        const { page, close } = await open();
        const radii = await page.evaluate(() => {
            const probe = document.createElement('div');
            document.body.append(probe);
            const read = () =>
                ['sm', 'md', 'lg', 'xl'].map((step) => {
                    probe.style.borderRadius = `var(--tao-radius-${step})`;
                    return getComputedStyle(probe).borderTopLeftRadius;
                });
            const rest = read();
            document.documentElement.style.setProperty('--tao-radius-base', '16px');
            const wide = read();
            probe.remove();
            return { rest, wide };
        });
        expect(radii.rest).toEqual(['6px', '10px', '14px', '18px']);
        expect(radii.wide).toEqual(['12px', '16px', '20px', '24px']);
        await close();
    });

    it('a modal makes the page inert, keeps the Tab inside, and gives everything back on Escape', async () => {
        const { page, close } = await open();
        await section(page, 'modal');
        await sectionButton(page, /^TaoModal/).click();
        const dialog = page.locator('[role="dialog"]').first();
        await dialog.waitFor();
        expect(await anyInert(page)).toBe(true);
        for (let i = 0; i < 12; i += 1) {
            await page.keyboard.press('Tab');
            expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
        }
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        expect(await anyInert(page)).toBe(false);
        await close();
    });

    it('confirm(): the focus is inside, the scrim answers', async () => {
        const { page, close } = await open();
        await section(page, 'confirm');
        await sectionButton(page, /confirm\(\)/).click();
        const panel = page.locator('[role="alertdialog"]');
        await panel.waitFor();
        expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(true);
        await page.locator('.tao-confirm__overlay').click({ position: { x: 5, y: 5 } });
        await panel.waitFor({ state: 'detached' });
        await close();
    });

    it('a toast is a status, and its countdown stands while the pointer is over it', async () => {
        const { page, close } = await open();
        await section(page, 'toast');
        await sectionButton(page, /toast\(\)/).click();
        const toast = page.locator('.tao-toast').first();
        await toast.waitFor();
        expect(await toast.getAttribute('role')).toBe('status');
        await toast.hover();
        expect(await page.locator('.tao-toast__progress').first().evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('paused');
        await close();
    });

    it('a danger toast is an alert and keeps its implicit assertive politeness', async () => {
        const { page, close } = await open();
        await section(page, 'toast');
        await sectionButton(page, /toast\(\)/, 1).click();
        const toast = page.locator('.tao-toast').first();
        await toast.waitFor();
        expect(await toast.getAttribute('role')).toBe('alert');
        expect(await toast.getAttribute('aria-live')).toBeNull();
        await close();
    });

    it('TaoSelect: the focus stays on the trigger, the arrows move the active option, Escape closes', async () => {
        const { page, close } = await open();
        await section(page, 'select');
        const trigger = page.locator('.tao-select__trigger').first();
        await trigger.focus();
        await page.keyboard.press('ArrowDown');
        await page.locator('.tao-select__panel [role="listbox"]').first().waitFor();
        expect(await trigger.getAttribute('aria-expanded')).toBe('true');
        expect(await trigger.evaluate((el) => el === document.activeElement)).toBe(true);
        const before = await trigger.getAttribute('aria-activedescendant');
        await page.keyboard.press('ArrowDown');
        expect(await trigger.getAttribute('aria-activedescendant')).not.toBe(before);
        await page.keyboard.press('Escape');
        expect(await trigger.getAttribute('aria-expanded')).toBe('false');
        await close();
    });

    it('the app shell: the skip link moves the focus to <main> without touching the address', async () => {
        const { page, close } = await open();
        await section(page, 'starters');
        const skip = page.locator('.tao-shell__skip').first();
        await skip.focus();
        const before = page.url();
        await page.keyboard.press('Enter');
        expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('MAIN');
        expect(page.url()).toBe(before);
        await close();
    });

    it('prefers-reduced-motion: the skeleton does not pulse (and it does without the preference)', async () => {
        const calm = await open({ reducedMotion: 'reduce' });
        await section(calm.page, 'skeleton');
        const calmName = await calm.page.locator('.tao-skeleton').first().evaluate((el) => getComputedStyle(el).animationName);
        await calm.close();
        const live = await open();
        await section(live.page, 'skeleton');
        const liveName = await live.page.locator('.tao-skeleton').first().evaluate((el) => getComputedStyle(el).animationName);
        await live.close();
        expect(calmName).toBe('none');
        expect(liveName).not.toBe('none');
    });

    it('contrast: every rated pair of the page passes (no danger badge outside of the teaching table)', async () => {
        const { page, close } = await open();
        await section(page, 'a11y');
        expect(await page.locator('.ratio-badge').count()).toBeGreaterThan(5);
        // the table «why a black label» shows a failing white label on purpose
        expect(await page.locator('.ratio-badge.tao-tone-danger:not(.contrast-why__table *)').count()).toBe(0);
        await close();
    });
});
