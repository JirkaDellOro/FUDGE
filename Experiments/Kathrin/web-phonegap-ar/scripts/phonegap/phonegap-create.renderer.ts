import { PhoneGap } from './phonegap.class';

// namespace WebPhonegapAR {
	// const PhoneGap = require('./phonegap.class');

	window.addEventListener('load', () => {
		init();
	});

	function init() {
		const domAppName: HTMLInputElement = document.getElementById('app-name') as HTMLInputElement;
		// const domAppDir: HTMLInputElement = document.getElementById('app-dir') as HTMLElement;
		const domAppDir: HTMLInputElement = document.getElementById('app-dir') as HTMLInputElement;
		const domSubmitBtn: HTMLElement = document.getElementById('create-phonegap-dir');

		domSubmitBtn.addEventListener('click', (event: any) => {
			const appName: string = domAppName.value;
			const appDir: string = domAppDir.files[0].path;

			if (appName == null && appDir == null) {
				alert('Bitte App-Name und App-Verzeichnis angeben.');
			} else if (appName == null) {
				alert('Bitte App-Name angeben.');
			} else if (appDir == null) {
				alert('Bitte App-Verzeichnis angeben');
			} else {
				createPhoneGapProject(appName, appDir);
			}
		});
	}

	function createPhoneGapProject(name: string, dir: string) {
		console.log(dir);
		const pg = new PhoneGap(name, dir);
		pg.createProject();
	}
// }
