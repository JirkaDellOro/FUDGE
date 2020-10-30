namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  enum PROJECT {
    OPT1 = "option1",
    OPT2 = "option2",
    OPT3 = "option3"
  }

  class FileInfo extends ƒ.Mutable {
    overwrite: boolean;
    filename: string;
    constructor(_overwrite: boolean, _filename: string) {
      super();
      this.overwrite = _overwrite;
      this.filename = _filename;
    }
    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }

  export class Files extends ƒ.Mutable {
    public index: FileInfo = new FileInfo(true, "");
    public style: FileInfo = new FileInfo(true, "");
    public internal: FileInfo = new FileInfo(true, "");
    public script: FileInfo = new FileInfo(true, "");

    constructor() {
      super();
      Reflect.deleteProperty(this.script, "overwrite");
      Reflect.set(this.script, "include", false);
      this.script.filename = "?.js";
    }
    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }

  export class Project extends ƒ.Mutable {
    public files: Files = new Files();
    private title: string = "NewProject";
    private includePhysics: boolean = false;
    private includeAutoViewScript: boolean = true;
    private graphToStartWith: string = "";
    // private option: PROJECT = PROJECT.OPT3;

    public constructor() {
      super();
      this.updateFilenames("NewProject", true, this);
    }

    public async openDialog(): Promise<boolean> {
      let promise: Promise<boolean> = ƒui.Dialog.prompt(project, false, "Review project settings", "Adjust settings and press OK", "OK", "Cancel");

      ƒui.Dialog.dom.addEventListener(ƒui.EVENT.CHANGE, this.hndChange);
      if (await promise) {
        console.log("OK");
        let mutator: ƒ.Mutator = ƒui.Controller.getMutator(this, ƒui.Dialog.dom, this.getMutator());
        this.mutate(mutator);
        return true;
      } else
        return false;
    }

    public hndChange = (_event: Event): void => {
      let mutator: ƒ.Mutator = ƒui.Controller.getMutator(this, ƒui.Dialog.dom, this.getMutator());
      console.log(mutator, this);
      if (mutator.title != this.title) {
        this.updateFilenames(mutator.title, false, mutator);
        ƒui.Controller.updateUserInterface(this, ƒui.Dialog.dom, mutator);
      }
    }

    public getProjectJSON(): string {
      let serialization: ƒ.SerializationOfResources = ƒ.Project.serialize();
      let json: string = ƒ.Serializer.stringify(serialization);
      return json;
    }

    public getProjectCSS(): string {
      let content: string = "";

      content += "html, body {\n  padding: 0px;\n  margin: 0px;\n  width: 100%;\n  height: 100%;\n overflow: auto;\n}\n\n";
      content += "canvas.fullscreen { \n  width: 100vw; \n  height: 100vh; \n}";

      return content;
    }

    public getProjectHTML(): string {
      let html: Document = document.implementation.createHTMLDocument(this.title);

      html.head.appendChild(createTag("meta", { charset: "utf-8" }));

      html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Core/Build/FudgeCore.js" }));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Aid/Build/FudgeAid.js" }));

      html.head.appendChild(createTag("link", { rel: "stylesheet", href: this.files.style.filename }));
      html.head.appendChild(createTag("link", { type: "resources", src: this.files.internal.filename }));

      if (Reflect.get(this.files.script, "include"))
        html.head.appendChild(createTag("script", { type: "text/javascript", src: this.files.script.filename, editor: "true" }));

      if (this.includeAutoViewScript)
        html.head.appendChild(this.getAutoViewScript(this.graphToStartWith));

      html.body.appendChild(createTag("h1", {}, this.title));
      html.body.appendChild(createTag("p", {}, "click to start"));
      html.body.appendChild(createTag("hr"));
      html.body.appendChild(createTag("canvas"));

      function createTag(_tag: string, _attributes: { [key: string]: string } = {}, _content?: string): HTMLElement {
        let element: HTMLElement = document.createElement(_tag);
        for (let attribute in _attributes)
          element.setAttribute(attribute, _attributes[attribute]);
        if (_content)
          element.innerHTML = _content;
        return element;
      }

      let result: string = (new XMLSerializer()).serializeToString(html);
      result = result.replaceAll("><", ">\n<");
      return result;
    }

    public getGraphs(): Object {
      let graphs: ƒ.Resources = ƒ.Project.getResourcesOfType(ƒ.Graph);
      let result: Object = {};
      for (let id in graphs) {
        let graph: ƒ.Graph = <ƒ.Graph>graphs[id];
        result[graph.name] = id;
      }
      return result;
    }

    public getMutatorAttributeTypes(_mutator: ƒ.Mutator): ƒ.MutatorAttributeTypes {
      let types: ƒ.MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.option)
        types.option = PROJECT;
      if (types.graphToStartWith)
        types.graphToStartWith = this.getGraphs();
      return types;
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }

    private updateFilenames(_title: string, _all: boolean = false, _mutator: ƒ.Mutator): void {
      let files: { [key: string]: FileInfo } = { html: _mutator.files.index, css: _mutator.files.style, json: _mutator.files.internal };
      for (let key in files) {
        let fileInfo: FileInfo = files[key];
        fileInfo.overwrite = _all || fileInfo.overwrite;
        if (fileInfo.overwrite)
          fileInfo.filename = _title + "." + key;
      }
    }

    private getAutoViewScript(_graphId: string): HTMLScriptElement {
      let code: string;
      code = (function (_graphId: string): void {
        window.addEventListener("click", startInteractiveViewport);

        async function startInteractiveViewport(_event: Event): Promise<void> {
          window.removeEventListener("click", startInteractiveViewport);
          await FudgeCore.Project.loadResourcesFromHTML();

          let graph: ƒ.Graph = <ƒ.Graph>FudgeCore.Project.resources[_graphId];
          FudgeAid.Viewport.createInteractive(graph, document.querySelector("canvas"));
        }
      }).toString();

      code = "(" + code + `)("${_graphId}");\n`;
      let script: HTMLScriptElement = document.createElement("script");
      script.textContent = code;
      return script;
    }
  }
}