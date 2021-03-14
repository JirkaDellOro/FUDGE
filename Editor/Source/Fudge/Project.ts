namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

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
    public title: string = "NewProject";
    private includePhysics: boolean = false;
    private includeAutoViewScript: boolean = true;
    private graphToStartWith: string = "";

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

      content += "html, body {\n  padding: 0px;\n  margin: 0px;\n  width: 100%;\n  height: 100%;\n overflow: hidden;\n}\n\n";
      content += "dialog { \n  text-align: center; \n}\n\n";
      content += "canvas.fullscreen { \n  width: 100vw; \n  height: 100vh; \n}";

      return content;
    }

    public getProjectHTML(): string {
      let html: Document = document.implementation.createHTMLDocument(this.title);

      html.head.appendChild(createTag("meta", { charset: "utf-8" }));

      html.head.appendChild(html.createComment("Load FUDGE"));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Core/Build/FudgeCore.js" }));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Aid/Build/FudgeAid.js" }));

      html.head.appendChild(html.createComment("Link stylesheet and internal resources"));
      html.head.appendChild(createTag("link", { rel: "stylesheet", href: this.files.style.filename }));
      html.head.appendChild(createTag("link", { type: "resources", src: this.files.internal.filename }));

      if (Reflect.get(this.files.script, "include")) {
        html.head.appendChild(html.createComment("Load custom scripts"));
        html.head.appendChild(createTag("script", { type: "text/javascript", src: this.files.script.filename, editor: "true" }));
      }

      if (this.includeAutoViewScript) {
        html.head.appendChild(html.createComment("Auto-View"));
        html.head.appendChild(this.getAutoViewScript(this.graphToStartWith));
      }

      html.body.appendChild(html.createComment("Dialog shown at startup only"));
      let dialog: HTMLElement = createTag("dialog");
      dialog.appendChild(createTag("h1", {}, this.title));
      dialog.appendChild(createTag("p", {}, "click to start"));
      html.body.appendChild(dialog);

      html.body.appendChild(html.createComment("Canvas for FUDGE to render to"));
      html.body.appendChild(createTag("canvas", { class: "fullscreen" }));

      function createTag(_tag: string, _attributes: { [key: string]: string } = {}, _content?: string): HTMLElement {
        let element: HTMLElement = document.createElement(_tag);
        for (let attribute in _attributes)
          element.setAttribute(attribute, _attributes[attribute]);
        if (_content)
          element.innerHTML = _content;
        return element;
      }

      let result: string = (new XMLSerializer()).serializeToString(html);
      result = result.replace(/></g, ">\n<");
      // result = result.replaceAll("><", ">\n<");
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
        window.addEventListener("load", init);

        // show dialog for startup
        let dialog: HTMLDialogElement;
        function init(_event: Event): void {
          dialog = document.querySelector("dialog");
          dialog.addEventListener("click", function (_event: Event): void {
            dialog.close();
            startInteractiveViewport();
          });
          dialog.showModal();
        }

        // setup and start interactive viewport
        async function startInteractiveViewport(): Promise<void> {
          // load resources referenced in the link-tag
          await FudgeCore.Project.loadResourcesFromHTML();
          FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);

          // pick the graph to show
          let graph: ƒ.Graph = <ƒ.Graph>FudgeCore.Project.resources[_graphId];
          FudgeCore.Debug.log("Graph:", graph);

          // setup the viewport
          let cmpCamera: ƒ.ComponentCamera = new FudgeCore.ComponentCamera();
          let canvas: HTMLCanvasElement = document.querySelector("canvas");
          let viewport: ƒ.Viewport = new FudgeCore.Viewport();
          viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
          FudgeCore.Debug.log("Viewport:", viewport);

          // hide the cursor when interacting, also suppressing right-click menu
          canvas.addEventListener("mousedown", canvas.requestPointerLock);
          canvas.addEventListener("mouseup", function (): void { document.exitPointerLock(); });

          // make the camera interactive (complex method in FudgeAid)
          FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);

          // setup audio
          let cmpListener: ƒ.ComponentAudioListener = new ƒ.ComponentAudioListener();
          cmpCamera.getContainer().addComponent(cmpListener);
          FudgeCore.AudioManager.default.listenWith(cmpListener);
          FudgeCore.AudioManager.default.listenTo(graph);
          FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);

          // draw viewport once for immediate feedback
          viewport.draw();
          canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {bubbles: true, detail: viewport}));
        }
      }).toString();

      code = "(" + code + `)("${_graphId}");\n`;
      let script: HTMLScriptElement = document.createElement("script");
      script.textContent = code;
      return script;
    }
  }
}