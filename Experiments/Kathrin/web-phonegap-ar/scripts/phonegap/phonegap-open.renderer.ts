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
				// createServeProjectBtn();
				sendPgObjectToMain();
			} else {
				alert(opened.getMessage());
			}
		})
		.catch(error => {
			console.log("An unknown error occurred" + error);
		});
}

// function createServeProjectBtn() {
// 	if (!document.getElementById("serve-phonegap-btn")) {
// 		let runBtn = document.createElement("button");
// 		runBtn.setAttribute("id", "serve-phonegap-btn");
// 		runBtn.innerHTML = "Serve project";

// 		runBtn.addEventListener("click", event => {
// 			pg.serveProject().then(serveProcess => {
// 				console.log(serveProcess);
// 				if (serveProcess) {
// 					createKillServeProcessBtn();
// 				}
// 			});
// 		});

// 		document.body.appendChild(document.createElement("br"));
// 		document.body.appendChild(runBtn);
// 	}
// }

// function createKillServeProcessBtn() {
// 	if (!document.getElementById("kill-serve-btn")) {
// 		let killBtn = document.createElement("button");
// 		killBtn.setAttribute("id", "kill-serve-btn");
// 		killBtn.innerHTML = "Kill serve process";

// 		killBtn.addEventListener("click", event => {
// 			pg.killServeProcess().then((msg: ReturnMessage) => {
// 				if (msg.getResult()) {
// 					removeKillServeProcessBtn();
// 				} else {
// 					alert(msg.getMessage);
// 				}
// 			});
// 		});

// 		document.body.appendChild(document.createElement("br"));
// 		document.body.appendChild(killBtn);
// 	}
// }

// function removeKillServeProcessBtn() {
// 	let killBtn: HTMLElement = document.getElementById("kill-serve-btn");
// 	killBtn.remove();
// }

function sendPgObjectToMain(): void {
	ipcRenderer.send("opened-pg-project", pg);
	let win = remote.getCurrentWindow();
	win.close();
}
