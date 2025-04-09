import { Page } from "@playwright/test";
import { test, expect } from "../with-extension";
import { isNotUndefined } from "typed-assert";

/**
 * Waits for the plugin's iframe to load and returns the frame object, which
 * can be used to locate objects inside of it.
 */
const getPluginIFrame = async (page: Page) => {
    await page.locator("#iframe-plugin").waitFor({ state: "attached" });

    // The suggested way of finding an iframe is: page.locator('#iframe-plugin').contentFrame()
    // The preivous code did not manage to find the iframe with elements.
    // Comparing the iframe found by the previous and following code, no match could be found.
    // Implying that the frames objects are different, shomehow.
    const frames = await page.frames();
    const iframe = frames.find((frame) => frame.url() === "about:blank");

    isNotUndefined(iframe, "Could not find plugin's iframe.");

    return iframe;
};

test("toggles the application with the red button", async ({ page }) => {
    await page.goto("http://itv.ard.de/ardstart/index.html?id=10");

    const iframe = await getPluginIFrame(page);

    await iframe.locator(".red-button:not(.inactive)").waitFor({ state: "visible" });

    await page.keyboard.press("r");
    await expect(page.locator("#appscreen")).toBeVisible();
    await page.keyboard.press("r");
    await expect(page.locator("#appscreen")).not.toBeVisible();
});

test("sets the default channel", async ({ page }) => {
    await page.goto("http://itv.ard.de/ardstart/index.html?id=10");

    const currentChannel = await page.evaluate(() => window.HBBTV_POLYFILL_NS.currentChannel);

    expect(currentChannel).toEqual({
        channelType: 0,
        ccid: "ccid://1.0",
        nid: 12289,
        dsd: "",
        onid: 8468,
        tsid: 259,
        sid: 769,
        name: "Das Erste HD",
        longName: "Das Erste HD",
        description: "OIPF (SD&S) - TCServiceData doesn't support yet!",
        authorised: true,
        hidden: false,
        idType: 12,
        channelMaxBitRate: 0,
        manualBlock: false,
        majorChannel: 1,
        ipBroadcastID: "rtp://1.2.3.4/",
        locked: false
    });
});
