"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as shell from 'shelljs';
const child_process = require("child_process");
const util = require("util");
const fs = require("fs");
const xml2js = require("xml2js");
// namespace WebPhonegapAR {
class PhoneGap {
    constructor(name, dir) {
        this.exec = util.promisify(child_process.exec);
        this.spawn = child_process.spawn;
        this.appName = name ? name : '';
        this.dirPath = dir;
        this.appFolderName = this.appName.replace(/\s/g, '-');
    }
    getAppName() {
        return this.appName;
    }
    getAppFolder() {
        return this.appFolderName;
    }
    getDirPath() {
        return this.dirPath;
    }
    checkDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (typeof (this.nodeVersion) === undefined && typeof (this.phonegapVersion) === undefined) {
                this.nodeVersion = yield Promise.resolve(this.checkNodeVersion());
                this.phonegapVersion = yield Promise.resolve(this.checkPhonegapVersion());
            }
            if (this.nodeVersion == '' && this.phonegapVersion == '') {
                console.log('Bitte Node.js und PhoneGap installieren');
                result = false;
            }
            else if (this.nodeVersion == '') {
                console.log('Bitte Node.js installieren');
                result = false;
            }
            else if (this.phonegapVersion == '') {
                console.log('Bitte PhoneGap installieren');
                result = false;
            }
            else {
                console.log('Alle Dependencies installiert!');
                result = true;
            }
            return result;
        });
    }
    checkNodeVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout, stderr } = yield this.exec('node --version');
            return stdout == null ? '' : stdout;
        });
    }
    checkPhonegapVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout, stderr } = yield this.exec('phonegap --version');
            return stdout == null ? '' : stdout;
        });
    }
    openProject(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dirPath = filepath.substr(0, filepath.lastIndexOf('\\'));
            this.appFolderName = filepath.substr(filepath.lastIndexOf('\\') + 1, filepath.length);
            this.pathToProject = filepath;
            let infoFile = filepath + '\\config.xml';
            yield fs.readFile(infoFile, (error, data_xml) => {
                if (!error) {
                    let parser = new xml2js.Parser();
                    parser.parseString(data_xml, (error, data) => {
                        if (!error) {
                            this.fileInfo = data.widget;
                            this.appName = this.fileInfo.name[0];
                            console.log('opened');
                            return true;
                        }
                        else {
                            console.error('Could not open config.xml - Is this a PhoneGap-Project');
                            return false;
                        }
                    });
                }
                else {
                    console.error('Error while reading file: ' + error);
                    return false;
                }
            });
        });
    }
    createProject() {
        return __awaiter(this, void 0, void 0, function* () {
            let openDir = 'cd ' + this.dirPath;
            let checkDep;
            try {
                checkDep = yield this.checkDependencies();
                if (checkDep) {
                    const { stdout, stderr } = yield this.exec(openDir);
                    if (stdout != null) {
                        console.log('entered directory');
                        this.createProjectDirectory();
                    }
                    else {
                        console.log('Path not found');
                    }
                }
            }
            catch (error) {
                console.log('Error: ' + error);
            }
        });
    }
    createProjectDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            let command = 'phonegap create ' + this.appFolderName + ' --name "' + this.appName + '"';
            try {
                const { stdout, stderr } = yield this.exec(command, { cwd: this.dirPath });
                if (stdout) {
                    this.pathToProject = this.dirPath + '\\' + this.appFolderName;
                    console.log('Created Phonegap Project');
                }
            }
            catch (error) {
                console.log('Error: Project could not be created. Check if your ProjectPath already exists.');
            }
        });
    }
    serveProject(port = 1234) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (error) {
                console.log('Error: Could not run project.', error);
            }
        });
    }
}
exports.PhoneGap = PhoneGap;
// }
//# sourceMappingURL=phonegap.class.js.map