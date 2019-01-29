import { ipcRenderer } from "electron";
import { PhoneGap } from "./phonegap/phonegap.class";

let pg: PhoneGap = new PhoneGap();
const terminal: HTMLElement = document.querySelector("#terminal");
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
	if (!projectBtnContainer.classList.contains("show")) {
		projectBtnContainer.classList.add("show");
	}
}

const servePortInput: HTMLElement = document.querySelector("#serve-port");
const serveProjectBtn: HTMLElement = document.querySelector("#serve-project");
const buildProjectBtn: HTMLElement = document.querySelector("#build-project");

serveProjectBtn.addEventListener("click", (event: Event) => {
	pg.serveProject(parseInt(servePortInput.nodeValue));
});

buildProjectBtn.addEventListener("click", (event: Event) => {
	loading.classList.remove("hide");
	pg.buildProjectForAndroid(terminal);
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
		child.innerHTML = "Exit code: " + event.detail.data + " build successful";
	} else {
		child.innerHTML = "Exit code: " + event.detail.data + " something went wrong";
	}

	terminal.appendChild(child);
	loading.classList.add("hide");
	if (terminal.classList.contains("hide")) {
		terminal.classList.remove("hide");
	}
});
