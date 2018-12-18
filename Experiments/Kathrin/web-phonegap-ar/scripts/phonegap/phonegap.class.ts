// import * as shell from 'shelljs';
import * as child_process from 'child_process';
import * as util from 'util';
import * as fs from 'fs';
import * as xml2js from 'xml2js';

// namespace WebPhonegapAR {
	export class PhoneGap {
		private appName: string;
		private dirPath: string;
		private appFolderName: string;
		private pathToProject: string;
		private fileInfo: any;

		private nodeVersion;
		private phonegapVersion;
		
		private exec = util.promisify(child_process.exec);
		private spawn = child_process.spawn;

		constructor(name?: string, dir?: string) {
			this.appName = name ? name : '';
			this.dirPath = dir;
			this.appFolderName = this.appName.replace(/\s/g, '-');
		}

		public getAppName() {
			return this.appName;
		}

		public getAppFolder() {
			return this.appFolderName;
		}

		public getDirPath() {
			return this.dirPath;
		}

		private async checkDependencies() {
			let result:boolean;
			if(typeof(this.nodeVersion) === undefined && typeof(this.phonegapVersion) === undefined) {
				this.nodeVersion = await Promise.resolve(this.checkNodeVersion());
				this.phonegapVersion = await Promise.resolve(this.checkPhonegapVersion());
			}

			if (this.nodeVersion == '' && this.phonegapVersion == '') {
				console.log('Bitte Node.js und PhoneGap installieren');
				result = false;
			} else if (this.nodeVersion == '') {
				console.log('Bitte Node.js installieren');
				result = false;
			} else if (this.phonegapVersion == '') {
				console.log('Bitte PhoneGap installieren');
				result = false;
			} else {
				console.log('Alle Dependencies installiert!');
				result = true;
			}
			return result;
		}

		private async checkNodeVersion() {
			const {stdout, stderr} = await this.exec('node --version');
			return stdout == null ? '' : stdout;
		}

		private async checkPhonegapVersion() {
			const {stdout, stderr} = await this.exec('phonegap --version');
			return stdout == null ? '' : stdout;
		}

		public async openProject(filepath: string) {
			this.dirPath = filepath.substr(0, filepath.lastIndexOf('\\'));
			this.appFolderName = filepath.substr(filepath.lastIndexOf('\\') + 1, filepath.length);
			this.pathToProject = filepath;
			let infoFile = filepath + '\\config.xml';
			await fs.readFile(infoFile, (error, data_xml) => {
				if(!error) {
					let parser = new xml2js.Parser();
					parser.parseString(data_xml, (error, data) => {
						if(!error) {
							this.fileInfo = data.widget;
							this.appName = this.fileInfo.name[0];
							console.log('opened');
							return true;
						} else {
							console.error('Could not open config.xml - Is this a PhoneGap-Project');
							return false;
						}
					});
				} else {
					console.error('Error while reading file: ' + error);
					return false;
				}
			});
		}

		public async createProject() {
			let openDir: string = 'cd ' + this.dirPath;
			let checkDep;
			try {
				checkDep = await this.checkDependencies();
				if(checkDep) {
					const {stdout, stderr} = await this.exec(openDir);

					if(stdout != null) {
						console.log('entered directory');
						this.createProjectDirectory();
					} else {
						console.log('Path not found');
					}
				}
			} catch(error) {
				console.log('Error: ' + error);
			}
		}

		private async createProjectDirectory() {
			let command = 'phonegap create ' + this.appFolderName + ' --name "' + this.appName + '"';
			try {
				const {stdout, stderr} = await this.exec(command, {cwd: this.dirPath});
				if(stdout) {
					this.pathToProject = this.dirPath + '\\' + this.appFolderName;
					console.log('Created Phonegap Project');
				}
			} catch(error) {
				console.log('Error: Project could not be created. Check if your ProjectPath already exists.');
			}
		}

		public async serveProject(port: number = 1234) {
			// let command = 'phonegap serve --port ' + port;
			let command = 'phonegap';
			let options = {
				cwd: this.pathToProject
			};
			let args = [];
			args.push('serve');
			args.push('--port');
			args.push(port);
			// console.log(command, options, args);
			try {
				// const {stdout, stderr} = await this.exec(command, {cwd: this.pathToProject});
				// if(stdout) {
				// 	console.log(stdout);
				// }
				// if(stderr) {
				// 	console.log(stderr);
				// }
				//############################# ?????? ###################################################
				let serve = child_process.spawnSync(command, args, options);
				serve.on('message', (message) => {
					console.log(message);
				});
				// serve.stderr.on('data', (error) => {
				// 	console.error(error);
				// });
			} catch(error) {
				console.log('Error: Could not run project.', error);
			}
		}
	}
// }
