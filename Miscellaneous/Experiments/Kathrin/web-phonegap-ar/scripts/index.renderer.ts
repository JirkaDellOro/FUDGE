import { ipcRenderer } from "electron";
import { PhoneGap } from "./phonegap/phonegap.class";
import { ReturnMessage } from "utils/utils.class";

/* CROSS WINDOW EVENTS */
let pg: PhoneGap = new PhoneGap();
const openedProject: HTMLElement = document.querySelector("#opened-project");
const createdProject: HTMLElement = document.querySelector("#created-project");
const loading: HTMLElement = document.querySelector("#loading");

ipcRenderer.on("opened-pg-project", (event, data: PhoneGap) => {
	pg = new PhoneGap("", "", data);
	openedProject.querySelector("span.project-name").innerHTML = pg.getAppName();
	if (!openedProject.classList.contains("show")) {
		openedProject.classList.add("show");
	}
	showPgProjectBtns();
});

ipcRenderer.on("created-pg-project", (event, data: PhoneGap) => {
	pg = new PhoneGap("", "", data);
	createdProject.querySelector("span.project-name").innerHTML = pg.getAppName();
	if (!createdProject.classList.contains("show")) {
		createdProject.classList.add("show");
	}

	showPgProjectBtns();
});

function showPgProjectBtns(): void {
	const projectBtnContainer: HTMLElement = document.querySelector("#project-btn-container");
	if (projectBtnContainer.classList.contains("hide")) {
		projectBtnContainer.classList.remove("hide");
	}
}

/* RENDERER EVENTS */
const servePortInput: HTMLInputElement = document.querySelector("#serve-port");
const serveProjectBtn: HTMLElement = document.querySelector("#serve-project");
const killServeProjectBtn: HTMLElement = document.querySelector("#kill-serve-project");
const buildProjectBtn: HTMLElement = document.querySelector("#build-project");
const installProjectBtn: HTMLElement = document.querySelector("#install-project");
const runProjectBtn: HTMLElement = document.querySelector("#run-project");

const terminal: HTMLElement = document.querySelector("#terminal");
const resultContainer: HTMLElement = document.querySelector("#result");
const clearTerminalBtn: HTMLElement = document.querySelector("#clear-terminal");

serveProjectBtn.addEventListener("click", (event: Event) => {
	let port = servePortInput.valueAsNumber ? servePortInput.valueAsNumber : 1234;
	pg.serveProject(port, terminal).then((msg: ReturnMessage) => {
		if (msg.getResult()) {
			killServeProjectBtn.classList.remove("hide");
		}
		resultContainer.innerHTML = msg.getMessage();
	});
});

killServeProjectBtn.addEventListener("click", (event: Event) => {
	pg.killServeProcess()
		.then((msg: ReturnMessage) => {
			resultContainer.innerHTML = msg.getMessage();
			if (msg.getResult()) {
				killServeProjectBtn.classList.add("hide");
			}
			if (resultContainer.classList.contains("hide")) {
				resultContainer.classList.remove("hide");
			}
		})
		.catch((error: ReturnMessage) => {
			resultContainer.innerHTML = error.getMessage();
			if (resultContainer.classList.contains("hide")) {
				resultContainer.classList.remove("hide");
			}
		});
});

buildProjectBtn.addEventListener("click", (event: Event) => {
	loading.classList.remove("hide");
	pg.buildProjectForAndroid(terminal)
		.then((msg: ReturnMessage) => {
			console.log("build", msg);
			resultContainer.innerHTML = msg.getMessage();
			if (resultContainer.classList.contains("hide")) {
				resultContainer.classList.remove("hide");
			}
		})
		.catch((error: ReturnMessage) => {
			resultContainer.innerHTML = error.getMessage();
			if (resultContainer.classList.contains("hide")) {
				resultContainer.classList.remove("hide");
			}
		});
});

installProjectBtn.addEventListener("click", (event: Event) => {
	loading.classList.remove("hide");
	pg.installProjectOnAndroid(terminal)
		.then((msg: ReturnMessage) => {
			resultContainer.innerHTML = msg.getMessage();
			if (resultContainer.classList.contains("hide")) {
				resultContainer.classList.remove("hide");
			}
		})
		.catch((error: ReturnMessage) => {
			resultContainer.innerHTML = error.getMessage();
			if (resultContainer.classList.contains("hide")) {
				resultContainer.classList.remove("hide");
			}
		});
});

runProjectBtn.addEventListener("click", (event: Event) => {
	loading.classList.remove("hide");
	pg.runProjectOnAndroid(terminal)
		.then((msg: ReturnMessage) => {
			console.log("run", msg);
			resultContainer.innerHTML = msg.getMessage();
			if (resultContainer.classList.contains("hide")) {
				resultContainer.classList.remove("hide");
			}
		})
		.catch((error: ReturnMessage) => {
			resultContainer.innerHTML = error.getMessage();
			if (resultContainer.classList.contains("hide")) {
				resultContainer.classList.remove("hide");
			}
		});
});

clearTerminalBtn.addEventListener("click", (event: Event) => {
	terminal.innerHTML = "";
});

terminal.addEventListener("process-data", (event: CustomEvent) => {
	let child = document.createElement("div");
	child.classList.add("process-data");
	child.innerHTML = event.detail.data;
	terminal.appendChild(child);
	if (terminal.classList.contains("hide")) {
		terminal.classList.remove("hide");
	}
});

terminal.addEventListener("process-end", (event: CustomEvent) => {
	let child = document.createElement("div");
	child.classList.add("process-data");
	if (event.detail.data == 0) {
		child.innerHTML = "Exit code " + event.detail.data + ": build successful";
	} else {
		child.innerHTML = "Exit code " + event.detail.data + ": something went wrong";
	}

	terminal.appendChild(child);
	loading.classList.add("hide");
	if (terminal.classList.contains("hide")) {
		terminal.classList.remove("hide");
	}
});
