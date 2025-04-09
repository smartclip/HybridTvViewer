import "./css/hbb-extension-content-ui.scss";

import { BottomUi } from "./js/bottom-ui";
import { RemoteControl } from "./js/remote-control";
import { MessageHandler } from "../shared/message-hanler";

const messageHandler: MessageHandler = new MessageHandler(window, window.parent);

const bottomUi: BottomUi = new BottomUi(messageHandler);
bottomUi.initialize();

const remoteControl: RemoteControl = new RemoteControl(
    document.body,
    messageHandler,
    window.parent
);
remoteControl.initialize();
