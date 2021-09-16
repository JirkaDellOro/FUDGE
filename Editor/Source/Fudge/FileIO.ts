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

    let base: URL = new URL(new URL(filename[0]).toString() + "/");
    console.log("Path", base.toString());

    project = new Project(base);

    await saveProject();

    let ƒPath: URL = new URL("../../", location.href);
    console.log(ƒPath);

    // Rather use online links...
    // fs.mkdirSync(new URL("Fudge/Core", base), { recursive: true });
    // fs.mkdirSync(new URL("Fudge/Aid", base), { recursive: true });

    // let copyFudge: CopyList = {
    //   "Core/Build/FudgeCore.js": "Fudge/Core/FudgeCore.js",
    //   "Core/Build/FudgeCore.d.ts": "Fudge/Core/FudgeCore.d.ts",
    //   "Aid/Build/FudgeAid.js": "Fudge/Aid/FudgeAid.js",
    //   "Aid/Build/FudgeAid.d.ts": "Fudge/Aid/FudgeAid.d.ts"
    // };
    // copyFiles(copyFudge, ƒPath, base);

    fs.copyFileSync(new URL("Editor/Source/Template/.gitignore.txt", ƒPath), new URL(".gitignore", base));
    fs.mkdirSync(new URL("Script/Source", base), { recursive: true });
    fs.mkdirSync(new URL("Script/Source/@types", base), { recursive: true });
    fs.mkdirSync(new URL("Script/Build", base), { recursive: true });

    let copyTemplates: CopyList = {
      "CustomComponentScript.txt": "Source/CustomComponentScript.ts",
      "Main.txt": "Source/Main.ts",
      "tsconfig.txt": "Source/tsconfig.json",
      "Script.txt": " Build/Script.js"
    };
    copyFiles(copyTemplates, new URL("Editor/Source/Template/", ƒPath), new URL("Script/", base));

    let definition: Response = await fetch("https://JirkaDellOro.github.io/FUDGE/Core/Build/FudgeCore.d.ts");
    fs.writeFileSync(new URL("Script/Source/@types/FudgeCore.d.ts", base), await definition.text());

    await loadProject(new URL(project.files.index.filename, project.base));
  }

  function copyFiles(_list: CopyList, _srcPath: URL, _destPath: URL): void {
    for (let copy in _list) {
      let src: URL = new URL(copy, _srcPath);
      let dest: URL = new URL(_list[copy], _destPath);
      fs.copyFileSync(src, dest);
    }
  }

  export async function saveProject(): Promise<void> {
    if (!project)
      return;

    if (!await project.openDialog())
      return;

    let base: URL = project.base;
    if (watcher)
      watcher.close();

    if (project.files.index.overwrite) {
      let html: string = project.getProjectHTML(project.name);
      let htmlFileName: URL = new URL(project.files.index.filename, base);
      fs.writeFileSync(htmlFileName, html);
    }

    if (project.files.style.overwrite) {
      let cssFileName: URL = new URL(project.files.style.filename, base);
      fs.writeFileSync(cssFileName, project.getProjectCSS());
    }

    if (project.files.internal.overwrite) {
      let jsonFileName: URL = new URL(project.files.internal.filename, base);
      fs.writeFileSync(jsonFileName, project.getProjectJSON());
    }

    watchFolder();
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
    let content: string = fs.readFileSync(_url, { encoding: "utf-8" });
    ƒ.Debug.groupCollapsed("File content");
    ƒ.Debug.info(content);
    ƒ.Debug.groupEnd();

    const parser: DOMParser = new DOMParser();
    const dom: Document = parser.parseFromString(content, "application/xhtml+xml");
    const head: HTMLHeadElement = dom.querySelector("head");
    console.log(head);
    if (watcher)
      watcher.close();

    ƒ.Project.clear();
    project = new Project(_url);

    let settings: string = head.querySelectorAll("link[type=settings]")[0].getAttribute("content");
    settings = settings.replace(/'/g, "\"");
    project.mutate(JSON.parse(settings));

    //TODO: should old scripts be removed from memory first? How?
    const scripts: NodeListOf<HTMLScriptElement> = head.querySelectorAll("script");
    for (let script of scripts) {
      if (script.getAttribute("editor") == "true") {
        let url: string = script.getAttribute("src");
        ƒ.Debug.fudge("Load script: ", url);
        await ƒ.Project.loadScript(new URL(url, _url).toString());
        console.log("ComponentScripts", ƒ.Project.getComponentScripts());
        console.log("Script Namespaces", ƒ.Project.scriptNamespaces);
      }
    }

    const resourceLinks: NodeListOf<HTMLLinkElement> = head.querySelectorAll("link[type=resources]");
    for (let resourceLink of resourceLinks) {
      let resourceFile: string = resourceLink.getAttribute("src");
      ƒ.Project.baseURL = _url;
      let reconstruction: ƒ.Resources = await ƒ.Project.loadResources(new URL(resourceFile, _url).toString());

      ƒ.Debug.groupCollapsed("Deserialized");
      ƒ.Debug.info(reconstruction);
      ƒ.Debug.groupEnd();
    }

    watchFolder();
  }

  function watchFolder(): void {
    let dir: URL = new URL(".", project.base);
    watcher = fs.watch(dir, { recursive: true }, hndFileChange);

    async function hndFileChange(_event: string, _url: URL): Promise<void> {
      let filename: string = _url.toString();
      if (filename == project.files.index.filename || filename == project.files.internal.filename || filename == project.files.script.filename) {
        watcher.close();
        let promise: Promise<boolean> = ƒui.Dialog.prompt(null, false, "Important file change", "Reload project?", "Reload", "Cancel");
        if (await promise) {
          await loadProject(project.base);
        } else
          watcher = fs.watch(dir, { recursive: true }, hndFileChange);
        document.dispatchEvent(new Event(EVENT_EDITOR.UPDATE));
      }
    }
  }
}

