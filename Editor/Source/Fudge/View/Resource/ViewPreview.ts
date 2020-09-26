namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒaid = FudgeAid;

  /**
   * Preview a resource
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewPreview extends View {
    private static mtrStandard: ƒ.Material = ViewPreview.createStandardMaterial();
    private static meshStandard: ƒ.Mesh = ViewPreview.createStandardMesh();
    private resource: ƒ.SerializableResource | DirectoryEntry;
    private viewport: ƒ.Viewport;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      // create viewport for 3D-resources
      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 1));
      cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
      cmpCamera.projectCentral(1, 45);
      let canvas: HTMLCanvasElement = ƒaid.Canvas.create(true, ƒaid.IMAGE_RENDERING.PIXELATED);
      this.viewport = new ƒ.Viewport();
      this.viewport.initialize("Preview", null, cmpCamera, canvas);

      this.fillContent();

      _container.on("resize", this.redraw);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener(ƒui.EVENT.SELECT, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.UPDATE, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      // this.dom.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
    }

    private static createStandardMaterial(): ƒ.Material {
      let mtrStandard: ƒ.Material = new ƒ.Material("StandardMaterial", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("white")));
      ƒ.Project.deregister(mtrStandard);
      return mtrStandard;
    }

    private static createStandardMesh(): ƒ.Mesh {
      let meshStandard: ƒ.MeshSphere = new ƒ.MeshSphere(6, 5);
      ƒ.Project.deregister(meshStandard);
      return meshStandard;
    }

    //#region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Add Component", submenu: [] });
      for (let subItem of ContextMenu.getComponents(_callback))
        item.submenu.append(subItem);
      menu.append(item);

      ContextMenu.appendCopyPaste(menu);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);

      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_COMPONENT:
          let iSubclass: number = _item["iSubclass"];
          let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
          //@ts-ignore
          let cmpNew: ƒ.Component = new component();
          ƒ.Debug.info(cmpNew.type, cmpNew);

          // this.node.addComponent(cmpNew);
          this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: this.resource } }));
          break;
      }
    }
    //#endregion

    private fillContent(): void {
      this.dom.innerHTML = "";
      if (!this.resource)
        return;

      let type: string = this.resource.type;
      if (this.resource instanceof ƒ.Mesh)
        type = "Mesh";

      // console.log(type);
      let graph: ƒ.Node;
      switch (type) {
        case "File":
          let extension: string = this.resource.name.split(".").pop();
          if (["ts", "json", "html", "htm", "css", "js", "txt"].indexOf(extension) > -1) {
            this.dom.appendChild(this.createTextPreview(<DirectoryEntry>this.resource));
          }
          break;
        case "Mesh":
          graph = this.createStandardGraph();
          graph.addComponent(new ƒ.ComponentMesh(<ƒ.Mesh>this.resource));
          graph.addComponent(new ƒ.ComponentMaterial(ViewPreview.mtrStandard));
          this.viewport.draw();
          break;
        case "Material":
          graph = this.createStandardGraph();
          graph.addComponent(new ƒ.ComponentMesh(ViewPreview.meshStandard));
          graph.addComponent(new ƒ.ComponentMaterial(<ƒ.Material>this.resource));
          this.viewport.draw();
          break;
        case "Graph":
          this.viewport.setGraph(<ƒ.NodeResource>this.resource);
          this.dom.appendChild(this.viewport.getCanvas());
          this.viewport.draw();
          break;
        default: break;
      }
    }

    private createStandardGraph(): ƒ.Node {
      let graph: ƒ.Node = new ƒ.Node("PreviewScene");
      ƒaid.addStandardLightComponents(graph);
      this.viewport.setGraph(graph);
      this.dom.appendChild(this.viewport.getCanvas());
      return graph;
    }

    private createTextPreview(_resource: DirectoryEntry): HTMLPreElement {
      let pre: HTMLPreElement = document.createElement("pre");
      pre.textContent = _resource.getFileContent();
      return pre;
    }

    private hndEvent = (_event: CustomEvent): void => {
      // console.log(_event.type);
      switch (_event.type) {
        case ƒui.EVENT.UPDATE:
          this.redraw();
          break;
        default:
          this.resource = _event.detail.data;
          this.fillContent();
          break;
      }
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