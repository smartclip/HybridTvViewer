import remoteTemplete from "../html/remote-control-template.html";
import { PC_KEYCODES } from "../../shared/pc-keycodes";
import { MessageHandler } from "../../shared/message-hanler";

export class RemoteControl {
    messageHandler: MessageHandler;
    iframe: any;
    VK: any;
    controlsButtons?: {
        red: any;
        green: any;
        yellow: any;
        blue: any;
        navigation: any;
        vcr: any;
        numeric: any;
    };

    constructor(node: HTMLElement, messageHandler: MessageHandler, iframe: any) {
        node.insertAdjacentHTML("beforeend", remoteTemplete);
        this.controlsButtons = undefined;
        this.messageHandler = messageHandler;
        this.iframe = iframe;
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
        this.messageHandler.subscribe("keyset", this.updateKeyset.bind(this));
    }

    initialize() {
        this.controlsButtons = {
            red: document.querySelectorAll(".red-button"),
            green: document.querySelectorAll(".green-button"),
            yellow: document.querySelectorAll(".yellow-button"),
            blue: document.querySelectorAll(".blue-button"),
            navigation: document.querySelectorAll(".navigation"),
            vcr: document.querySelectorAll(".vcr"),
            numeric: document.querySelectorAll(".numeric")
        };
        document.getElementById("power-button")!.onclick = () => {
            document.location.reload();
        };
    }

    enableVCR() {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.vcr) {
            if (button.classList.contains("rewind")) {
                this.enableButton(button, PC_KEYCODES.h);
            }
            if (button.classList.contains("play")) {
                this.enableButton(button, PC_KEYCODES.j);
            }
            if (button.classList.contains("pause")) {
                this.enableButton(button, PC_KEYCODES.k);
            }
            if (button.classList.contains("stop")) {
                this.enableButton(button, PC_KEYCODES.l);
            }
            if (button.classList.contains("fast_forward")) {
                this.enableButton(button, PC_KEYCODES.oe);
            }
        }
    }

    disableVCR = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.vcr) {
            this.disableButton(button);
        }
    };

    enableGreen = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.green) {
            this.enableButton(button, PC_KEYCODES.g);
        }
    };

    disableGreen = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.green) {
            this.disableButton(button);
        }
    };

    enableNavigation = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.navigation) {
            if (button.classList.contains("up")) {
                this.enableButton(button, PC_KEYCODES.up);
            }
            if (button.classList.contains("down")) {
                this.enableButton(button, PC_KEYCODES.down);
            }
            if (button.classList.contains("left")) {
                this.enableButton(button, PC_KEYCODES.left);
            }
            if (button.classList.contains("right")) {
                this.enableButton(button, PC_KEYCODES.right);
            }
            if (button.classList.contains("ok")) {
                this.enableButton(button, PC_KEYCODES.enter);
            }
            if (button.classList.contains("return")) {
                this.enableButton(button, PC_KEYCODES.back);
            }
        }
    };

    disableNavigation = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.navigation) {
            this.disableButton(button);
        }
    };

    enableNumeric = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.numeric) {
            if (button.classList.contains("one")) {
                this.enableButton(button, PC_KEYCODES["1"]);
            }
            if (button.classList.contains("two")) {
                this.enableButton(button, PC_KEYCODES["2"]);
            }
            if (button.classList.contains("three")) {
                this.enableButton(button, PC_KEYCODES["3"]);
            }
            if (button.classList.contains("four")) {
                this.enableButton(button, PC_KEYCODES["4"]);
            }
            if (button.classList.contains("five")) {
                this.enableButton(button, PC_KEYCODES["5"]);
            }
            if (button.classList.contains("six")) {
                this.enableButton(button, PC_KEYCODES["6"]);
            }
            if (button.classList.contains("seven")) {
                this.enableButton(button, PC_KEYCODES["7"]);
            }
            if (button.classList.contains("eight")) {
                this.enableButton(button, PC_KEYCODES["8"]);
            }
            if (button.classList.contains("nine")) {
                this.enableButton(button, PC_KEYCODES["9"]);
            }
            if (button.classList.contains("zero")) {
                this.enableButton(button, PC_KEYCODES["0"]);
            }
        }
    };

    disableNumeric = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.numeric) {
            this.disableButton(button);
        }
    };

    enableRed = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.red) {
            this.enableButton(button, PC_KEYCODES.r);
        }
    };

    disableRed = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.red) {
            this.disableButton(button);
        }
    };

    enableYellow = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.yellow) {
            this.enableButton(button, PC_KEYCODES.y);
        }
    };

    disableYellow = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.yellow) {
            this.disableButton(button);
        }
    };

    enableBlue = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.blue) {
            this.enableButton(button, PC_KEYCODES.b);
        }
    };

    disableBlue = () => {
        if (!this.controlsButtons) {
            return;
        }
        for (let button of this.controlsButtons.blue) {
            this.disableButton(button);
        }
    };

    addButtonControls = () => {
        /*red.onclick = () => {
            this.doKeyPress(82);
        };*/
    };

    updateView = () => {
        this.updateKeyset();
    };

    doKeyPress = (keyCode: any) => {
        this.messageHandler.sendMessage({ topic: "doKeyPress", data: { keyCode } });
    };

    enableButton = (node: any, keyCode: any) => {
        if (node.classList.contains("inactive")) {
            node.classList.remove("inactive");
            if (node.clickListener) {
                node.clickListener = node.removeEventListener("click", node.clickListener);
                delete node.clickListener;
            }
            const listener = () => {
                this.doKeyPress(keyCode);
            };
            node.clickListener = listener;
            node.addEventListener("click", listener);
        }
    };

    disableButton = (node: any) => {
        if (!node.classList.contains("inactive")) {
            node.classList.add("inactive");
            node.clickListener = node.removeEventListener("click", node.clickListener);
            delete node.clickListener;
        }
    };

    updateKeyset(keyset?: any) {
        if (keyset) {
            keyset.VCR ? this.enableVCR() : this.disableVCR();
            keyset.GREEN ? this.enableGreen() : this.disableGreen();
            keyset.YELLOW ? this.enableYellow() : this.disableYellow();
            keyset.BLUE ? this.enableBlue() : this.disableBlue();
            keyset.RED ? this.enableRed() : this.disableRed();
            keyset.NAVIGATION ? this.enableNavigation() : this.disableNavigation();
            keyset.NUMERIC ? this.enableNumeric() : this.disableNumeric();
        }
    }
}
