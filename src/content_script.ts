import { MessageHandler } from "./shared/message-hanler";
import { isNotNull } from "typed-assert";

function createScriptTag(filename: string) {
    const scriptTag = document.createElement("script");

    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", chrome.runtime.getURL(filename));

    return scriptTag;
}

function initIFrame() {
    const iframe: HTMLIFrameElement = document.createElement("iframe");
    iframe.id = "iframe-plugin";
    iframe.allow = "autoplay";
    iframe.style.boxSizing = "content-box";
    iframe.style.display = "block";
    iframe.style.position = "fixed";
    iframe.style.top = "0px";
    iframe.style.bottom = "auto";
    iframe.style.left = "0px";
    iframe.style.width = "1460px";
    iframe.style.minWidth = "1200px";
    iframe.style.height = "900px";
    iframe.style.overflow = "hidden";
    iframe.style.margin = "2px";
    iframe.style.padding = "0px";
    iframe.style.overflow = "hidden";
    iframe.style.background = "transparent";
    iframe.style.backgroundColor = "transparent";
    iframe.style.zIndex = "-1";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    isNotNull(iframe.contentDocument);
    isNotNull(iframe.contentWindow);

    // Inject script to communicate from IFrame to Main frame.
    iframe.contentDocument.head.appendChild(createScriptTag("plugin_extensions.js"));

    const messageHandler: MessageHandler = new MessageHandler(window, iframe.contentWindow);

    messageHandler.subscribe("channelChange", (result: any) => {
        chrome.runtime.sendMessage({ type: "channelChange", data: result });
    });

    messageHandler.subscribe("userAgent", (result: any) => {
        chrome.runtime.sendMessage({ type: "userAgent", data: result });
    });

    messageHandler.subscribe("onShowChannelList", () => {
        iframe.style.zIndex = "9999999";
    });

    messageHandler.subscribe("onHideChannelList", () => {
        iframe.style.zIndex = "-1";
    });

    messageHandler.subscribe("doKeyPress", (data: any) => {
        let keyboardEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            keyCode: data.keyCode
        });
        window.document.dispatchEvent(keyboardEvent);
    });

    messageHandler.subscribe("getPolyfillBaseConfig", (result: any) => {
        chrome.runtime.sendMessage({ type: "getPolyfillBaseConfig", data: result }, (result) => {
            messageHandler.sendMessage({
                topic: "polyfillBaseConfig",
                data: result
            });
        });
    });
}

function setupAndLoad() {
    console.log("Load and init hbbtv polyfills");

    // inject hbbtv font
    // Note: Tiresias Screenfont as defined for HbbTv is not license free --> we use the "similar" GNU License released Tiresias PC font
    const fontlocation = chrome.runtime.getURL("fonts/TiresiasPCfont.ttf");
    let font1 = new FontFace("Tiresias", "url(" + fontlocation + ")"); // selected by font-family:"Tiresias"
    let font2 = new FontFace("Tiresias Signfont", "url(" + fontlocation + ")");
    let font3 = new FontFace("Tiresias Screenfont", "url(" + fontlocation + ")");
    let font4 = new FontFace("TiresiasScreenfont", "url(" + fontlocation + ")");
    document.fonts.add(font1);
    document.fonts.add(font2);
    document.fonts.add(font3);
    document.fonts.add(font4);
    document.body.style.fontFamily = "Tiresias";
    // reset browser default margin and padding
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";

    initIFrame();

    // Inject script to communicate from Main frame to IFrame.
    document.head.prepend(createScriptTag("in_page_extensions.js"));
}

setupAndLoad();
