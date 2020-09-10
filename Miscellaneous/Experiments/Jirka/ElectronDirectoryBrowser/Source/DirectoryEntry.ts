///<reference types="../../../../../node_modules/@types/node/fs"/>

namespace DirectoryBrowser {
  import ƒ = FudgeCore;
  const { Dirent, PathLike, renameSync, rmdirSync, unlinkSync, readdirSync } = require("fs");
  const { basename, dirname, join } = require("path");
  // console.log(basename("C:/Hello.txt"));

  export class DirectoryEntry {
    public path: typeof PathLike;
    public dirent: typeof Dirent;

    constructor(_path: typeof PathLike, _dirent: typeof Dirent) {
      this.path = _path;
      this.dirent = _dirent;
    }

    public static createRoot(_path: typeof PathLike): DirectoryEntry {
      let dirent: typeof Dirent = new Dirent();
      dirent.name = basename(<string>_path);
      return new DirectoryEntry(_path, dirent);
    }

    public get name(): string {
      return this.dirent.name;
    }
    public set name(_name: string) {
      renameSync(this.path, dirname(<string>this.path) + _name);
    }

    public get isDirectory(): boolean {
      return this.dirent.isDirectory();
    }
    public get isFile(): boolean {
      return this.dirent.isFile();
    }

    public delete(): void {
      if (this.isDirectory)
        rmdirSync(this.path);
      else
        unlinkSync(this.path);
    }

    public getContent(): DirectoryEntry[] {
      let dirents: (typeof Dirent)[] = readdirSync(this.path, { withFileTypes: true });
      let content: DirectoryEntry[] = [];
      for (let dirent of dirents) {
        let entry: DirectoryEntry = new DirectoryEntry(join(this.path, dirent.name), dirent);
        content.push(entry);
      }
      return content;
    }

    public isDescendantOf(_entry: DirectoryEntry): boolean {
      // TODO: return true if this is contained within entry (Check path)
      return false;
    }

    public addEntry(_entry: DirectoryEntry): boolean {
      // TODO: add file/directory to this, return succes/fail
      return true;
    }
  }
}