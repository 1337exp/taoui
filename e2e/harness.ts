import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';

// A showcase to look at and a browser to look with. `SHOWCASE_URL=http://localhost:5179 npm run test:e2e` uses a server that runs already.
// Витрина, на которую смотрим, и браузер, которым смотрим. `SHOWCASE_URL=http://localhost:5179 npm run test:e2e` берёт уже запущенный сервер.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5189;

async function waitFor(url: string) {
    // shorter than the hook timeout (60 s), so the server is stopped by the catch below, not left to the timeout
    // короче таймаута хука (60 с), чтобы сервер останавливал catch ниже, а не таймаут
    for (let i = 0; i < 100; i += 1) {
        try {
            if ((await fetch(url)).ok) return;
        } catch {
            // not up yet
        }
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`The showcase did not come up at ${url}`);
}

export async function startShowcase() {
    if (process.env.SHOWCASE_URL) return { url: process.env.SHOWCASE_URL, stop() {} };
    const vite = join(ROOT, 'showcase', 'node_modules', 'vite', 'bin', 'vite.js');
    if (!existsSync(vite)) throw new Error('Run `npm install` in showcase/ first');
    const child = spawn(process.execPath, [vite, '--port', String(PORT), '--strictPort'], { cwd: join(ROOT, 'showcase'), stdio: 'ignore' });
    const url = `http://localhost:${PORT}`;
    try {
        await waitFor(url);
    } catch (error) {
        // a server that did not come up in time must not keep the port for the next run
        // сервер, не поднявшийся вовремя, не должен держать порт для следующего запуска
        child.kill();
        throw error;
    }
    return { url, stop: () => void child.kill() };
}

/**
 * Chrome or Edge that is installed (nothing is downloaded), else a Chromium that Playwright already has (`PLAYWRIGHT_BROWSERS_PATH`, a CI
 * image) or the one in `CHROME_PATH`; null when there is none.
 * Установленный Chrome или Edge (ничего не скачивается), иначе Chromium, который у Playwright уже есть (`PLAYWRIGHT_BROWSERS_PATH`, образ CI)
 * или тот, что в `CHROME_PATH`; null, если ничего нет.
 */
export async function launch(): Promise<Browser | null> {
    const options: Parameters<typeof chromium.launch>[0][] = [{ channel: 'chrome' }, { channel: 'msedge' }, {}];
    if (process.env.CHROME_PATH) options.unshift({ executablePath: process.env.CHROME_PATH });
    for (const option of options) {
        try {
            return await chromium.launch(option);
        } catch {
            // the next one
        }
    }
    return null;
}

export async function newPage(browser: Browser, url: string, options: { reducedMotion?: 'reduce' | 'no-preference' } = {}): Promise<{ context: BrowserContext; page: Page }> {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: options.reducedMotion ?? 'no-preference', locale: 'en-US' });
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForSelector('.showcase', { timeout: 30000 });
    return { context, page };
}

/** Goes to a section of the showcase by its hash. / Переходит к разделу витрины по хэшу. */
export async function section(page: Page, id: string) {
    await page.evaluate((hash) => (location.hash = hash), `#${id}`);
    await page.waitForTimeout(700);
}
