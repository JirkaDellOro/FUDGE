import * as child_process from "child_process";
import * as util from "util";
import * as fs from "fs";
import * as xml2js from "xml2js";
import * as os from "os";
import * as electron from "electron";
import { ReturnMessage } from "../utils/utils.class";

export class PhoneGap {
	private appName: string;
	private dirPath: string;
	private appFolderName: string;
	private pathToProject: string;
	private fileInfo: any;

	private nodeVersion: string;
	private phonegapVersion: string;

	private exec: any = util.promisify(child_process.exec);

	private serveProcess: child_process.ChildProcess;
	private buildProcess: child_process.ChildProcess;
	private installProcess: child_process.ChildProcess;
	private runProcess: child_process.ChildProcess;
	private projectWindow: any;

	private processEvent: CustomEvent;

	constructor(name: string = "", dir: string = "", data?: PhoneGap) {
		this.appName = name;
		this.dirPath = dir;
		this.appFolderName = this.appName.replace(/\s/g, "-");

		if (data) {
			this.appName = data.appName ? data.appName : name;
			this.dirPath = data.dirPath ? data.dirPath : dir;
			this.appFolderName = data.appFolderName ? data.appFolderName : this.appName.replace(/\s/g, "-");
			this.pathToProject = data.pathToProject ? data.pathToProject : undefined;
			this.fileInfo = data.fileInfo ? data.fileInfo : undefined;
			this.serveProcess = data.serveProcess ? data.serveProcess : undefined;
			this.buildProcess = data.buildProcess ? data.buildProcess : undefined;
			this.installProcess = data.installProcess ? data.installProcess : undefined;
			this.runProcess = data.runProcess ? data.runProcess : undefined;
		}
	}

	/**
	 * Get name of current project
	 * @returns {string}
	 */
	public getAppName(): string {
		return this.appName;
	}

	/**
	 * Get name of current project folder
	 * @returns {string}
	 */
	public getAppFolder(): string {
		return this.appFolderName;
	}

	/**
	 * Get directory path of current project
	 * @returns {string}
	 */
	public getDirPath(): string {
		return this.dirPath;
	}

	/**
	 * Get current serve process
	 * @returns {child_process.ChildProcess}
	 */
	public getServeProcess(): child_process.ChildProcess {
		return this.serveProcess;
	}

	/**
	 * Get current build process
	 * @returns {child_process.ChildProcess}
	 */
	public getBuildProcess(): child_process.ChildProcess {
		return this.buildProcess;
	}

	/**
	 * Get current install process
	 * @returns {child_process.ChildProcess}
	 */
	public getInstallProcess(): child_process.ChildProcess {
		return this.installProcess;
	}

	/**
	 * Get current run process
	 * @returns {child_process.ChildProcess}
	 */
	public getRunProcess(): child_process.ChildProcess {
		return this.runProcess;
	}

	/**
	 * Check for the dependencies needed to handle phonegap projects
	 * @returns {Promise<ReturnMessage>}
	 */
	private async checkDependencies(): Promise<ReturnMessage> {
		let result: ReturnMessage;
		if (typeof this.nodeVersion === undefined && typeof this.phonegapVersion === undefined) {
			this.nodeVersion = await Promise.resolve(this.checkNodeVersion());
			this.phonegapVersion = await Promise.resolve(this.checkPhonegapVersion());
		}

		if (this.nodeVersion == "" && this.phonegapVersion == "") {
			result = new ReturnMessage(false, "Please install node.js and phonegap.");
		} else if (this.nodeVersion == "") {
			result = new ReturnMessage(false, "Please install node.js.");
		} else if (this.phonegapVersion == "") {
			result = new ReturnMessage(false, "Please install phonegap");
		} else {
			result = new ReturnMessage(true, "All necessary dependencies installed.");
		}
		return result;
	}

	/**
	 * Check if node.js is installed on local machine
	 * @returns {Promise<string>}
	 */
	private async checkNodeVersion(): Promise<string> {
		const { stdout, stderr } = await this.exec("node --version");
		return stdout == null ? "" : stdout;
	}

	/**
	 * Check if phonegap is installed on local machine
	 * @returns {Promise<string>}
	 */
	private async checkPhonegapVersion(): Promise<string> {
		const { stdout, stderr } = await this.exec("phonegap --version");
		return stdout == null ? "" : stdout;
	}

	/**
	 * Check for dependencies and start creating a new phonegap project
	 * @returns {Promise<ReturnMessage>}
	 */
	public async createProject(): Promise<ReturnMessage> {
		let openDir: string = "cd " + this.dirPath;
		let checkDep: ReturnMessage;
		let result: ReturnMessage = new ReturnMessage(false, "Something with dependencies");
		try {
			checkDep = await this.checkDependencies();
			if (checkDep.getResult()) {
				const { stdout, stderr } = await this.exec(openDir);

				if (stdout != null) {
					console.log("entered directory");
					result = await this.createProjectDirectory();
				} else {
					result = new ReturnMessage(false, "Could not find project path.");
				}
			}
			return result;
		} catch (error) {
			console.log("Error: " + error);
		}
	}

	/**
	 * Open an existing phonegap project on users machine
	 * @param filepath
	 * @returns {Promise<ReturnMessage>}
	 */
	public async openProject(filepath: string): Promise<ReturnMessage> {
		this.dirPath = filepath.substr(0, filepath.lastIndexOf("\\"));
		this.appFolderName = filepath.substr(filepath.lastIndexOf("\\") + 1, filepath.length);
		this.pathToProject = filepath;
		let infoFile = filepath + "\\config.xml";
		return new Promise((resolve, reject) => {
			try {
				fs.readFile(infoFile, (error, data_xml) => {
					if (!error) {
						let parser = new xml2js.Parser();
						parser.parseString(data_xml, (error: any, data: any) => {
							if (!error) {
								this.fileInfo = data.widget;
								this.appName = this.fileInfo.name[0];
								resolve(new ReturnMessage(true, "Opened project."));
							} else {
								reject(new ReturnMessage(false, "Could not open config.xml. Is this a PhoneGap-Project?"));
							}
						});
					} else {
						reject(new ReturnMessage(false, "Error while reading config.xml " + error));
					}
				});
			} catch (error) {
				reject(new ReturnMessage(false, "Could not open file. " + error));
			}
		});
	}

	/**
	 * Create phonegap directory with phonegap command and create needed files and directories
	 * @returns {Promise<ReturnMessage>}
	 */
	private async createProjectDirectory(): Promise<ReturnMessage> {
		let command: string = "phonegap create " + this.appFolderName + ' --name "' + this.appName + '"';
		try {
			const { stdout, stderr } = await this.exec(command, { cwd: this.dirPath });
			if (stdout) {
				this.pathToProject = this.dirPath + "\\" + this.appFolderName;
				console.log("Created Phonegap Project");
				return new ReturnMessage(true, "Created phonegap project.");
			} else if (stderr) {
				return new ReturnMessage(false, "Could not create project.\n" + stderr);
			}
		} catch (error) {
			return new ReturnMessage(false, "Project could not be created. Check if your project path already exists.");
		}
	}

	/**
	 * Run project locally then open a window and displaying app on a specified port
	 * Generates command line output for displaying in terminal
	 *
	 * @param {number} port
	 * @param {HTMLElement} terminal
	 * @returns {Promise<ReturnMessage>}
	 */
	public async serveProject(port: number = 1234, terminal: HTMLElement): Promise<ReturnMessage> {
		let command: string;
		if (os.platform() === "win32") {
			command = "phonegap.cmd";
		} else {
			command = "phonegap";
		}

		let options: object = {
			cwd: this.pathToProject
		};

		let args: Array<any> = [];
		args.push("serve");
		args.push("--port");
		args.push(port);

		try {
			this.serveProcess = await child_process.spawn(command, args, options);

			this.doTerminalOutput(this.serveProcess, terminal);

			this.serveProcess.stdout.on("data", (data: any) => {
				if (data.indexOf("listening on") !== -1 && data.indexOf(":" + port) !== -1) {
					this.createProjectWindow("http://localhost:" + port);
				}
			});

			console.log(this.serveProcess.pid);

			return new ReturnMessage(true, "Run project locally on port " + port + " pid: " + this.serveProcess.pid);
		} catch (error) {
			return new ReturnMessage(false, "Could not run project locally: " + error);
		}
	}

	/**
	 * Kill locally running server
	 * @returns {Promise<ReturnMessage>}
	 */
	public async killServeProcess(): Promise<ReturnMessage> {
		if (this.serveProcess !== undefined && !this.serveProcess.killed) {
			if (os.platform() === "win32") {
				await child_process.execSync("taskkill /F /T /PID " + this.serveProcess.pid);
				this.serveProcess.killed = true;
			} else {
				this.serveProcess.kill();
			}
			if (this.projectWindow) {
				this.projectWindow.destroy();
			}
			return new ReturnMessage(true, "Process (" + this.serveProcess.pid + ") killed.");
		} else {
			return new ReturnMessage(false, "No active serve process found on this project.");
		}
	}

	/**
	 * Build .apk file and save it to /platforms/android/app/build/outputs/apk/
	 * @param terminal
	 * @returns {Promise<ReturnMessage>}
	 */
	public async buildProjectForAndroid(terminal: HTMLElement): Promise<ReturnMessage> {
		let command: string;
		if (os.platform() === "win32") {
			command = "phonegap.cmd";
		} else {
			command = "phonegap";
		}

		let options: object = {
			cwd: this.pathToProject
		};

		let args: Array<any> = [];
		args.push("build");
		args.push("android");

		try {
			this.buildProcess = await child_process.spawn(command, args, options);

			this.doTerminalOutput(this.buildProcess, terminal);

			return new Promise((resolve, reject) => {
				this.buildProcess.on("close", (code: number) => {
					this.setProcessDataEvent(code, "process-end");
					terminal.dispatchEvent(this.processEvent);
					if (code === 0) {
						resolve(new ReturnMessage(true, "Build successful - saved to /platforms/android/app/build/outputs/apk/"));
					} else {
						reject(new ReturnMessage(false, "Something went wrong! Check terminal logs for detail."));
					}
				});
			});
		} catch (error) {
			return new ReturnMessage(false, "Error: " + error);
		}
	}

	/**
	 * [DEPRECATED]
	 * Build project .apk file and install it on connected device without starting the app
	 * @param {HTMLElement} terminal
	 * @returns {Promise<ReturnMessage>}
	 */
	public async installProjectOnAndroid(terminal: HTMLElement): Promise<ReturnMessage> {
		let command: string;
		if (os.platform() === "win32") {
			command = "phonegap.cmd";
		} else {
			command = "phonegap";
		}

		let options: object = {
			cwd: this.pathToProject
		};

		let args: Array<any> = [];
		args.push("install");
		args.push("android");

		try {
			this.installProcess = await child_process.spawn(command, args, options);

			this.doTerminalOutput(this.installProcess, terminal);

			return new Promise((resolve, reject) => {
				this.installProcess.on("close", (code: number) => {
					this.setProcessDataEvent(code, "process-end");
					terminal.dispatchEvent(this.processEvent);
					if (code === 0) {
						resolve(new ReturnMessage(true, "Installed successfully"));
					} else {
						reject(new ReturnMessage(false, "Something went wrong! Check terminal logs for detail."));
					}
				});
			});
		} catch (error) {
			return new ReturnMessage(false, "Error: " + error);
		}
	}

	/**
	 * Build project .apk file and install it on connected device wit starting the app
	 * Generates command line output and returns it as events
	 *
	 * @param {HTMLElement} terminal
	 * @returns {Promise<ReturnMessage>}
	 */
	public async runProjectOnAndroid(terminal: HTMLElement): Promise<ReturnMessage> {
		let command: string;
		if (os.platform() === "win32") {
			command = "phonegap.cmd";
		} else {
			command = "phonegap";
		}

		let options: object = {
			cwd: this.pathToProject
		};

		let args: Array<any> = [];
		args.push("run");
		args.push("android");

		try {
			this.runProcess = await child_process.spawn(command, args, options);

			this.doTerminalOutput(this.runProcess, terminal);

			return new Promise((resolve, reject) => {
				this.runProcess.on("close", (code: number) => {
					this.setProcessDataEvent(code, "process-end");
					terminal.dispatchEvent(this.processEvent);
					if (code === 0) {
						resolve(new ReturnMessage(true, "Run successful"));
					} else {
						reject(new ReturnMessage(false, "Something went wrong! Check terminal logs for detail."));
					}
				});
			});
		} catch (error) {
			return new ReturnMessage(false, "Error: " + error);
		}
	}

	/**
	 * Set custom process event with custom data and name
	 * @param {string | number} data
	 * @param {string} name
	 */
	private setProcessDataEvent(data: string | number, name?: string): void {
		let eventName = name ? name : "process-data";
		this.processEvent = new CustomEvent(eventName, {
			detail: {
				data: data
			}
		});
	}

	/**
	 * Create new browser window and load specified url
	 * @param url
	 */
	private createProjectWindow(url: string): void {
		this.projectWindow = new electron.remote.BrowserWindow({
			width: 360,
			height: 640,
			resizable: false,
			closable: false,
			title: this.appName,
			titleBarStyle: "hidden"
		});
		this.projectWindow.setMenu(null);

		this.projectWindow.on("closed", () => {
			this.projectWindow = null;
		});

		this.projectWindow.loadURL(url);
	}

	/**
	 * Send process data event to create cmd output in terminal
	 * @param {ChildProcess} process
	 * @param {HTMLElement} terminal
	 */
	private doTerminalOutput(process: child_process.ChildProcess, terminal: HTMLElement): void {
		process.stdout.setEncoding("utf-8");
		process.stderr.setEncoding("utf-8");

		process.stdout.on("data", (data: any) => {
			this.setProcessDataEvent(this.consoleStyleToHtmlString(data.toString()));
			terminal.dispatchEvent(this.processEvent);
		});

		process.stderr.on("data", (data: any) => {
			this.setProcessDataEvent(this.consoleStyleToHtmlString(data.toString()));
			terminal.dispatchEvent(this.processEvent);
		});
	}

	/**
	 * Replace console specified style in string for displaying it in HTML
	 * @param charset
	 * @returns {string}
	 */
	private consoleStyleToHtmlString(charset: string): string {
		if (charset != "") {
			let htmlString: string;
			let stringified: string = JSON.stringify(charset)
				.replace(/\"/g, "")
				.replace(/\'/g, "")
				.replace(/\\n/g, "<br/>")
				.replace(/\\r/g, "");

			let regExps: Array<{ label: string; exp: RegExp }> = [
				{ label: "reset", exp: new RegExp(/(\\u001b\[0m)+/g) },
				{ label: "reset", exp: new RegExp(/(\\u001b\[39m)+/g) },

				{ label: "bright", exp: new RegExp(/(\\u001b\[1m)+/g) },
				{ label: "dim", exp: new RegExp(/(\\u001b\[2m)+/g) },
				{ label: "underscore", exp: new RegExp(/(\\u001b\[4m)+/g) },
				{ label: "blink", exp: new RegExp(/(\\u001b\[5m)+/g) },
				{ label: "inverse", exp: new RegExp(/(\\u001b\[7m)+/g) },
				{ label: "hidden", exp: new RegExp(/(\\u001b\[8m)+/g) },

				{ label: "fg-black", exp: new RegExp(/(\\u001b\[30m)+/g) },
				{ label: "fg-red", exp: new RegExp(/(\\u001b\[31m)+/g) },
				{ label: "fg-green", exp: new RegExp(/(\\u001b\[32m)+/g) },
				{ label: "fg-yellow", exp: new RegExp(/(\\u001b\[33m)+/g) },
				{ label: "fg-blue", exp: new RegExp(/(\\u001b\[34m)+/g) },
				{ label: "fg-magenta", exp: new RegExp(/(\\u001b\[35m)+/g) },
				{ label: "fg-cyan", exp: new RegExp(/(\\u001b\[36m)+/g) },
				{ label: "fg-white", exp: new RegExp(/(\\u001b\[37m)+/g) },

				{ label: "bg-black", exp: new RegExp(/(\\u001b\[40m)+/g) },
				{ label: "bg-red", exp: new RegExp(/(\\u001b\[41m)+/g) },
				{ label: "bg-green", exp: new RegExp(/(\\u001b\[42m)+/g) },
				{ label: "bg-yellow", exp: new RegExp(/(\\u001b\[43m)+/g) },
				{ label: "bg-blue", exp: new RegExp(/(\\u001b\[44m)+/g) },
				{ label: "bg-magenta", exp: new RegExp(/(\\u001b\[45m)+/g) },
				{ label: "bg-cyan", exp: new RegExp(/(\\u001b\[46m)+/g) },
				{ label: "bg-white", exp: new RegExp(/(\\u001b\[47m)+/g) }
			];

			for (let i = 0; i < regExps.length; i++) {
				let htmlPart: string = "";
				if (regExps[i].label == "reset") {
					htmlPart = "</span>";
				} else {
					htmlPart = '<span class="' + regExps[i].label + '">';
				}
				if (stringified.match(regExps[i].exp) !== null) {
					stringified = stringified.replace(regExps[i].exp, htmlPart);
				}
			}

			return stringified;
		}
	}
}
