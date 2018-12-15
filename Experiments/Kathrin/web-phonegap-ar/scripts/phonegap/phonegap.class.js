"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as shell from 'shelljs';
const child_process = require("child_process");
// namespace WebPhonegapAR {
class PhoneGap {
    constructor(name, dir) {
        this.appName = name;
        this.dirPath = dir;
        this.checkDependencies();
    }
    getAppName() {
        return this.appName;
    }
    getDirPath() {
        return this.dirPath;
    }
    checkDependencies() {
        child_process.exec('node --version', (error, stdout, stderr) => {
            if (error) {
                console.log('Error. Please install node.js for creating Apps with this module.');
                this.nodeVersion = '';
            }
            else {
                this.nodeVersion = stdout;
                console.log('node version ' + this.nodeVersion);
                child_process.exec('phonegap --version', (error, stdout, stderr) => {
                    if (error) {
                        console.log('Please install phonegap for creating Apps with this module.');
                        this.phonegapVersion = '';
                    }
                    else {
                        this.phonegapVersion = stdout;
                        console.log('phonegap version ' + this.phonegapVersion);
                    }
                });
            }
        });
    }
    createProject() {
        let openDir = 'cd ' + this.dirPath;
        console.log(openDir);
        // if(this.nodeVersion !== '' && this.phonegapVersion !== '') {
        let dir = child_process.exec(openDir, (error, stdout, stderr) => {
            console.log(error);
        });
        // }
    }
    buildAndRunProject() {
        console.log('build and run project');
    }
}
exports.PhoneGap = PhoneGap;
// }
//# sourceMappingURL=phonegap.class.js.map