// /<reference types="../../../node_modules/@types/node/fs"/>

namespace Fudge {
  const fs: ƒ.General = require("fs");
  const { Dirent, PathLike, renameSync, removeSync, readdirSync, copyFileSync, copySync } = require("fs");
  const { basename, dirname, join } = require("path");

  export class DirectoryEntry {
    public path: typeof fs.PathLike;
    public dirent: typeof fs.Dirent;
    public stats: Object;

    constructor(_path: typeof fs.PathLike, _dirent: typeof fs.Dirent, _stats: Object) {
      this.path = _path;
      this.dirent = _dirent;
      this.stats = _stats;
    }

    public static createRoot(_path: typeof fs.PathLike): DirectoryEntry {
      let dirent: typeof Dirent = new Dirent();
      dirent.name = basename(<string>_path);
      dirent.isRoot = true;
      return new DirectoryEntry(_path, dirent, null);
    }

    public get name(): string {
      return this.dirent.name;
    }
    public set name(_name: string) {
      let newPath: typeof PathLike = join(dirname(this.path), _name);
      renameSync(this.path, newPath);
      this.path = newPath;
      this.dirent.name = _name;
    }

    public get isDirectory(): boolean {
      return this.dirent.isDirectory() || this.dirent.isRoot;
    }

    public delete(): void {
      removeSync(this.path);
    }

    public getContent(): DirectoryEntry[] {
      let dirents: (typeof Dirent)[] = readdirSync(this.path, { withFileTypes: true });
      let content: DirectoryEntry[] = [];
      for (let dirent of dirents) {
        let path: string = join(this.path, dirent.name);
        let stats: Object = fs.statSync(path);
        let entry: DirectoryEntry = new DirectoryEntry(path, dirent, stats);
        content.push(entry);
      }
      return content;
    }

    public addEntry(_entry: DirectoryEntry): void {
      copySync(_entry.path, join(this.path, _entry.name));
    }
  }
}