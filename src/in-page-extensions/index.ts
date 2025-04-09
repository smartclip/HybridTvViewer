import { MessageHandler } from "../shared/message-hanler";
import { StateReporterService } from "./state-reporter";
import { StreamEventHandler } from "./streamevent-handler";

const iframeElement: HTMLIFrameElement | null = document.getElementById(
    "iframe-plugin"
) as HTMLIFrameElement | null;
const messageHandler = new MessageHandler(window, iframeElement!.contentWindow);
const reporter = new StateReporterService(messageHandler);
reporter.initialize();

new StreamEventHandler(messageHandler);
