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
    public script: string = "NewProject.js";

    constructor() {
      super();
    }
    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }

  export class Project extends ƒ.Mutable {
    public files: Files = new Files();
    private title: string = "NewProject";
    private includePhysics: boolean = false;
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

    public getProjectHTML(): string {
      let html: Document = document.implementation.createHTMLDocument(this.title);

      html.head.appendChild(createTag("meta", { charset: "utf-8" }));
      
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Core/Build/FudgeCore.js" }));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Aid/Build/FudgeAid.js" }));
      
      html.head.appendChild(createTag("link", { rel: "stylesheet", href: this.files.style.filename }));
      html.head.appendChild(createTag("link", { type: "resources", src: this.files.internal.filename }));
      
      html.head.appendChild(createTag("script", { type: "text/javascript", src: this.files.script, editor: "true" }));

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

      return (new XMLSerializer()).serializeToString(html);
    }

    public getGraphs(): Object {
      let result: Object = {
        Ball: "ball",
        Triangle: "triangle",
        Xyz: "xyz"
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
  }
}