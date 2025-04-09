import path from "node:path";
import fs from "node:fs";

import { test as base, chromium, type BrowserContext } from "@playwright/test";

const pathToExtension = path.join(__dirname, "../build");

if (!fs.existsSync(pathToExtension)) {
    throw new Error("Extension not found. Run 'npm run build' to create a build.");
}

const getServiceWorker = async (context: BrowserContext) => {
    let [background] = context.serviceWorkers();

    if (!background) {
        background = await context.waitForEvent("serviceworker");
    }

    // HACK: before the tests continue, open the popup to ensure that
    // it is ready to inject its scripts.
    // The background worker has access to the "chrome" object. For example,
    // here it is used to open the popup.
    await background.evaluate(() => chrome.action.openPopup());

    return background;
};

export const test = base.extend<{
    context: BrowserContext;
    extensionUrl: string;
}>({
    context: async ({}, use) => {
        // WARN: the extension must be built before running the tests.
        const context = await chromium.launchPersistentContext("", {
            // To toggle the headless mode support with extensions, leave headless set to false
            // and (un-)comment the headless=new argument.
            headless: false,
            args: [
                `--headless=new`,
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
            ]
        });
        // Ensure that the extension is loaded by getting the extension's background worker.
        await getServiceWorker(context);
        await use(context);
        await context.close();
    },
    page: async ({ page }, use) => {
        await use(page);
    },
    // The extensionUrl can be used to test the extension's popup.html page.
    // However this page is opened in a separate tab and lacks the connection
    // to the tab with the HbbTv app.
    // Passing the HbbTv's tabId to the popup.html via a URL parameter is possible,
    // but the extension's permission of "activeTab" limits the extension's access to only
    // the active tab.
    extensionUrl: async ({ context }, use) => {
        const background = await getServiceWorker(context);
        const extensionId = background.url().split("/")[2];

        await use(`chrome-extension://${extensionId}/popup.html`);
    }
});

export const expect = test.expect;
