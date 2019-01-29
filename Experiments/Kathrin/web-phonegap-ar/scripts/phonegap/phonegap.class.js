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
const os = require("os");
const electron = require("electron");
const utils_class_1 = require("../utils/utils.class");
class PhoneGap {
    constructor(name = "", dir = "", data) {
        this.exec = util.promisify(child_process.exec);
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
        }
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
    getServeProcess() {
        return this.serveProcess;
    }
    getBuildProcess() {
        return this.buildProcess;
    }
    checkDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (typeof this.nodeVersion === undefined && typeof this.phonegapVersion === undefined) {
                this.nodeVersion = yield Promise.resolve(this.checkNodeVersion());
                this.phonegapVersion = yield Promise.resolve(this.checkPhonegapVersion());
            }
            if (this.nodeVersion == "" && this.phonegapVersion == "") {
                result = new utils_class_1.ReturnMessage(false, "Please install node.js and phonegap.");
            }
            else if (this.nodeVersion == "") {
                result = new utils_class_1.ReturnMessage(false, "Please install node.js.");
            }
            else if (this.phonegapVersion == "") {
                console.log("Bitte PhoneGap installieren");
                result = new utils_class_1.ReturnMessage(false, "Please install phonegap");
            }
            else {
                result = new utils_class_1.ReturnMessage(true, "All necessary dependencies installed.");
            }
            return result;
        });
    }
    checkNodeVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout, stderr } = yield this.exec("node --version");
            return stdout == null ? "" : stdout;
        });
    }
    checkPhonegapVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout, stderr } = yield this.exec("phonegap --version");
            return stdout == null ? "" : stdout;
        });
    }
    openProject(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dirPath = filepath.substr(0, filepath.lastIndexOf("\\"));
            this.appFolderName = filepath.substr(filepath.lastIndexOf("\\") + 1, filepath.length);
            this.pathToProject = filepath;
            let infoFile = filepath + "\\config.xml";
            return new Promise((resolve, reject) => {
                try {
                    fs.readFile(infoFile, (error, data_xml) => {
                        if (!error) {
                            let parser = new xml2js.Parser();
                            parser.parseString(data_xml, (error, data) => {
                                if (!error) {
                                    this.fileInfo = data.widget;
                                    this.appName = this.fileInfo.name[0];
                                    resolve(new utils_class_1.ReturnMessage(true, "Opened project."));
                                }
                                else {
                                    reject(new utils_class_1.ReturnMessage(false, "Could not open config.xml. Is this a PhoneGap-Project?"));
                                }
                            });
                        }
                        else {
                            reject(new utils_class_1.ReturnMessage(false, "Error while reading config.xml " + error));
                        }
                    });
                }
                catch (error) {
                    reject(new utils_class_1.ReturnMessage(false, "Could not open read file. " + error));
                }
            });
        });
    }
    createProject() {
        return __awaiter(this, void 0, void 0, function* () {
            let openDir = "cd " + this.dirPath;
            let checkDep;
            let result = new utils_class_1.ReturnMessage(false, "Something with dependencies");
            try {
                checkDep = yield this.checkDependencies();
                if (checkDep.getResult()) {
                    const { stdout, stderr } = yield this.exec(openDir);
                    if (stdout != null) {
                        console.log("entered directory");
                        result = yield this.createProjectDirectory();
                    }
                    else {
                        result = new utils_class_1.ReturnMessage(false, "Could not find project path.");
                    }
                }
                return result;
            }
            catch (error) {
                console.log("Error: " + error);
            }
        });
    }
    createProjectDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            let command = "phonegap create " + this.appFolderName + ' --name "' + this.appName + '"';
            try {
                const { stdout, stderr } = yield this.exec(command, { cwd: this.dirPath });
                if (stdout) {
                    this.pathToProject = this.dirPath + "\\" + this.appFolderName;
                    console.log("Created Phonegap Project");
                    return new utils_class_1.ReturnMessage(true, "Created phonegap project.");
                }
                else {
                    return new utils_class_1.ReturnMessage(false, "Could not create project.");
                }
            }
            catch (error) {
                console.log("Error: Project could not be created. Check if your ProjectPath already exists.");
                return new utils_class_1.ReturnMessage(false, "Project could not be created. Check if your project path already exists.");
            }
        });
    }
    serveProject(port = 1234) {
        return __awaiter(this, void 0, void 0, function* () {
            let command;
            if (os.platform() === "win32") {
                command = "phonegap.cmd";
            }
            else {
                command = "phonegap";
            }
            let options = {
                cwd: this.pathToProject
            };
            let args = [];
            args.push("serve");
            args.push("--port");
            args.push(port);
            try {
                this.serveProcess = yield child_process.spawn(command, args, options);
                console.log(this.serveProcess.pid);
                this.createProjectWindow("http://localhost:" + port);
                return new utils_class_1.ReturnMessage(true, "Run project locally on port " + port + " pid: " + this.serveProcess.pid);
            }
            catch (error) {
                return new utils_class_1.ReturnMessage(false, "Could not run project locally: " + error);
            }
        });
    }
    createProjectWindow(url) {
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
    killServeProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.serveProcess !== undefined && !this.serveProcess.killed) {
                if (os.platform() === "win32") {
                    yield child_process.execSync("taskkill /F /T /PID " + this.serveProcess.pid);
                    this.serveProcess.killed = true;
                }
                else {
                    this.serveProcess.kill();
                }
                this.projectWindow.destroy();
                return new utils_class_1.ReturnMessage(true, "Process (" + this.serveProcess.pid + ") killed.");
            }
            else {
                return new utils_class_1.ReturnMessage(false, "No active serve process found on this project.");
            }
        });
    }
    buildProjectForAndroid(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            let command;
            if (os.platform() === "win32") {
                command = "phonegap.cmd";
            }
            else {
                command = "phonegap";
            }
            let options = {
                cwd: this.pathToProject
            };
            let args = [];
            args.push("build");
            args.push("android");
            try {
                this.buildProcess = yield child_process.spawn(command, args, options);
                this.buildProcess.stdout.on("data", (data) => {
                    this.setProcessDataEvent(data);
                    terminal.dispatchEvent(this.processEvent);
                });
                this.buildProcess.stderr.on("data", (data) => {
                    this.setProcessDataEvent(data);
                    terminal.dispatchEvent(this.processEvent);
                });
                this.buildProcess.on("close", (code) => {
                    this.setProcessDataEvent(code, "process-end");
                    terminal.dispatchEvent(this.processEvent);
                });
            }
            catch (error) {
                console.log(error);
            }
            return new utils_class_1.ReturnMessage(false, "Error");
        });
    }
    setProcessDataEvent(data, name) {
        let eventName = name ? name : "process-data";
        this.processEvent = new CustomEvent(eventName, {
            detail: {
                data: data
            }
        });
    }
}
exports.PhoneGap = PhoneGap;
//# sourceMappingURL=phonegap.class.js.map