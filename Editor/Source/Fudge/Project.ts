namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;


  export class Project extends ƒ.Mutable {
    // public title: string = "NewProject";
    public base: URL;
    public name: string;

    public fileIndex: string = "index.html";
    public fileInternal: string = "Internal.json";
    public fileScript: string = "Script/Build/Script.js";
    public fileStyles: string = "styles.css";

    #document: Document;
    // private includeAutoViewScript: boolean = true;
    private graphAutoView: string = "";

    public constructor(_base: URL) {
      super();
      this.base = _base;
      this.name = _base.toString().split("/").slice(-2, -1)[0];
      this.fileIndex = _base.toString().split("/").pop() || this.fileIndex;

      ƒ.Project.clear();
    }

    public async openDialog(): Promise<boolean> {
      let promise: Promise<boolean> = ƒui.Dialog.prompt(project, false, "Review project settings", "Adjust settings and press OK", "OK", "Cancel");

      ƒui.Dialog.dom.addEventListener(ƒui.EVENT.CHANGE, this.hndChange);

      if (await promise) {
        let mutator: ƒ.Mutator = ƒui.Controller.getMutator(this, ƒui.Dialog.dom, this.getMutator());
        this.mutate(mutator);
        return true;
      } else
        return false;
    }

    public hndChange = (_event: Event): void => {
      let mutator: ƒ.Mutator = ƒui.Controller.getMutator(this, ƒui.Dialog.dom, this.getMutator());
      console.log(mutator, this);
    }

    public async load(htmlContent: string): Promise<void> {
      ƒ.Physics.activeInstance = new ƒ.Physics();
      const parser: DOMParser = new DOMParser();
      this.#document = parser.parseFromString(htmlContent, "text/html");
      const head: HTMLHeadElement = this.#document.querySelector("head");

      const scripts: NodeListOf<HTMLScriptElement> = head.querySelectorAll("script");
      for (let script of scripts) {
        if (script.getAttribute("editor") == "true") {
          let url: string = script.getAttribute("src");
          ƒ.Debug.fudge("Load script: ", url);
          await ƒ.Project.loadScript(new URL(url, this.base).toString());
          console.log("ComponentScripts", ƒ.Project.getComponentScripts());
          console.log("Script Namespaces", ƒ.Project.scriptNamespaces);
        }
      }

      const resourceLink: HTMLLinkElement = head.querySelector("link[type=resources]");
      let resourceFile: string = resourceLink.getAttribute("src");
      project.fileInternal = resourceFile;
      ƒ.Project.baseURL = this.base;
      let reconstruction: ƒ.Resources = await ƒ.Project.loadResources(new URL(resourceFile, this.base).toString());

      ƒ.Debug.groupCollapsed("Deserialized");
      ƒ.Debug.info(reconstruction);
      ƒ.Debug.groupEnd();

      let settings: HTMLMetaElement = head.querySelector("meta[type=settings]");
      let projectSettings: string = settings?.getAttribute("project");
      projectSettings = projectSettings?.replace(/'/g, "\"");
      project.mutate(JSON.parse(projectSettings || "{}"));
      let panelInfo: string = settings?.getAttribute("panels");
      panelInfo = panelInfo?.replace(/'/g, "\"");
      Page.setPanelInfo(panelInfo || "[]");
      ƒ.Physics.cleanup(); // remove potential rigidbodies
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

    public getProjectHTML(_title: string): string {
      if (!this.#document)
        return this.createProjectHTML(_title);

      this.#document.title = _title;

      let settings: HTMLElement = this.#document.head.querySelector("meta[type=settings]");
      settings.setAttribute("autoview", this.graphAutoView);
      settings.setAttribute("project", this.settingsStringify());
      settings.setAttribute("panels", this.panelsStringify());

      // let autoViewScript: HTMLScriptElement = this.#document.querySelector("script[name=autoView]");
      // if (this.includeAutoViewScript) {
      //   if (!autoViewScript)
      //     this.#document.head.appendChild(this.getAutoViewScript());
      // }
      // else
      //   if (autoViewScript)
      //     this.#document.head.removeChild(autoViewScript);

      return this.stringifyHTML(this.#document);
    }

    public getMutatorAttributeTypes(_mutator: ƒ.Mutator): ƒ.MutatorAttributeTypes {
      let types: ƒ.MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.graphAutoView)
        types.graphAutoView = this.getGraphs();
      return types;
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {
      delete _mutator.base;
      delete _mutator.fileIndex;
      delete _mutator.fileInternal;
      delete _mutator.fileScript;
      delete _mutator.fileStyles;
    }

    private getGraphs(): Object {
      let graphs: ƒ.SerializableResource[] = ƒ.Project.getResourcesByType(ƒ.Graph);
      let result: Object = {};
      for (let graph of graphs) {
        result[graph.name] = graph.idResource;
      }
      return result;
    }

    private createProjectHTML(_title: string): string {
      let html: Document = document.implementation.createHTMLDocument(_title);

      html.head.appendChild(createTag("meta", { charset: "utf-8" }));
      html.head.appendChild(createTag("link", { rel: "stylesheet", href: this.fileStyles }));
      html.head.appendChild(html.createComment("CRLF"));

      html.head.appendChild(html.createComment("Editor settings of this project"));
      html.head.appendChild(createTag("meta", {
        type: "settings", autoview: this.graphAutoView, project: this.settingsStringify(), panels: this.panelsStringify()
      }));
      html.head.appendChild(html.createComment("CRLF"));

      html.head.appendChild(html.createComment("Activate the following line to include the FUDGE-version of Oimo-Physics. You may want to download a local copy to work offline and be independent from future changes!"));
      html.head.appendChild(html.createComment(`<script type="text/javascript" src="https://jirkadelloro.github.io/FUDGE/Physics/OimoPhysics.js"></script>`));
      html.head.appendChild(html.createComment("CRLF"));

      html.head.appendChild(html.createComment("Load FUDGE. You may want to download local copies to work offline and be independent from future changes! Developers working on FUDGE itself may want to create symlinks"));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "https://jirkadelloro.github.io/FUDGE/Core/Build/FudgeCore.js" }));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "https://jirkadelloro.github.io/FUDGE/Aid/Build/FudgeAid.js" }));
      html.head.appendChild(html.createComment("CRLF"));

      html.head.appendChild(html.createComment("Link internal resources. The editor only loads the first, but at runtime, multiple files can contribute"));
      html.head.appendChild(createTag("link", { type: "resources", src: this.fileInternal }));
      html.head.appendChild(html.createComment("CRLF"));

      html.head.appendChild(html.createComment("Load custom scripts"));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: this.fileScript, editor: "true" }));
      html.head.appendChild(html.createComment("CRLF"));

      // if (this.includeAutoViewScript)
      //   html.head.appendChild(this.getAutoViewScript());
      html.head.appendChild(html.createComment("Load Autoview script"));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "Autoview.js" }));
      html.head.appendChild(html.createComment("CRLF"));

      html.body.appendChild(html.createComment("Dialog shown at startup only"));
      let dialog: HTMLElement = createTag("dialog");
      dialog.appendChild(createTag("p", {}, "FUDGE Autoview"));
      dialog.appendChild(createTag("h1", {}, "Title (will be replaced by Autoview)"));
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

      return this.stringifyHTML(html);
    }

    // private getAutoViewScript(): HTMLScriptElement {
    //   let code: string;
    //   code = (function (_graphId: string): void {
    //     /**
    //      * AutoView-Script
    //      * Loads and displays the selected graph and implements a basic orbit camera
    //      * @author Jirka Dell'Oro-Friedl, HFU, 2021
    //      */

    //     window.addEventListener("load", init);

    //     // show dialog for startup
    //     let dialog: HTMLDialogElement;
    //     function init(_event: Event): void {
    //       dialog = document.querySelector("dialog");
    //       dialog.querySelector("h1").textContent = document.title;
    //       dialog.addEventListener("click", function (_event: Event): void {
    //         // @ts-ign re until HTMLDialog is implemented by all browsers and available in dom.d.ts
    //         dialog.close();
    //         startInteractiveViewport();
    //       });
    //       //@ts-ignore
    //       dialog.showModal();
    //     }

    //     // setup and start interactive viewport
    //     async function startInteractiveViewport(): Promise<void> {
    //       // load resources referenced in the link-tag
    //       await FudgeCore.Project.loadResourcesFromHTML();
    //       FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);

    //       // pick the graph to show
    //       let graph: ƒ.Graph = <ƒ.Graph>FudgeCore.Project.resources[_graphId];
    //       FudgeCore.Debug.log("Graph:", graph);
    //       if (!graph) {
    //         alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
    //         return;
    //       }

    //       // setup the viewport
    //       let cmpCamera: ƒ.ComponentCamera = new FudgeCore.ComponentCamera();
    //       let canvas: HTMLCanvasElement = document.querySelector("canvas");
    //       let viewport: ƒ.Viewport = new FudgeCore.Viewport();
    //       viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    //       FudgeCore.Debug.log("Viewport:", viewport);

    //       // hide the cursor when interacting, also suppressing right-click menu
    //       canvas.addEventListener("mousedown", canvas.requestPointerLock);
    //       canvas.addEventListener("mouseup", function (): void { document.exitPointerLock(); });

    //       // make the camera interactive (complex method in FudgeAid)
    //       let cameraOrbit: FudgeAid.CameraOrbit = FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);

    //       // setup audio
    //       let cmpListener: ƒ.ComponentAudioListener = new ƒ.ComponentAudioListener();
    //       cmpCamera.node.addComponent(cmpListener);
    //       FudgeCore.AudioManager.default.listenWith(cmpListener);
    //       FudgeCore.AudioManager.default.listenTo(graph);
    //       FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);

    //       // draw viewport once for immediate feedback
    //       FudgeCore.Render.prepare(cameraOrbit);
    //       viewport.draw();
    //       canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    //     }
    //   }).toString();

    //   code = "(" + code + `)(document.head.querySelector("meta[autoView]").getAttribute("autoView"));\n`;
    //   let script: HTMLScriptElement = document.createElement("script");
    //   script.setAttribute("name", "autoView");
    //   script.textContent = code;
    //   return script;
    // }

    private settingsStringify(): string {
      let settings: string = JSON.stringify(project.getMutator());
      settings = settings.replace(/"/g, "'");
      return settings;
    }

    private panelsStringify(): string {
      let panels: string = Page.getPanelInfo();
      panels = panels.replace(/"/g, "'");
      return panels;
    }

    private stringifyHTML(_html: Document): string {
      let result: string = (new XMLSerializer()).serializeToString(_html);
      result = result.replace(/></g, ">\n<");
      result = result.replace(/<!--CRLF-->/g, "");
      result = result.replace(/">\n<\/script/g, `"></script`);
      return result;
    }
  }
}

