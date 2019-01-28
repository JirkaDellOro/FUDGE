import { PhoneGap } from "./phonegap.class";

let pg: PhoneGap;

window.addEventListener("load", () => {
	init();
});

function init() {
	const domAppName: HTMLInputElement = document.getElementById("app-name") as HTMLInputElement;
	// const domAppDir: HTMLInputElement = document.getElementById('app-dir') as HTMLElement;
	const domAppDir: HTMLInputElement = document.getElementById("app-dir") as HTMLInputElement;
	const domSubmitBtn: HTMLElement = document.getElementById("create-phonegap-dir");

	domSubmitBtn.addEventListener("click", (event: any) => {
		const appName: string = domAppName.value;
		const appDir: string = domAppDir.files[0].path;

		if (appName == null && appDir == null) {
			alert("Bitte App-Name und App-Verzeichnis angeben.");
		} else if (appName == null) {
			alert("Bitte App-Name angeben.");
		} else if (appDir == null) {
			alert("Bitte App-Verzeichnis angeben");
		} else {
			createPhoneGapProject(appName, appDir);
		}
	});
}

async function createPhoneGapProject(name: string, dir: string) {
	console.log(dir);
	pg = new PhoneGap(name, dir);
	try {
		const projectCreated = await pg.createProject();
		// if(projectCreated) {
		createServeProjectBtn();
		// }
	} catch (error) {
		console.error(error);
	}
}

function createServeProjectBtn() {
	let body = document.getElementsByTagName("body")[0];
	let runBtn = document.createElement("button");
	runBtn.setAttribute("id", "serve-phonegap-btn");
	runBtn.innerHTML = "Serve project";

	runBtn.addEventListener("click", function(event) {
		pg.serveProject();
	});

	body.appendChild(document.createElement("br"));
	body.appendChild(runBtn);
}
