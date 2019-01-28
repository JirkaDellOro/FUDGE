// import * as shell from 'shelljs';
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
	private projectWindow: any;

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
		}
	}

	public getAppName(): string {
		return this.appName;
	}

	public getAppFolder(): string {
		return this.appFolderName;
	}

	public getDirPath(): string {
		return this.dirPath;
	}

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
			console.log("Bitte PhoneGap installieren");
			result = new ReturnMessage(false, "Please install phonegap");
		} else {
			result = new ReturnMessage(true, "All necessary dependencies installed.");
		}
		return result;
	}

	private async checkNodeVersion(): Promise<string> {
		const { stdout, stderr } = await this.exec("node --version");
		return stdout == null ? "" : stdout;
	}

	private async checkPhonegapVersion(): Promise<string> {
		const { stdout, stderr } = await this.exec("phonegap --version");
		return stdout == null ? "" : stdout;
	}

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
				reject(new ReturnMessage(false, "Could not open read file. " + error));
			}
		});
	}

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

	private async createProjectDirectory(): Promise<ReturnMessage> {
		let command: string = "phonegap create " + this.appFolderName + ' --name "' + this.appName + '"';
		try {
			const { stdout, stderr } = await this.exec(command, { cwd: this.dirPath });
			if (stdout) {
				this.pathToProject = this.dirPath + "\\" + this.appFolderName;
				console.log("Created Phonegap Project");
				return new ReturnMessage(true, "Created phonegap project.");
			} else {
				return new ReturnMessage(false, "Could not create project.");
			}
		} catch (error) {
			console.log("Error: Project could not be created. Check if your ProjectPath already exists.");
			return new ReturnMessage(false, "Project could not be created. Check if your project path already exists.");
		}
	}

	public async serveProject(port: number = 1234): Promise<boolean | child_process.ChildProcess> {
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
			console.log(this.serveProcess.pid);
			this.createProjectWindow("http://localhost:" + port);
			return this.serveProcess;
		} catch (error) {
			console.log("Error: Could not run project.", error);
			return false;
		}
	}

	private createProjectWindow(url: string) {
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

	public async killServeProcess(): Promise<ReturnMessage> {
		if (this.serveProcess !== undefined && !this.serveProcess.killed) {
			if (os.platform() === "win32") {
				await child_process.execSync("taskkill /F /T /PID " + this.serveProcess.pid);
				this.serveProcess.killed = true;
			} else {
				this.serveProcess.kill();
			}
			this.projectWindow.destroy();
			return new ReturnMessage(true, "Process (" + this.serveProcess.pid + ") killed.");
		} else {
			return new ReturnMessage(false, "No active serve process found on this project.");
		}
	}

	public async buildProjectForAndroid(): Promise<ReturnMessage> {
		this.getBuildForAndroidDependencies();
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
			console.log(this.buildProcess);
		} catch (error) {
			console.log(error);
		}
		return new ReturnMessage(false, "Error");
	}

	private async getBuildForAndroidDependencies(): Promise<ReturnMessage> {
		return new ReturnMessage(false, "No dependencies found for building android-application");
	}
}
