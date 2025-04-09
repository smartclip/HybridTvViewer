export class MessageHandler {
    sourceElem: any;
    targetElem: any;
    listeners: Map<string, Array<any>>;

    constructor(sourceElem: any, targetElem: any) {
        this.sourceElem = sourceElem;
        this.targetElem = targetElem;
        this.listeners = new Map();
        this.sourceElem.addEventListener("message", this.onMessage, false);
    }

    onMessage = (message: any) => {
        try {
            const topic = message.data.topic;
            const callbacks: Array<any> = this.listeners.get(topic) || [];
            for (let callback of callbacks) {
                callback(message.data.data);
            }
        } catch (e) {
            console.error(e, message);
        }
    };

    sendMessage = (message: any) => {
        this.targetElem.postMessage(message, "*");
    };

    subscribe = (topic: string, callback: any) => {
        const callbacks = this.listeners.get(topic);
        if (callbacks) {
            callbacks.push(callback);
            this.listeners.set(topic, callbacks);
        } else {
            this.listeners.set(topic, [callback]);
        }
    };
}
