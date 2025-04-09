export class KeyEventHandler {
    messageHandler: any;

    constructor(messageHandler: any) {
        this.messageHandler = messageHandler;
        this.messageHandler.subscribe("doKeyPress", (response: any) => {
            this.onKeyEvent(response);
        });
    }

    onKeyEvent(data: any) {
        console.log("onKeyEvent", data);
        const keyboardEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            keyCode: data.keyCode
        });
        window.document.dispatchEvent(keyboardEvent);
    }
}
