import { ipcRenderer } from "electron";
import { PhoneGap } from "./phonegap/phonegap.class";

let pg: PhoneGap = new PhoneGap();
const projectInfo: HTMLElement = document.querySelector("#project-info");
const openedProject: HTMLElement = document.querySelector("#opened-project");
// const projectInfo: HTMLElement = document.querySelector('#show-project-info');

ipcRenderer.on("opened-pg-project", (event, data: PhoneGap) => {
	pg = new PhoneGap("", "", data);
	projectInfo.classList.add("show");
	openedProject.querySelector("span.project-name").innerHTML = pg.getAppName();

	showPgProjectBtns();
});

function showPgProjectBtns(): void {
	const projectBtnContainer: HTMLElement = document.querySelector("#project-btn-container");
	const servePortInput: HTMLElement = document.querySelector("#serve-port");
	const serveProjectBtn: HTMLElement = document.querySelector("#serve-project");

	projectBtnContainer.classList.add("show");
	serveProjectBtn.addEventListener("click", (event: Event) => {
		pg.serveProject(parseInt(servePortInput.nodeValue));
	});
}
