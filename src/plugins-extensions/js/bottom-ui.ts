import { MessageHandler } from "../../shared/message-hanler";
import bottomUIHtmlTemplate from "../html/bottom-ui-template.html";

export class BottomUi {
    bottomUiDiv: any;
    messageHandler: MessageHandler;

    constructor(messageHandler: MessageHandler) {
        this.messageHandler = messageHandler;

        this.messageHandler.subscribe("polyfillBaseConfig", (response: any) => {
            this.onPolyfillBaseConfig(response);
        });
        this.messageHandler.subscribe("iframeLocation", (response: any) => {
            this.onIframeLocation(response);
        });
    }

    onIframeLocation(data: any) {
        document.getElementById("text-location")!.innerHTML = data.href;
    }

    onPolyfillBaseConfig(data: any) {
        const userAgent = data.userAgent || navigator.userAgent;
        console.log("onPolyfillBaseConfig", data);
        console.log("Set user agent", userAgent);
        (<HTMLInputElement>document.getElementById("input-useragent")).value = userAgent;
    }

    initialize() {
        const body = document.getElementsByTagName("body")[0];
        body.insertAdjacentHTML("beforeend", bottomUIHtmlTemplate);
        const submitStreamEventButton = document.getElementById("input-streamevent-submit");
        if (submitStreamEventButton) {
            submitStreamEventButton.addEventListener("click", () => {
                this.submitStreamEvent();
            });
        }
        const saveUAButton = document.getElementById("input-useragent-save");
        if (saveUAButton) {
            saveUAButton.addEventListener("click", () => {
                this.saveUA();
            });
        }

        this.messageHandler.sendMessage({
            topic: "getPolyfillBaseConfig"
        });
    }

    saveUA() {
        const ua = (<HTMLInputElement>document.getElementById("input-useragent")).value;
        this.messageHandler.sendMessage({
            topic: "userAgent",
            data: { userAgent: ua }
        });
    }

    submitStreamEvent() {
        const data = (<HTMLInputElement>document.getElementById("input-streamevent-data")).value;
        const name = (<HTMLInputElement>document.getElementById("input-streamevent-name")).value;
        const text = (<HTMLInputElement>document.getElementById("input-streamevent-text")).value;

        this.messageHandler.sendMessage({
            topic: "streamevent",
            data: { name, data, text }
        });
    }
}
