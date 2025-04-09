import "./popup.css";
import { PopupHandler } from "./popup-handler";

document.addEventListener("DOMContentLoaded", async function() {
    try {
        const popup = new PopupHandler();
        await popup.initialize();
    } catch (err) {
        console.error(err);
    }
});
