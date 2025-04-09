import * as t from "typed-assert";
import { MessageAny, MessageType } from "./types/Messaging";
import { TabState, Channel } from "./types/Types";

const allResourceTypes: chrome.declarativeNetRequest.ResourceType[] = Object.values(
    chrome.declarativeNetRequest.ResourceType
);

const activeIcon = {
    16: "icons/TV_active_16.png",
    48: "icons/TV_active_48.png",
    128: "icons/TV_active_128.png"
};

const inactiveIcon = {
    128: "icons/TV_inactive_128.png"
};

const tabStates: Record<number, TabState | undefined> = {};

/**
 * Returns the current state for a tab or creates a new state for it.
 */
const getTabStateById = (tabId: number): TabState => {
    if (!tabStates[tabId]) {
        // Create default tabState object for new tab.
        tabStates[tabId] = {
            active: false,
            force: false
        };
    }

    return tabStates[tabId];
};

const DEFAULT_CHANNEL: Channel = {
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
};

/**
 * Function is called before a new URL is loaded and it is the entry point for
 * the script. It disables the extension if a new URL is loaded.
 */
function onBeforeNavigate(details: chrome.webNavigation.WebNavigationParentedCallbackDetails) {
    const { tabId, frameId } = details;
    const tabState = getTabStateById(tabId);
    const isMainFrame = frameId === 0;

    if (isMainFrame && tabState.url && tabState.url !== details.url) {
        // console.debug("[onBeforeNavigate]", { details, tabState });
        console.log(`[onBeforeNavigate] Resetting plugin state due to a URL change.`);

        tabState.active = false;
        tabState.force = false;
    }
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    try {
        onBeforeNavigate(details);
    } catch (err) {
        console.error("[onBeforeNavigate]", err);
    }
});

/**
 * Function runs after "onBeforeNavigate" for every request.
 * When HbbTv headers are detected, the plugin is activated and forced for the tab.
 */
function onHeadersReceived(details: chrome.webRequest.WebResponseHeadersDetails) {
    const { tabId, responseHeaders } = details;
    const tabState = getTabStateById(tabId);

    const hbbtvHeader =
        responseHeaders &&
        responseHeaders.find(
            (header) =>
                header.name.match(/^Content-Type/i) &&
                header.value &&
                header.value.match(/^application\/vnd\.hbbtv\.xhtml\+xml/i)
        );

    if (hbbtvHeader) {
        console.log(`[onHeadersReceived] HbbTv header found "${hbbtvHeader.value}".`);

        tabState.active = true;
        tabState.force = true;
    }
}

chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        try {
            onHeadersReceived(details);
        } catch (err) {
            console.error("[onHeadersReceived]", err);
        }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

/**
 * Function runs after all headers are parsed, but the document might still be downloading.
 * If the tab indicates a HbbTV app, inject the hbbtv_polyfill into page.
 * This is done here to ensure that the polyfill is available before the DOM is completed.
 */
async function onCommitted(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
    const { tabId, frameId, url } = details;
    const tabState = getTabStateById(tabId);
    const isMainFrame = frameId === 0;

    if (!isMainFrame) {
        return;
    }

    // console.debug("[onCommitted]", { details, tabState });

    if (tabState.active || tabState.force) {
        console.log("[onCommitted] Injecting polyfill.");

        await Promise.all([
            chrome.scripting.executeScript({
                target: { tabId },
                func: setupPolyfillJs,
                args: [
                    tabState.userAgent || navigator.userAgent,
                    tabState.channel || DEFAULT_CHANNEL
                ],
                injectImmediately: true,
                world: "MAIN"
            }),
            chrome.scripting.executeScript({
                target: { tabId },
                files: ["hbbtv_polyfill.js"],
                injectImmediately: true,
                world: "MAIN"
            })
        ]);

        // Switch to active icon
        await chrome.action.setIcon({
            path: activeIcon,
            tabId
        });
    } else {
        console.log("[onCommitted] Plugin deactived, won't inject polyfill.");
    }
}

chrome.webNavigation.onCommitted.addListener((details) => {
    onCommitted(details).catch((err) => console.error("[onCommitted]", err));
});

/**
 * Function runs when the resources are completely loaded and initialized.
 */
async function onCompleted(details: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
    const { tabId, frameId, url } = details;
    const tabState = getTabStateById(tabId);
    const isMainFrame = frameId === 0;

    if (!isMainFrame) {
        return;
    }

    // console.debug("[onCompleted]", { details, tabState });

    // Page is completely loaded, store the current url.
    tabState.url = url;

    if (tabState.active || tabState.force) {
        console.log("[onCompleted] Injecting content_script.");

        await chrome.scripting.executeScript({
            target: { tabId },
            files: ["content_script.js"],
            injectImmediately: true,
        });
    } else {
        console.log("[onCompleted] Plugin deactived, won't inject content_script.");
    }
}

chrome.webNavigation.onCompleted.addListener((details) => {
    onCompleted(details).catch((err) => console.error("[onCompleted]", err));
});

/**
 * Handles the communication between the background worker, the main window, and the popup.
 */
async function onMessage(
    msg: MessageAny,
    sender: chrome.runtime.MessageSender,
    sendResponse: (res: any) => void
) {
    // Messages from popup won't contain sender.tab.id - popup will set msg.tabId
    const tabId = (sender.tab && sender.tab.id) || msg.tabId;

    t.isNumber(tabId, `Did not receive a valid tab ID "${tabId}".`);

    const tabState = getTabStateById(tabId);
    let response: unknown;

    switch (msg.type) {
        case MessageType.GetPolyfillBaseConfig:
            response = {
                userAgent: tabState.userAgent || navigator.userAgent,
                currentChannel: tabState.channel || DEFAULT_CHANNEL
            };
            break;
        case MessageType.UserAgent:
            // Store User-Agent, reload interceptor rules and refresh tab.
            tabState.userAgent = msg.data.userAgent;
            await updateInterceptor(msg.data.userAgent);
            await chrome.tabs.update(tabId, { url: tabState.url });
            break;
        case MessageType.ChannelChange:
            // Store Channel and load new URL.
            tabState.channel = msg.data.channel;
            await chrome.tabs.update(tabId, { url: msg.data.appUrl });
            break;
        case MessageType.SetPopupState:
            // Update plugin state and refresh tab.
            tabState.active = msg.data.forcePlugin;
            await chrome.tabs.update(tabId, { url: tabState.url });
            break;
        case MessageType.GetPopupState:
            response = {
                forcePlugin: tabState.force,
                activeOnTab: tabState.active
            };
            break;
        default:
            break;
    }

    if (response) {
        sendResponse(response);
        return true;
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // console.debug("[onMessage]", msg.type, { msg, sender });

    onMessage(msg, sender, sendResponse).catch((err) => console.error("[onMessage]", err));
});

chrome.tabs.onRemoved.addListener((tabId, removed) => {
    // console.debug("[onRemoved]", tabId);

    // Avoid keeping the state of tabs that no longer exist.
    delete tabStates[tabId];
});

const setupPolyfillJs = (userAgent: string, currentChannel: string) => {
    Object.defineProperty(navigator, "userAgent", {
        value: userAgent
    });
    window.HBBTV_POLYFILL_NS = window.HBBTV_POLYFILL_NS || {};
    window.HBBTV_POLYFILL_NS.currentChannel = currentChannel;
};

const updateInterceptor = (userAgent?: string): Promise<void> => {
    userAgent = userAgent || navigator.userAgent;
    return chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [2],
        addRules: [
            {
                id: 2,
                priority: 1,
                action: {
                    type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                    requestHeaders: [
                        {
                            operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                            header: "User-Agent",
                            value: userAgent
                        }
                    ]
                },
                condition: {
                    urlFilter: "|http*",
                    resourceTypes: allResourceTypes
                }
            }
        ]
    });
};
