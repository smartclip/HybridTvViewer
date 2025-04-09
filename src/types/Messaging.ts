export enum MessageType {
    GetPolyfillBaseConfig = "getPolyfillBaseConfig",
    ChannelChange = "channelChange",
    UserAgent = "userAgent",
    SetPopupState = "setPopupState",
    GetPopupState = "getPopupState"
};

export interface Message {
    type: MessageType;
    tabId?: number;
}

export interface MessagePolyfill extends Message {
    type: MessageType.GetPolyfillBaseConfig;
}

export interface MessageUserAgent extends Message {
    type: MessageType.UserAgent;
    data: {
        userAgent: string;
    };
}

export interface MessageChannel extends Message {
    type: MessageType.ChannelChange;
    data: {
        channel: unknown;
        appUrl: string;
    };
}

export interface MessageSetPopup extends Message {
    type: MessageType.SetPopupState;
    data: {
        forcePlugin: boolean;
    };
}

export interface MessageGetPopup extends Message {
    type: MessageType.GetPopupState;
}

export type MessageAny =
    | MessagePolyfill
    | MessageUserAgent
    | MessageChannel
    | MessageSetPopup
    | MessageGetPopup;
