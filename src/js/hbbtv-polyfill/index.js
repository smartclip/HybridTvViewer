import { keyEventInit } from "./keyevent-init.js";
import { hbbtvFn } from "./hbbtv.js";
import { VideoHandler } from "./hbb-video-handler.js";

function init() {
    console.log("hbbtv-polyfill: load");
    // global helper namespace to simplify testing
    window.HBBTV_POLYFILL_NS = window.HBBTV_POLYFILL_NS || {
    };
    window.HBBTV_POLYFILL_NS = {
        ...window.HBBTV_POLYFILL_NS, ...{
            keysetSetValueCount: 0,
            streamEventListeners: [],
        }
    };
    window.HBBTV_POLYFILL_NS.currentChannel = window.HBBTV_POLYFILL_NS.currentChannel || {
        'TYPE_TV': 12,
        'channelType': 12,
        'sid': 1,
        'onid': 1,
        'tsid': 1,
        'name': 'test',
        'ccid': 'ccid:dvbt.0',
        'dsd': ''
    };

    // set body position
    document.body.style.position = "absolute";
    document.body.style.width = "1280px";
    document.body.style.height = "720px";

    keyEventInit();
    hbbtvFn();

    new VideoHandler().initialize();

    console.log("hbbtv-polyfill: loaded");
}
if (!document.body) {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
