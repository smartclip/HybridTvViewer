import { MessageHandler } from "../shared/message-hanler";

export class StateReporterService {
    messageHandler: MessageHandler;
    reportInterval: any;
    VK: { [k: string]: number };

    constructor(messageHandler: MessageHandler) {
        this.messageHandler = messageHandler;
        this.VK = {
            RED: 0x1, // "RED
            GREEN: 0x2, // "GREEN
            YELLOW: 0x4, // "YELLOW
            BLUE: 0x8, // "BLUE
            NAVIGATION: 0x10, // "UP, "DOWN, "LEFT, "RIGHT, "ENTER, "BACK
            VCR: 0x20, // "PLAY, "PAUSE, "STOP, "NEXT, "PREV, "FAST_FWD, "REWIND, "PLAY_PAUSE
            SCROLL: 0x40, // "PAGE_UP, "PAGE_DOWN
            INFO: 0x80, // "INFO
            NUMERIC: 0x100, // "0 ... "9
            ALPHA: 0x200, // A ... Z
            OTHER: 0x400 // OTHERS
        };
    }

    initialize() {
        this.startReportInterval();
    }

    startReportInterval() {
        if (this.reportInterval) {
            return;
        }
        this.reportInterval = setInterval(() => {
            this.reportKeyset();
        }, 100);
        this.reportLocation();
    }
    reportLocation() {
        this.messageHandler.sendMessage({
            topic: "iframeLocation",
            data: { href: window.location.href }
        });
    }
    reportKeyset() {
        const activeKeysets = {
            RED: false,
            GREEN: false,
            YELLOW: false,
            BLUE: false,
            NAVIGATION: false,
            VCR: false,
            SCROLL: false,
            INFO: false,
            NUMERIC: false,
            ALPHA: false,
            OTHER: false
        };

        const objectTags: HTMLCollectionOf<HTMLObjectElement> =
            document.getElementsByTagName("object");
        for (const element of objectTags) {
            if (element.type === "application/oipfApplicationManager") {
                const appMgr: any = element;
                if (typeof appMgr.getOwnerApplication === "function") {
                    const app = appMgr.getOwnerApplication(document);
                    const keyset = app.privateData.keyset.value;
                    if (keyset) {
                        (keyset & this.VK.VCR) !== 0
                            ? (activeKeysets.VCR = true)
                            : (activeKeysets.VCR = false);
                        (keyset & this.VK.GREEN) !== 0
                            ? (activeKeysets.GREEN = true)
                            : (activeKeysets.GREEN = false);
                        (keyset & this.VK.YELLOW) !== 0
                            ? (activeKeysets.YELLOW = true)
                            : (activeKeysets.YELLOW = false);
                        (keyset & this.VK.BLUE) !== 0
                            ? (activeKeysets.BLUE = true)
                            : (activeKeysets.BLUE = false);
                        (keyset & this.VK.RED) !== 0
                            ? (activeKeysets.RED = true)
                            : (activeKeysets.RED = false);
                        (keyset & this.VK.NAVIGATION) !== 0
                            ? (activeKeysets.NAVIGATION = true)
                            : (activeKeysets.NAVIGATION = false);
                        (keyset & this.VK.NUMERIC) !== 0
                            ? (activeKeysets.NUMERIC = true)
                            : (activeKeysets.NUMERIC = false);
                    }
                }
            }
        }

        this.messageHandler.sendMessage({ topic: "keyset", data: activeKeysets });
    }
}
