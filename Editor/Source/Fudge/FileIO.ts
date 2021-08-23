namespace Fudge {
  const fs: ƒ.General = require("fs");

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

    // fs.mkdirSync(new URL("Fudge", base));
    fs.mkdirSync(new URL("Fudge/Core", base), {recursive: true});
    fs.mkdirSync(new URL("Fudge/Aid", base), {recursive: true});

    let copies: { [src: string]: string } = {
      "Core/Build/FudgeCore.js": "Fudge/Core/FudgeCore.js",
      "Core/Build/FudgeCore.d.ts": "Fudge/Core/FudgeCore.d.ts",
      "Aid/Build/FudgeAid.js": "Fudge/Aid/FudgeAid.js",
      "Aid/Build/FudgeAid.d.ts": "Fudge/Aid/FudgeAid.d.ts",
    };

    for (let copy in copies) {
     let src: URL = new URL(copy, ƒPath);
     let dest: URL = new URL(copies[copy], base);
     fs.copyFileSync(src, dest);
    }
    


    await loadProject(new URL(project.files.index.filename, project.base));
  }

  export async function saveProject(): Promise<void> {
    if (!project)
      return;

    if (!await project.openDialog())
      return;

    let base: URL = project.base;
    let projectName: string = base.toString().split("/").slice(-2, -1)[0];

    if (project.files.index.overwrite) {
      let html: string = project.getProjectHTML(projectName);
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
  }

  export async function promptLoadProject(): Promise<URL> {
    let filenames: string[] = remote.dialog.showOpenDialogSync(null, {
      title: "Load Project", buttonLabel: "Load Project", properties: ["openFile"],
      filters: [{ name: "HTML-File", extensions: ["html", "htm"] }]
    });
    if (!filenames)
      return null;

    return new URL(filenames[0]);
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

    ƒ.Project.clear();
    project = new Project(_url);

    // project.title = head.querySelector("title").textContent;

    project.files.index.filename = _url.toString().split("/").pop();
    project.files.index.overwrite = false;

    let css: HTMLLinkElement = head.querySelector("link[rel=stylesheet]");
    project.files.style.filename = css.getAttribute("href");
    project.files.style.overwrite = false;

    //TODO: should old scripts be removed from memory first? How?
    const scripts: NodeListOf<HTMLScriptElement> = head.querySelectorAll("script");
    for (let script of scripts) {
      if (script.getAttribute("editor") == "true") {
        let url: string = script.getAttribute("src");
        ƒ.Debug.fudge("Load script: ", url);
        await ƒ.Project.loadScript(new URL(url, _url).toString());
        console.log("ComponentScripts", ƒ.Project.getComponentScripts());
        console.log("Script Namespaces", ƒ.Project.scriptNamespaces);

        project.files.script.filename = url;
        Reflect.set(project.files.script, "include", true);
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

      project.files.internal.filename = resourceFile;
      project.files.internal.overwrite = true;
    }
  }
}