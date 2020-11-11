// /<reference types="../../../node_modules/@types/node/fs"/>

namespace Fudge {

  export enum MIME {
    TEXT = "text",
    AUDIO = "audio",
    IMAGE = "image",
    UNKNOWN = "unknown"
  }

  let mime: Map<MIME, string[]> = new Map([
    [MIME.TEXT, ["ts", "json", "html", "htm", "css", "js", "txt"]],
    [MIME.AUDIO, ["mp3", "wav", "ogg"]],
    [MIME.IMAGE, ["png", "jpg", "jpeg", "tif", "tga", "gif"]]
  ]);

  const fs: ƒ.General = require("fs");
  const { Dirent, PathLike, renameSync, removeSync, readdirSync, readFileSync, copySync } = require("fs");
  const { basename, dirname, join } = require("path");

  export class DirectoryEntry {
    public path: typeof fs.PathLike;
    public pathRelative: typeof fs.PathLike;
    public dirent: typeof fs.Dirent;
    public stats: Object;

    constructor(_path: typeof fs.PathLike, _pathRelative: typeof fs.PathLike, _dirent: typeof fs.Dirent, _stats: Object) {
      this.path = _path;
      this.pathRelative = _pathRelative;
      this.dirent = _dirent;
      this.stats = _stats;
    }

    public static createRoot(_path: typeof fs.PathLike): DirectoryEntry {
      let dirent: typeof Dirent = new Dirent();
      dirent.name = basename(<string>_path);
      dirent.isRoot = true;
      return new DirectoryEntry(_path, "", dirent, null);
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

    public get type(): string {
      return this.isDirectory ? "Directory" : "File";
    }

    public delete(): void {
      removeSync(this.path);
    }

    public getDirectoryContent(): DirectoryEntry[] {
      let dirents: (typeof Dirent)[] = readdirSync(this.path, { withFileTypes: true });
      let content: DirectoryEntry[] = [];
      for (let dirent of dirents) {
        let path: string = join(this.path, dirent.name);
        let pathRelative: string = join(this.pathRelative, dirent.name);
        let stats: Object = fs.statSync(path);
        let entry: DirectoryEntry = new DirectoryEntry(path, pathRelative, dirent, stats);
        content.push(entry);
      }
      return content;
    }

    public getFileContent(): string {
      let content: string = readFileSync(this.path, "utf8");
      return content;
    }

    public addEntry(_entry: DirectoryEntry): void {
      copySync(_entry.path, join(this.path, _entry.name));
    }

    public getMimeType(): MIME {
      let extension: string = this.name.split(".").pop();
      for (let type of mime) {
        if (type[1].indexOf(extension) > -1)
          return type[0];
      }
      return MIME.UNKNOWN;
    }
  }
}