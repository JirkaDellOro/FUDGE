namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  import ƒAid = FudgeAid;

  /**
   * Preview a resource
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewPreview extends View {
    private static mtrStandard: ƒ.Material = ViewPreview.createStandardMaterial();
    private static meshStandard: ƒ.Mesh = ViewPreview.createStandardMesh();
    private resource: ƒ.SerializableResource | DirectoryEntry | Function;
    private viewport: ƒ.Viewport;
    private cmrOrbit: ƒAid.CameraOrbit;
    private previewNode: ƒ.Node;

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);

      // create viewport for 3D-resources
      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      // cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 1));
      // cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
      cmpCamera.projectCentral(1, 45);
      let canvas: HTMLCanvasElement = ƒAid.Canvas.create(true, ƒAid.IMAGE_RENDERING.PIXELATED);
      this.viewport = new ƒ.Viewport();
      this.viewport.initialize("Preview", null, cmpCamera, canvas);
      this.cmrOrbit = ƒAid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false);
      this.previewNode = this.createStandardGraph();

      this.fillContent();

      _container.on("resize", this.redraw);
      this.dom.addEventListener(ƒUi.EVENT.SELECT, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.MUTATE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent, true);
      // this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.CONTEXTMENU, this.openContextMenu);
      // this.dom.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
    }

    private static createStandardMaterial(): ƒ.Material {
      let mtrStandard: ƒ.Material = new ƒ.Material("StandardMaterial", ƒ.ShaderFlat, new ƒ.CoatRemissive(ƒ.Color.CSS("white")));
      ƒ.Project.deregister(mtrStandard);
      return mtrStandard;
    }

    private static createStandardMesh(): ƒ.Mesh {
      let meshStandard: ƒ.MeshSphere = new ƒ.MeshSphere("Sphere", 20, 12);
      ƒ.Project.deregister(meshStandard);
      return meshStandard;
    }

    // #region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      // item = new remote.MenuItem({ label: "Illuminate Graph", id: CONTEXTMENU[CONTEXTMENU.ILLUMINATE], checked: true, type: "checkbox", click: _callback });
      // menu.append(item);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${_item.id}`);

      switch (_item.id) {
        // case CONTEXTMENU[CONTEXTMENU.ILLUMINATE]:
        //   this.illuminateGraph();
        //   break;
      }
    }

    //#endregion

    private fillContent(): void {
      this.dom.innerHTML = "";
      if (!this.resource) {
        this.dom.innerHTML = "Select an internal or external resource to preview";
        this.setTitle("Preview");
        return;
      }

      let lightsPresent: boolean = true;

      //@ts-ignore
      let type: string = this.resource.type || "Function";
      if (this.resource instanceof ƒ.Mesh)
        type = "Mesh";

      // console.log(type);
      let previewObject: ƒ.Node = new ƒ.Node("PreviewObject");
      let preview: HTMLElement;
      switch (type) {
        case "Function":
          preview = this.createScriptPreview(<Function>this.resource);
          if (preview)
            this.dom.appendChild(preview);
          break;
        case "File":
          preview = this.createFilePreview(<DirectoryEntry>this.resource);
          if (preview)
            this.dom.appendChild(preview);
          break;
        case "Mesh":
          previewObject.addComponent(new ƒ.ComponentMesh(<ƒ.Mesh>this.resource));
          previewObject.addComponent(new ƒ.ComponentMaterial(ViewPreview.mtrStandard));
          this.setViewObject(previewObject);
          this.resetCamera();
          this.redraw();
          break;
        case "Material":
          previewObject.addComponent(new ƒ.ComponentMesh(ViewPreview.meshStandard));
          previewObject.addComponent(new ƒ.ComponentMaterial(<ƒ.Material>this.resource));
          this.setViewObject(previewObject);
          this.resetCamera();
          this.redraw();
          break;
        case "Graph":
          ƒ.Project.createGraphInstance(<ƒ.Graph>this.resource).then(
            (_instance: ƒ.GraphInstance) => {
              previewObject.appendChild(_instance);
              ƒ.Render.prepare(_instance);
              lightsPresent = false;
              ƒ.Render.lights.forEach((_array: ƒ.RecycableArray<ƒ.ComponentLight>) => lightsPresent ||= _array.length > 0);
              this.illuminate(!lightsPresent);
              this.setTitle(`${lightsPresent ? "PREVIEW" : "Preview"} | ${this.resource.name}`);
              this.redraw();
            }
          );
          ƒ.Physics.activeInstance = Page.getPhysics(<ƒ.Graph>this.resource);
          this.setViewObject(previewObject);
          previewObject.addEventListener(ƒ.EVENT.MUTATE, (_event: Event) => {
            this.redraw();
          });
          this.redraw();
          break;
        case "TextureImage":
          let img: HTMLImageElement = (<ƒ.TextureImage>this.resource).image;
          img.style.border = "1px solid black";
          this.dom.appendChild(img);
          break;
        case "AnimationSprite":
          let imgSprite: HTMLImageElement = (<ƒ.TextureImage>(<ƒ.AnimationSprite>this.resource).texture).image;
          imgSprite.style.border = "1px solid black";
          this.dom.appendChild(imgSprite);
          break;
        case "Audio":
          let entry: DirectoryEntry = new DirectoryEntry((<ƒ.Audio>this.resource).path, "", null, null);
          this.dom.appendChild(this.createAudioPreview(entry));
          break;
        default: break;
      }

      this.setTitle(`Preview | ${this.resource.name}`);
    }

    private createStandardGraph(): ƒ.Node {
      let graph: ƒ.Node = new ƒ.Node("PreviewScene");
      this.viewport.setBranch(graph);

      let nodeLight: ƒ.Node = new ƒ.Node("PreviewIllumination");
      graph.addChild(nodeLight);
      ƒAid.addStandardLightComponents(nodeLight);

      this.dom.appendChild(this.viewport.canvas);

      let previewNode: ƒ.Node = new ƒ.Node("PreviewNode");
      graph.addChild(previewNode);
      return previewNode;
    }

    private setViewObject(_node: ƒ.Node, _graphIllumination: boolean = false): void {
      this.previewNode.removeAllChildren();
      this.previewNode.addChild(_node);
      this.illuminate(true);
      this.dom.appendChild(this.viewport.canvas);
    }

    private illuminate(_on: boolean): void {
      let nodeLight: ƒ.Node = this.viewport.getBranch()?.getChildrenByName("PreviewIllumination")[0];
      nodeLight.activate(_on);
      this.redraw();
    }

    private createFilePreview(_entry: DirectoryEntry): HTMLElement {
      let mime: MIME = _entry.getMimeType();
      switch (mime) {
        case MIME.TEXT: return this.createTextPreview(_entry);
        case MIME.AUDIO: return this.createAudioPreview(_entry);
        case MIME.IMAGE: return this.createImagePreview(_entry);
      }
      return null;
    }

    private createTextPreview(_entry: DirectoryEntry): HTMLElement {
      let pre: HTMLPreElement = document.createElement("pre");
      pre.textContent = _entry.getFileContent();
      return pre;
    }
    private createImagePreview(_entry: DirectoryEntry): HTMLElement {
      let img: HTMLImageElement = document.createElement("img");
      img.src = _entry.path;
      img.style.border = "1px solid black";
      return img;
    }
    private createAudioPreview(_entry: DirectoryEntry): HTMLElement {
      let audio: HTMLAudioElement = document.createElement("audio");
      audio.src = _entry.path;
      audio.play();
      audio.controls = true;
      return audio;
    }
    private createScriptPreview(_script: Function): HTMLElement {
      let pre: HTMLPreElement = document.createElement("pre");
      let code: string = _script.toString();
      code = code.replaceAll("    ", " ");
      pre.textContent = code;
      return pre;
    }

    private hndEvent = (_event: CustomEvent): void => {
      // console.log(_event.type);
      switch (_event.type) {
        // case EVENT_EDITOR.SET_PROJECT:
        //   this.resource = undefined;
        //   break;
        case ƒUi.EVENT.CHANGE:
        case EVENT_EDITOR.MODIFY:
          if (this.resource instanceof ƒ.Audio ||
            this.resource instanceof ƒ.Texture ||
            this.resource instanceof ƒ.AnimationSprite) /*  || this.resource instanceof ƒ.Material */)
          this.fillContent();
        case ƒUi.EVENT.MUTATE:
          this.redraw();
          break;
        default:
          if (!_event.detail)
            this.resource = undefined;
          else if (_event.detail.data instanceof ScriptInfo)
            this.resource = _event.detail.data.script;
          else
            this.resource = _event.detail.data;

          this.fillContent();
          break;
      }
    }

    private resetCamera(): void {
      let branch: ƒ.Node = this.viewport.getBranch();
      ƒ.Render.prepare(branch);
      let r: number = branch.radius;

      this.cmrOrbit.mtxLocal.translation = ƒ.Vector3.ZERO();
      ƒ.Render.prepare(this.cmrOrbit);
      this.cmrOrbit.rotationX = -30;
      this.cmrOrbit.rotationY = 30;
      this.cmrOrbit.distance = r * 3;
      ƒ.Render.prepare(this.cmrOrbit);
    }

    private redraw = () => {
      try {
        if (this.resource instanceof ƒ.Graph)
          ƒ.Physics.activeInstance = Page.getPhysics(this.resource);
        this.viewport.draw();
      } catch (_error: unknown) {
        //nop
      }
    }
  }
}