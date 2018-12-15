// import * as shell from 'shelljs';
import * as child_process from 'child_process';

// namespace WebPhonegapAR {
	export class PhoneGap {
		private appName: string;
		private dirPath: string;
		private nodeVersion: string;
		private phonegapVersion: string;

		constructor(name: string, dir: string) {
			this.appName = name;
			this.dirPath = dir;

			this.checkDependencies();
		}

		public getAppName() {
			return this.appName;
		}

		public getDirPath() {
			return this.dirPath;
		}

		private checkDependencies() {
			child_process.exec('node --version', (error, stdout, stderr) => {
				if(error) {
					console.log('Error. Please install node.js for creating Apps with this module.');
					this.nodeVersion = '';
				} else {
					this.nodeVersion = stdout;
					console.log('node version ' + this.nodeVersion);
					child_process.exec('phonegap --version', (error, stdout, stderr) => {
						if(error) {
							console.log('Please install phonegap for creating Apps with this module.');
							this.phonegapVersion = '';
						} else {
							this.phonegapVersion = stdout;
							console.log('phonegap version ' + this.phonegapVersion);
						}

					});
				}
			});
		}

		public createProject() {
			let openDir: string = 'cd ' + this.dirPath;
			console.log(openDir);
			// if(this.nodeVersion !== '' && this.phonegapVersion !== '') {
				let dir = child_process.exec(openDir, (error, stdout, stderr) => {
					console.log(error);
				});
			// }
		}

		public buildAndRunProject() {
			console.log('build and run project');
		}
	}
// }
