namespace Fudge {
  const fs: ƒ.General = require("fs");
  import ƒui = FudgeUserInterface;
  export let watcher: ƒ.General;

  interface CopyList {
    [src: string]: string;
  }

  export async function newProject(): Promise<void> {
    let filename: string | string[] = remote.dialog.showOpenDialogSync(null, {
      properties: ["openDirectory", "createDirectory"], title: "Select/Create a folder to save the project to. The foldername becomes the name of your project", buttonLabel: "Save Project"
    });

    if (!filename)
      return;

    let base: URL = new URL(new URL("file://" + filename[0]).toString() + "/");
    console.log("Path", base.toString());

    project = new Project(base);

    await saveProject(true);

    let ƒPath: URL = new URL("../../", location.href);
    console.log(ƒPath);

    fs.copyFileSync(new URL("Editor/Source/Template/.gitignore.txt", ƒPath), new URL(".gitignore", base));
    fs.mkdirSync(new URL("Script/Source", base), { recursive: true });
    fs.mkdirSync(new URL("Script/Source/@types", base), { recursive: true });
    fs.mkdirSync(new URL("Script/Build", base), { recursive: true });

    let copyTemplates: CopyList = {
      "CustomComponentScript.txt": "Source/CustomComponentScript.ts",
      "Main.txt": "Source/Main.ts",
      "tsconfig.txt": "Source/tsconfig.json",
      "Script.txt": " Build/Script.js",
      "Autoview.js": "../Autoview.js"
    };
    copyFiles(copyTemplates, new URL("Editor/Source/Template/", ƒPath), new URL("Script/", base));

    let definition: Response = await fetch("https://JirkaDellOro.github.io/FUDGE/Core/Build/FudgeCore.d.ts");
    fs.writeFileSync(new URL("Script/Source/@types/FudgeCore.d.ts", base), await definition.text());

    await loadProject(new URL(project.fileIndex, project.base));
  }

  function copyFiles(_list: CopyList, _srcPath: URL, _destPath: URL): void {
    for (let copy in _list) {
      let src: URL = new URL(copy, _srcPath);
      let dest: URL = new URL(_list[copy], _destPath);
      fs.copyFileSync(src, dest);
    }
  }

  export async function saveProject(_new: boolean = false): Promise<boolean> {
    if (!project)
      return false;

    if (!await project.openDialog())
      return false;

    unwatchFolder();

    let base: URL = project.base;

    if (_new) {
      let cssFileName: URL = new URL(project.fileStyles, base);
      fs.writeFileSync(cssFileName, project.getProjectCSS());
    }

    let html: string = project.getProjectHTML(project.name);
    let htmlFileName: URL = new URL(project.fileIndex, base);
    fs.writeFileSync(htmlFileName, html);

    let jsonFileName: URL = new URL(project.fileInternal, base);
    fs.writeFileSync(jsonFileName, project.getProjectJSON());

    watchFolder();
    return true;
  }

  export async function promptLoadProject(): Promise<URL> {
    let filenames: string[] = remote.dialog.showOpenDialogSync(null, {
      title: "Load Project", buttonLabel: "Load Project", properties: ["openFile"],
      filters: [{ name: "HTML-File", extensions: ["html", "htm"] }]
    });
    if (!filenames)
      return null;
    return new URL("file://" + filenames[0]);
  }

  export async function loadProject(_url: URL): Promise<void> {
    let htmlContent: string = fs.readFileSync(_url, { encoding: "utf-8" });
    ƒ.Debug.groupCollapsed("File content");
    ƒ.Debug.info(htmlContent);
    ƒ.Debug.groupEnd();

    unwatchFolder();

    project = new Project(_url);
    await project.load(htmlContent);

    watchFolder();
  }

  function watchFolder(): void {
    let dir: URL = new URL(".", project.base);
    watcher = fs.watch(dir, { recursive: true }, hndFileChange);

    async function hndFileChange(_event: string, _url: URL): Promise<void> {
      let filename: string = _url.toString();
      if (filename == project.fileIndex || filename == project.fileInternal || filename == project.fileScript) {
        unwatchFolder();
        let promise: Promise<boolean> = ƒui.Dialog.prompt(null, false, "Important file change", "Reload project?", "Reload", "Cancel");
        if (await promise) {
          await loadProject(project.base);
        } else
          watcher = fs.watch(dir, { recursive: true }, hndFileChange);
        document.dispatchEvent(new Event(EVENT_EDITOR.MODIFY));
      }
    }
  }


  function unwatchFolder(): void {
    if (!watcher)
      return;
    watcher.unref();
    watcher.close();
  }
}

