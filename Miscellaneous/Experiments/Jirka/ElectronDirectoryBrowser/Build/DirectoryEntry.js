///<reference types="../../../../../node_modules/@types/node/fs"/>
var DirectoryBrowser;
(function (DirectoryBrowser) {
    const { Dirent, PathLike, renameSync, rmdirSync, unlinkSync, readdirSync } = require("fs");
    const { basename, dirname, join } = require("path");
    // console.log(basename("C:/Hello.txt"));
    class DirectoryEntry {
        constructor(_path, _dirent) {
            this.path = _path;
            this.dirent = _dirent;
        }
        static createRoot(_path) {
            let dirent = new Dirent();
            dirent.name = basename(_path);
            return new DirectoryEntry(_path, dirent);
        }
        get name() {
            return this.dirent.name;
        }
        set name(_name) {
            renameSync(this.path, dirname(this.path) + _name);
        }
        get isDirectory() {
            return this.dirent.isDirectory();
        }
        get isFile() {
            return this.dirent.isFile();
        }
        delete() {
            if (this.isDirectory)
                rmdirSync(this.path);
            else
                unlinkSync(this.path);
        }
        getContent() {
            let dirents = readdirSync(this.path, { withFileTypes: true });
            let content = [];
            for (let dirent of dirents) {
                let entry = new DirectoryEntry(join(this.path, dirent.name), dirent);
                content.push(entry);
            }
            return content;
        }
        isDescendantOf(_entry) {
            // TODO: return true if this is contained within entry (Check path)
            return false;
        }
        addEntry(_entry) {
            // TODO: add file/directory to this, return succes/fail
            return true;
        }
    }
    DirectoryBrowser.DirectoryEntry = DirectoryEntry;
})(DirectoryBrowser || (DirectoryBrowser = {}));
//# sourceMappingURL=DirectoryEntry.js.map