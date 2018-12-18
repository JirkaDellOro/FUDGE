import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';

let mainWindow: any;
const mainMenuTpl = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Create AR-App',
				click() {
					changeMainWindowContent('CreateAR');
				},
			},
			{
				label: 'Create PhoneGap-App',
				click() {
					changeMainWindowContent('CreatePhoneGapApp');
				},
			}, 
			{
				label: 'Open PhoneGap-App',
				click() {
					changeMainWindowContent('OpenPhoneGapApp');
				},
			},
			{
				accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				label: 'Quit',
				click() {
					app.quit();
				},
			},
		],
	},
];

initializeApp();

// add dev tools when not in production
if (process.env.NODE_ENV !== 'production') {
	mainMenuTpl.push({
		label: 'DevTools',
		submenu: [{
			accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
			label: 'Toggle DevTools',
			click() {
				mainWindow.toggleDevTools();
			},
		}],
	});
}

function initializeApp() {

	app.on('ready', () => {
		createMainWindow();
		// xrSession = new XRSession();
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});
}

function changeMainWindowContent(content: string) {
	let file = '';
	switch (content) {
		case 'CreateAR':
			file = 'ar/ar.html';
			break;
		case 'CreatePhoneGapApp':
			file = 'phonegap/phonegap-create.html';
			break;
		case 'OpenPhoneGapApp':
			file = 'phonegap/phonegap-open.html';
			break;
		default:
			break;
	}
	mainWindow.loadFile(path.join(__dirname, '../templates/' + file));
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		height: 900,
		webPreferences: {
			experimentalCanvasFeatures: true,
			experimentalFeatures: true,
			nodeIntegration: true,
			plugins: true,
			webSecurity: false,
		},
		width: 1200,
	});

	// app.commandLine.appendSwitch('--enable-webxr');
	// app.commandLine.appendSwitch('--enable-webxr-hit-test');

	const mainMenu = Menu.buildFromTemplate(mainMenuTpl);
	Menu.setApplicationMenu(mainMenu);

	mainWindow.loadFile(path.join(__dirname, '../templates/index.html'));
	mainWindow.openDevTools();

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}
