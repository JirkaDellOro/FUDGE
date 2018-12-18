import { PhoneGap } from './phonegap.class';

let pg:PhoneGap;

window.addEventListener('load', () => {
	init();
});

function init() {
	const domAppDir: HTMLInputElement = document.getElementById('app-dir') as HTMLInputElement;
	const domSubmitBtn: HTMLElement = document.getElementById('open-phonegap-dir');

	domSubmitBtn.addEventListener('click', (event: any) => {
		const appDir: string = domAppDir.files[0].path;

		if (appDir == null) {
			alert('Bitte App-Verzeichnis angeben');
		} else {
			openPhoneGapProject(appDir);
		}
	});
}

async function openPhoneGapProject(dir: string) {
	console.log(dir);
	pg = new PhoneGap();
	try {
		console.log('open project');
		let opened = await pg.openProject(dir);
		createServeProjectBtn();
	} catch (error) {
		console.error(error);
	}
}

function createServeProjectBtn() {
	if(!document.getElementById('serve-phonegap-btn')) {
		let body = document.getElementsByTagName('body')[0];
		let runBtn = document.createElement('button');
		runBtn.setAttribute('id', 'serve-phonegap-btn');
		runBtn.innerHTML = 'Serve project';

		runBtn.addEventListener('click', function(event) {
			pg.serveProject();
		});

		body.appendChild(document.createElement('br'));
		body.appendChild(runBtn);
	}
}

