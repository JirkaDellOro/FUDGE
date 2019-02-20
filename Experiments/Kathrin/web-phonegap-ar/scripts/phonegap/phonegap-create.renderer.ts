import { PhoneGap } from "./phonegap.class";
import { ipcRenderer, remote } from "electron";
import { ReturnMessage } from "utils/utils.class";

let pg: PhoneGap;

window.addEventListener("load", () => {
	init();
});

function init() {
	const domAppName: HTMLInputElement = document.getElementById("app-name") as HTMLInputElement;
	const domAppDir: HTMLInputElement = document.getElementById("app-dir") as HTMLInputElement;
	const domSubmitBtn: HTMLElement = document.getElementById("create-phonegap-dir");

	domAppDir.addEventListener("change", (event: Event) => {
		document.querySelector(".chose-path").innerHTML = domAppDir.files[0].name;
		document.querySelector(".chose-path-container").classList.add("show");
	});

	domSubmitBtn.addEventListener("click", (event: any) => {
		const appName: string = domAppName.value;
		const appDir: string = domAppDir.files[0].path;

		if ((appName === null || appName === "") && appDir == null) {
			alert("Please give the project a name and select a target path.");
		} else if (appName === null || appName === "") {
			alert("Please give the project a name.");
		} else if (appDir == null) {
			alert("Please select a path for saving your new project.");
		} else {
			createPhoneGapProject(appName, appDir);
		}
	});
}

async function createPhoneGapProject(name: string, dir: string) {
	let loading = document.querySelector("#loading");
	loading.classList.remove("hide");

	pg = new PhoneGap(name, dir);
	pg.createProject()
		.then((created: ReturnMessage) => {
			if (created.getResult()) {
				ipcRenderer.send("created-pg-project", pg);
				let win = remote.getCurrentWindow();
				loading.classList.add("hide");
				win.close();
			} else {
				loading.classList.add("hide");
				alert(created.getMessage());
			}
		})
		.catch(error => {
			loading.classList.add("hide");
			console.log(error);
		});
}
