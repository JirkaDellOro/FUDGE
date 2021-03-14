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

    constructor(_container: GoldenLayout.Container, _state: Object) {
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

      this.fillContent();

      _container.on("resize", this.redraw);
      this.dom.addEventListener(ƒUi.EVENT.SELECT, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.MUTATE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent, true);
      // this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      // this.dom.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
    }

    private static createStandardMaterial(): ƒ.Material {
      let mtrStandard: ƒ.Material = new ƒ.Material("StandardMaterial", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("white")));
      ƒ.Project.deregister(mtrStandard);
      return mtrStandard;
    }

    private static createStandardMesh(): ƒ.Mesh {
      let meshStandard: ƒ.MeshSphere = new ƒ.MeshSphere("Sphere", 6, 5);
      ƒ.Project.deregister(meshStandard);
      return meshStandard;
    }

    // #region  ContextMenu
    // protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
    //   const menu: Electron.Menu = new remote.Menu();
    //   let item: Electron.MenuItem;

    //   item = new remote.MenuItem({ label: "Add Component", submenu: [] });
    //   for (let subItem of ContextMenu.getComponents(_callback))
    //     item.submenu.append(subItem);
    //   menu.append(item);

    //   ContextMenu.appendCopyPaste(menu);
    //   return menu;
    // }

    // protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
    //   ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);

    //   switch (Number(_item.id)) {
    //     case CONTEXTMENU.ADD_COMPONENT:
    //       let iSubclass: number = _item["iSubclass"];
    //       let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
    //       //@ts-ignore
    //       let cmpNew: ƒ.Component = new component();
    //       ƒ.Debug.info(cmpNew.type, cmpNew);

    //       // this.node.addComponent(cmpNew);
    //       this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: this.resource } }));
    //       break;
    //   }
    // }
    //#endregion

    private fillContent(): void {
      this.dom.innerHTML = "";
      if (!this.resource)
        return;

      //@ts-ignore
      let type: string = this.resource.type || "Function";
      if (this.resource instanceof ƒ.Mesh)
        type = "Mesh";

      // console.log(type);
      let graph: ƒ.Node;
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
          graph = this.createStandardGraph();
          graph.addComponent(new ƒ.ComponentMesh(<ƒ.Mesh>this.resource));
          graph.addComponent(new ƒ.ComponentMaterial(ViewPreview.mtrStandard));
          this.redraw();
          break;
        case "Material":
          graph = this.createStandardGraph();
          graph.addComponent(new ƒ.ComponentMesh(ViewPreview.meshStandard));
          graph.addComponent(new ƒ.ComponentMaterial(<ƒ.Material>this.resource));
          this.redraw();
          break;
        case "Graph":
          this.viewport.setBranch(<ƒ.Graph>this.resource);
          this.dom.appendChild(this.viewport.getCanvas());
          this.redraw();
          break;
        case "TextureImage":
          let img: HTMLImageElement = (<ƒ.TextureImage>this.resource).image;
          img.style.border = "1px solid black";
          this.dom.appendChild(img);
          break;
        case "Audio":
          let entry: DirectoryEntry = new DirectoryEntry((<ƒ.Audio>this.resource).path, "", null, null);
          this.dom.appendChild(this.createAudioPreview(entry));
          break;
        default: break;
      }
    }

    private createStandardGraph(): ƒ.Node {
      let graph: ƒ.Node = new ƒ.Node("PreviewScene");
      ƒAid.addStandardLightComponents(graph);
      this.viewport.setBranch(graph);
      this.dom.appendChild(this.viewport.getCanvas());
      return graph;
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
        case ƒUi.EVENT.CHANGE:
        case ƒUi.EVENT.MUTATE:
        case EVENT_EDITOR.UPDATE:
          if (this.resource instanceof ƒ.Audio || this.resource instanceof ƒ.Texture || this.resource instanceof ƒ.Material)
            this.fillContent();
          this.redraw();
          break;
        default:
          if (_event.detail.data instanceof ScriptInfo)
            this.resource = _event.detail.data.script;
          else
            this.resource = _event.detail.data;
          this.resetCamera();
          this.fillContent();
          break;
      }
    }

    private resetCamera(): void {
      this.cmrOrbit.rotationX = -30;
      this.cmrOrbit.rotationY = 30;
      this.cmrOrbit.distance = 3;
      ƒ.Render.prepare(this.cmrOrbit);
    }

    private redraw = () => {
      try {
        this.viewport.draw();
      } catch (_error: unknown) {
        //nop
      }
    }
  }
}