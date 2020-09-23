var DirectoryBrowser;
(function (DirectoryBrowser) {
    const { Dirent, PathLike, renameSync, removeSync, readdirSync, copyFileSync, copySync } = require("fs-extra");
    const { basename, dirname, join } = require("path");
    class DirectoryEntry {
        constructor(_path, _dirent) {
            this.path = _path;
            this.dirent = _dirent;
        }
        static createRoot(_path) {
            let dirent = new Dirent();
            dirent.name = basename(_path);
            dirent.isRoot = true;
            return new DirectoryEntry(_path, dirent);
        }
        get name() {
            return this.dirent.name;
        }
        set name(_name) {
            let newPath = join(dirname(this.path), _name);
            renameSync(this.path, newPath);
            this.path = newPath;
            this.dirent.name = _name;
        }
        get isDirectory() {
            return this.dirent.isDirectory() || this.dirent.isRoot;
        }
        delete() {
            removeSync(this.path);
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
        addEntry(_entry) {
            copySync(_entry.path, join(this.path, _entry.name));
        }
    }
    DirectoryBrowser.DirectoryEntry = DirectoryEntry;
})(DirectoryBrowser || (DirectoryBrowser = {}));
//# sourceMappingURL=DirectoryEntry.js.map