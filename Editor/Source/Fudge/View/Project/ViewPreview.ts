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
    private mtxImage: ƒ.Matrix3x3 = ƒ.Matrix3x3.IDENTITY();
    private timeoutDefer: number;

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
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener("wheel", this.hndMouse);
      this.dom.addEventListener("mousemove", this.hndMouse);
    }

    private hndMouse = (_event: WheelEvent) => {
      let div: HTMLDivElement = this.dom.querySelector("div#image");
      if (!div)
        return;
      _event.preventDefault();
      switch (_event.type) {
        case "mousemove":
          if (_event.buttons != 2)
            return;
          this.mtxImage.translateX(_event.movementX)
          this.mtxImage.translateY(_event.movementY)
          break;
        case "wheel":
          let offset: ƒ.Vector2 = new ƒ.Vector2(
            _event.offsetX - this.dom.clientWidth, _event.offsetY - this.dom.clientHeight / 2)
          let zoom: number = Math.exp(-_event.deltaY / 1000)
          // console.log(offset.toString());
          this.mtxImage.scaleX(zoom);
          this.mtxImage.scaleY(zoom);
          offset.scale(zoom - 1);
          this.mtxImage.translateX(-offset.x)
          this.mtxImage.translateY(-offset.y)
          break;
      }
      this.setTransform(div);
    }

    private setTransform(_div: HTMLDivElement): void {
      let transform: Float32Array = this.mtxImage.get();
      transform = transform.copyWithin(5, 6);
      transform = transform.copyWithin(2, 3);
      _div.style.transform = `matrix(${transform.slice(0, 6).join()})`;
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
            this.defer(() => this.dispatch(EVENT_EDITOR.UPDATE, { bubbles: true }));
          });
          this.redraw();
          break;
        case "TextureImage":
        case "AnimationSprite":
          let div: HTMLDivElement = document.createElement("div");
          div.id = "image"
          let img: HTMLImageElement;
          if (type == "TextureImage") {
            img = (<ƒ.TextureImage>this.resource).image;
            div.appendChild(img);
          } else {
            let animationSprite: ƒ.AnimationSprite = <ƒ.AnimationSprite>this.resource;
            img = (<ƒ.TextureImage>animationSprite.texture).image;
            div.appendChild(img);
            let positions: ƒ.Vector2[] = animationSprite.getPositions();
            let mutator: ƒ.Mutator = animationSprite.getMutator();
            for (let position of positions) {
              let rect: HTMLSpanElement = document.createElement("span");
              rect.className = "rectSprite";
              rect.style.left = position.x + 1 + "px";
              rect.style.top = position.y + 1 + "px";
              rect.style.width = mutator.size.x - 2 + "px";
              rect.style.height = mutator.size.y - 2 + "px";
              div.appendChild(rect);
            }
          }
          this.dom.appendChild(div);
          this.setTransform(div);
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
      switch (_event.type) {
        case EVENT_EDITOR.MODIFY:
        case EVENT_EDITOR.UPDATE:
          // if ([ƒ.Audio, ƒ.Texture, ƒ.AnimationSprite].some((_type) => this.resource instanceof _type)) {
          if (this.resource instanceof ƒ.Audio ||
            this.resource instanceof ƒ.Texture ||
            this.resource instanceof ƒ.AnimationSprite)
            this.fillContent();
          this.redraw();
          break;
        default:
          if (!_event.detail)
            this.resource = undefined;
          else if (_event.detail.data instanceof ScriptInfo)
            this.resource = _event.detail.data.script;
          else
            this.resource = _event.detail.data;

          this.mtxImage.reset();
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

    private defer(_function: Function): void {
      if (this.timeoutDefer)
        return;
      this.timeoutDefer = window.setTimeout(() => {
        _function();
        this.timeoutDefer = undefined;
      }, 100);
    }
  }
}