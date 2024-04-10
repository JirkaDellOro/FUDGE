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

  const fs: typeof import("fs") = require("fs");
  const p: typeof import("path") = require("path");
  type Dirent = import("fs").Dirent;

  export class DirectoryEntry {
    public path: string;
    public pathRelative: string;
    public dirent: Dirent;
    public stats: Object;

    public constructor(_path: string, _pathRelative: string, _dirent: Dirent, _stats: Object) {
      this.path = p.normalize(_path);
      this.pathRelative = p.normalize(_pathRelative);
      this.dirent = _dirent;
      this.stats = _stats;
    }

    public static createRoot(_path: string): DirectoryEntry {
      let dirent: Dirent = new fs.Dirent();
      dirent.name = p.basename(_path);
      dirent.isDirectory = () => true;
      return new DirectoryEntry(_path, "", dirent, null);
    }

    public get name(): string {
      return this.dirent.name;
    }
    public set name(_name: string) {
      let newPath: string = p.join(p.dirname(this.path), _name);
      if (fs.existsSync(newPath))
        throw new Error(`There is already a file with the specified name '${_name}'. Specify a different name.`);
      fs.renameSync(this.path, newPath);
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
      fs.rmSync(this.path, { recursive: true });
    }

    public getDirectoryContent(): DirectoryEntry[] {
      let dirents: Dirent[] = fs.readdirSync(this.path, { withFileTypes: true });
      let content: DirectoryEntry[] = [];
      for (let dirent of dirents) {
        let path: string = p.join(this.path, dirent.name);
        let pathRelative: string = p.join(this.pathRelative, dirent.name);
        let stats: Object = fs.statSync(path);
        let entry: DirectoryEntry = new DirectoryEntry(path, pathRelative, dirent, stats);
        content.push(entry);
      }
      return content;
    }

    public getFileContent(): string {
      let content: string = fs.readFileSync(this.path, "utf8");
      return content;
    }

    public addEntry(_entry: DirectoryEntry): void {
      fs.copyFileSync(_entry.path, p.join(this.path, _entry.name), fs.constants.COPYFILE_EXCL);
    }

    public getMimeType(): MIME {
      let extension: string = this.name.split(".").pop();
      for (let type of mime) {
        if (type[1].indexOf(extension) > -1)
          return type[0];
      }
      return MIME.UNKNOWN;
    }

    /**
     * Returns a path of DirectoryEntries starting at the root and ending at this DirectoryEntry. 
     * The entries in the returned path ONLY have their relative path set. This is solely used for display purposes in {@link ViewExternal}s tree.
     */
    public getPath(): DirectoryEntry[] {
      let trace: DirectoryEntry[] = [];
      let currentPath: string = this.pathRelative;
      while (currentPath != trace[trace.length - 1]?.pathRelative) {
        trace.push(new DirectoryEntry("", currentPath, null, null));
        currentPath = p.dirname(currentPath);
      };
      trace.reverse();
      return trace;
    }
  }
}