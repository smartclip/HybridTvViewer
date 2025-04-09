import { MessageHandler } from "../shared/message-hanler";

export class StreamEventHandler {
    messageHandler: MessageHandler;

    constructor(messageHandler: MessageHandler) {
        this.messageHandler = messageHandler;
        this.messageHandler.subscribe("streamevent", this.onStreamEvent.bind(this));
    }

    onStreamEvent(data: any) {
        // {name,data,text}
        // access global object
        for (let registeredListener of window.HBBTV_POLYFILL_NS.streamEventListeners) {
            if (registeredListener.eventName === data.name) {
                const event = { ...data, status: "trigger" };
                console.log("hbbtv-polyfill: trigger streamevent", event);

                // Hbb Spec 8.2.1.2 DSM-CC StreamEvent event
                registeredListener.listener(event);
            }
        }
    }
}
