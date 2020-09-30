namespace Fudge {
  const fs: ƒ.General = require("fs");

  export function saveProject(_node: ƒ.Node): void {
    let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_node);
    let content: string = ƒ.Serializer.stringify(serialization);

    // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
    let filename: string = remote.dialog.showSaveDialogSync(null, { title: "Save Graph", buttonLabel: "Save Graph", message: "ƒ-Message" });

    fs.writeFileSync(filename, content);
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
    const head: HTMLHeadElement = dom.getElementsByTagName("head")[0];
    console.log(head);

    ƒ.Project.clear();

    //TODO: should old scripts be removed from memory first? How?
    const scripts: NodeListOf<HTMLScriptElement> = head.querySelectorAll("script");
    for (let script of scripts) {
      if (script.getAttribute("editor") == "true") {
        let url: string = script.getAttribute("src");
        await ƒ.Project.loadScript(new URL(url, _url).toString());
        console.log("ComponentScripts", ƒ.Project.getComponentScripts());  
        console.log("Script Namespaces", ƒ.Project.scriptNamespaces);  
      }
    }

    // TODO: support multiple resourcefiles
    const resourceFile: string = head.querySelector("link").getAttribute("src");
    ƒ.Project.baseURL = _url;
    let reconstruction: ƒ.Resources = await ƒ.Project.loadResources(new URL(resourceFile, _url).toString());

    ƒ.Debug.groupCollapsed("Deserialized");
    ƒ.Debug.info(reconstruction);
    ƒ.Debug.groupEnd();

    // TODO: this is a hack to get first NodeResource to display -> move all to project view
    // for (let id in reconstruction) {
    //   if (id.startsWith("Node"))
    //     return <ƒ.NodeResource>reconstruction[id];
    // }
  }
}