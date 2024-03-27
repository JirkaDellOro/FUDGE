namespace Fudge {

  export enum MIME {
    TEXT = "text",
    AUDIO = "audio",
    IMAGE = "image",
    MESH = "mesh",
    GLTF = "gltf",
    UNKNOWN = "unknown"
  }

  let mime: Map<MIME, string[]> = new Map([
    [MIME.TEXT, ["ts", "json", "html", "htm", "css", "js", "txt"]],
    [MIME.MESH, ["obj"]],
    [MIME.AUDIO, ["mp3", "wav", "ogg"]],
    [MIME.IMAGE, ["png", "jpg", "jpeg", "tif", "tga", "gif"]],
    [MIME.GLTF, ["gltf", "glb"]]
  ]);

  const { Dirent, renameSync, rmSync, readdirSync, readFileSync, copyFileSync, statSync } = require("fs") as typeof import("fs"); // eslint-disable-line
  type Dirent = import("fs").Dirent;
  // type PathLike = import("fs").PathLike;
  const { basename, dirname, join } = require("path") as typeof import("path");

  export class DirectoryEntry {
    public path: string;
    public pathRelative: string;
    public dirent: Dirent;
    public stats: Object;

    public constructor(_path: string, _pathRelative: string, _dirent: Dirent, _stats: Object){
      this.path = _path;
      this.pathRelative = _pathRelative;
      this.dirent = _dirent;
      this.stats = _stats;
    }

    public static createRoot(_path: string): DirectoryEntry {
      let dirent: Dirent = new Dirent();
      dirent.name = basename(_path);
      dirent.isDirectory = () => true;
      return new DirectoryEntry(_path, "", dirent, null);
    }

    public get name(): string {
      return this.dirent.name;
    }
    public set name(_name: string) {
      let newPath: string = join(dirname(this.path), _name);
      renameSync(this.path, newPath);
      this.path = newPath;
      this.dirent.name = _name;
    }

    public get isDirectory(): boolean {
      return this.dirent.isDirectory();
    }

    public get type(): string {
      return this.isDirectory ? "Directory" : "File";
    }

    public delete(): void {
      rmSync(this.path, { recursive: true });
    }

    public getDirectoryContent(): DirectoryEntry[] {
      let dirents: Dirent[] = readdirSync(this.path, { withFileTypes: true });
      let content: DirectoryEntry[] = [];
      for (let dirent of dirents) {
        let path: string = join(this.path, dirent.name);
        let pathRelative: string = join(this.pathRelative, dirent.name);
        let stats: Object = statSync(path);
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
      copyFileSync(_entry.path, join(this.path, _entry.name));
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