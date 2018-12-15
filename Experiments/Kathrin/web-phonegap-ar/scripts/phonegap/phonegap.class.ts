// import * as shell from 'shelljs';
import * as child_process from 'child_process';
import * as util from 'util';

// namespace WebPhonegapAR {
	export class PhoneGap {
		private appName: string;
		private dirPath: string;
		private appFolder: string;
		private pathToProject: string;
		private nodeVersion;
		private phonegapVersion;
		private exec = util.promisify(child_process.exec);
		private spawn = child_process.spawn;

		constructor(name: string, dir: string) {
			this.appName = name;
			this.dirPath = dir;
			this.appFolder = this.appName.replace(' ', '-');

			// this.checkDependencies();
		}

		public getAppName() {
			return this.appName;
		}

		public getAppFolder() {
			return this.dirPath;
		}

		public getDirPath() {
			return this.dirPath;
		}

		private async checkDependencies() {
			let result:boolean;
			this.nodeVersion = await Promise.resolve(this.checkNodeVersion());
			this.phonegapVersion = await Promise.resolve(this.checkPhonegapVersion());

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
			let command = 'phonegap create ' + this.appFolder + ' --name "' + this.appName + '"';
			try {
				const {stdout, stderr} = await this.exec(command, {cwd: this.dirPath});
				if(stdout) {
					this.pathToProject = this.dirPath + '\\' + this.appFolder;
					console.log('Created Phonegap Project');
				}
			} catch(error) {
				console.log('Error: Project could not be created. Check if your ProjectPath already exists.');
			}
		}

		public async serveProject(port: number = 1234) {
			let command = 'phonegap';
			let options = {
				cwd: this.pathToProject
			};
			let args = [];
			args.push('serve');
			args.push('--port');
			args.push(port);
			console.log(this.pathToProject);
			try {
				// ############################################### HIER GEHTS WEITER ##############################################
				// const serve = this.spawn(command, args, options);
				// serve.stdout.on('data', (data) => {
				// 	console.log(data);
				// });
			} catch(error) {
				console.log('Error: Could not run project.', error);
			}
		}
	}
// }
