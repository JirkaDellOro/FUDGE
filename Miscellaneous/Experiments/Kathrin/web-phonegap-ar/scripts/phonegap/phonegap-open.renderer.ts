import { ipcRenderer, remote } from "electron";
import { PhoneGap } from "./phonegap.class";
import { ReturnMessage } from "../utils/utils.class";

let pg: PhoneGap;

window.addEventListener("load", () => {
	init();
});

function init(): void {
	const domAppDir: HTMLInputElement = document.getElementById("app-dir") as HTMLInputElement;
	const domSubmitBtn: HTMLElement = document.getElementById("open-phonegap-dir");

	domAppDir.addEventListener("change", (event: Event) => {
		console.log("directory changed");
		document.querySelector(".chose-path").innerHTML = domAppDir.files[0].name;
		document.querySelector(".chose-path-container").classList.add("show");
	});

	domSubmitBtn.addEventListener("click", (event: Event) => {
		const appDir: string = domAppDir.files[0].path;

		if (appDir == null) {
			alert("Please select app directory");
		} else {
			console.log("open phonegap project");
			openPhoneGapProject(appDir);
		}
	});
}

async function openPhoneGapProject(dir: string): Promise<void> {
	pg = new PhoneGap();
	await pg
		.openProject(dir)
		.then((opened: ReturnMessage) => {
			if (opened.getResult()) {
				sendPgObjectToMain();
			} else {
				alert(opened.getMessage());
			}
		})
		.catch((error: Error) => {
			alert(error.message);
		});
}

function sendPgObjectToMain(): void {
	ipcRenderer.send("opened-pg-project", pg);
	let win = remote.getCurrentWindow();
	win.close();
}
