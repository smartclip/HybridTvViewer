import * as t from "typed-assert";
import { MessageSetPopup } from "../types/Messaging";
import { PopupState } from "../types/Types";

export class PopupHandler {
    forcePluginCheckboxElement: HTMLInputElement;

    constructor() {
        const checkbox = document.getElementById(
            "popup-checkbox-force-plugin"
        ) as HTMLInputElement | null;

        t.isNotNull(checkbox, 'Could not find "popup-checkbox-force-plugin".');

        this.forcePluginCheckboxElement = checkbox;
    }

    async initialize() {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabId = tabs[0] && tabs[0].id;

        t.isNotUndefined(tabId, "Could not get the current tab ID.");

        const response = await chrome.runtime.sendMessage({
            type: "getPopupState",
            tabId
        });

        this.showState(response);

        this.forcePluginCheckboxElement.addEventListener("change", () =>
            chrome.runtime.sendMessage({
                type: "setPopupState",
                tabId,
                data: {
                    forcePlugin: !!this.forcePluginCheckboxElement.checked
                }
            } as MessageSetPopup)
        );
    }

    showState(popupState: PopupState) {
        if (!popupState) {
            return;
        }

        this.forcePluginCheckboxElement.checked = popupState.activeOnTab;
        this.forcePluginCheckboxElement.disabled = popupState.forcePlugin;
    }
}
