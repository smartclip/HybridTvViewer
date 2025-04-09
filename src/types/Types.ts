export interface PopupState {
    forcePlugin: boolean;
    activeOnTab: boolean;
}

export interface Channel {
    channelType: number;
    ccid: string;
    nid: number;
    dsd: string;
    onid: number;
    tsid: number;
    sid: number;
    name: string;
    longName: string;
    description: string;
    authorised: boolean;
    hidden: boolean;
    idType: number;
    channelMaxBitRate: number;
    manualBlock: boolean;
    majorChannel: number;
    ipBroadcastID: string;
    locked: false;
}

export interface TabState {
    // Whether the plugin is active or not.
    active: boolean;
    // Whether HbbTv headers have been detected and prevents users from
    // disabling the plugin.
    force: boolean;
    url?: string;
    userAgent?: string;
    channel?: any;
}
