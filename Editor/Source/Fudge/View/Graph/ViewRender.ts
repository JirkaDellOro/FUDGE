namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  import ƒAid = FudgeAid;

  /**
   * View the rendering of a graph in a viewport with an independent camera
   * @author Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class ViewRender extends View {
    private cmrOrbit: ƒAid.CameraOrbit;
    private viewport: ƒ.Viewport;
    private canvas: HTMLCanvasElement;
    private graph: ƒ.Graph;
    private node: ƒ.Node;
    private nodeLight: ƒ.Node = new ƒ.Node("Illumination"); // keeps light components for dark graphs
    private redrawId: number;
    #pointerMoved: boolean = false;

    public constructor(_container: ComponentContainer, _state: ViewState) {
      super(_container, _state);

      this.createUserInterface();

      let title: string = "● Drop a graph from \"Internal\" here.\n";
      title += "● Use mousebuttons and ctrl-, shift- or alt-key to navigate editor camera.\n";
      title += "● Drop camera component here to see through that camera.\n";
      title += "● Manipulate transformations in this view:\n";
      title += "  - Click to select node, rightclick to select transformations.\n";
      title += "  - Select component to manipulate in view Components.\n";
      title += "  - Hold X, Y or Z and move mouse to transform. Add shift-key to invert restriction.\n";
      this.dom.title = title;
      this.dom.tabIndex = 0;

      _container.on("resize", this.redraw);
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.CLOSE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener("pointermove", this.hndPointer);
      this.dom.addEventListener("mousedown", () => this.#pointerMoved = false); // reset pointer move
    }

    //#region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Translate", id: TRANSFORM.TRANSLATE, click: _callback, accelerator: process.platform == "darwin" ? "T" : "T" });
      menu.append(item);
      item = new remote.MenuItem({ label: "Rotate", id: TRANSFORM.ROTATE, click: _callback, accelerator: process.platform == "darwin" ? "R" : "R" });
      menu.append(item);
      item = new remote.MenuItem({ label: "Scale", id: TRANSFORM.SCALE, click: _callback, accelerator: process.platform == "darwin" ? "E" : "E" });
      menu.append(item);
      item = new remote.MenuItem({
        label: "Physics Debug", submenu: [
          { "label": "None", id: String(ƒ.PHYSICS_DEBUGMODE[0]), click: _callback },
          { "label": "Colliders", id: String(ƒ.PHYSICS_DEBUGMODE[1]), click: _callback },
          { "label": "Colliders and Joints (Default)", id: String(ƒ.PHYSICS_DEBUGMODE[2]), click: _callback },
          { "label": "Bounding Boxes", id: String(ƒ.PHYSICS_DEBUGMODE[3]), click: _callback },
          { "label": "Contacts", id: String(ƒ.PHYSICS_DEBUGMODE[4]), click: _callback },
          { "label": "Only Physics", id: String(ƒ.PHYSICS_DEBUGMODE[5]), click: _callback }
        ]
      });
      menu.append(item);

      item = new remote.MenuItem({ label: "Orthographic Camera", id: String(CONTEXTMENU.ORTHGRAPHIC_CAMERA), type: "checkbox", click: _callback, accelerator: process.platform == "darwin" ? "O" : "O" });
      menu.append(item);

      item = new remote.MenuItem({ label: "Render Continuously", id: String(CONTEXTMENU.RENDER_CONTINUOUSLY), type: "checkbox", click: _callback });
      menu.append(item);

      let submenu: Electron.MenuItemConstructorOptions[] = [];
      for (const [filter] of ƒ.Gizmos.filter)
        submenu.push({ label: filter, id: filter, type: "checkbox", click: _callback });

      item = new remote.MenuItem({
        label: "Gizmos", submenu: submenu
      });
      menu.append(item);

      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${_item.id}`);

      switch (_item.id) {
        case TRANSFORM.TRANSLATE:
        case TRANSFORM.ROTATE:
        case TRANSFORM.SCALE:
          Page.setTransform(_item.id);
          break;
        case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.NONE]:
        case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.COLLIDERS]:
        case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER]:
        case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.BOUNDING_BOXES]:
        case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.CONTACTS]:
        case ƒ.PHYSICS_DEBUGMODE[ƒ.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY]:
          this.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE[_item.id];
          this.redraw();
          break;
        case String(CONTEXTMENU.ORTHGRAPHIC_CAMERA):
          this.setCameraOrthographic(_item.checked);
          break;
        case String(CONTEXTMENU.RENDER_CONTINUOUSLY):
          this.setRenderContinously(_item.checked);
          break;
        default:
          if (!ƒ.Gizmos.filter.has(_item.id))
            break;

          ƒ.Gizmos.filter.set(_item.id, _item.checked);
          this.redraw();
          break;
      }
    }

    protected openContextMenu = (_event: Event): void => {
      if (!this.#pointerMoved) {
        for (const [filter, active] of ƒ.Gizmos.filter)
          this.contextMenu.getMenuItemById(filter).checked = active;
        this.contextMenu.popup();
      }
      this.#pointerMoved = false;
    };
    //#endregion

    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      _event.dataTransfer.dropEffect = "none";

      if (!(_viewSource instanceof ViewComponents)) { // allow dropping cameracomponent to see through that camera (at this time, the only draggable)
        if (!(_viewSource instanceof ViewInternal)) // allow dropping a graph
          return;

        let source: Object = _viewSource.getDragDropSources()[0];
        if (!(source instanceof ƒ.Graph))
          return;
      }

      _event.dataTransfer.dropEffect = "link";
      _event.preventDefault();
      _event.stopPropagation();
    }

    protected hndDrop(_event: DragEvent, _viewSource: View): void {
      let source: Object = _viewSource.getDragDropSources()[0];
      if (source instanceof ƒ.ComponentCamera) {
        // this.setCameraOrthographic(false);
        this.viewport.camera = source;
        this.redraw();
        _event.stopPropagation();
        return;
      }
    }

    private createUserInterface(): void {
      ƒAid.addStandardLightComponents(this.nodeLight);

      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      this.canvas = ƒAid.Canvas.create(true, ƒAid.IMAGE_RENDERING.PIXELATED);
      let container: HTMLDivElement = document.createElement("div");
      container.style.borderWidth = "0px";
      document.body.appendChild(this.canvas);

      this.viewport = new ƒ.Viewport();
      this.viewport.renderingGizmos = true;
      this.viewport.initialize("ViewNode_Viewport", this.graph, cmpCamera, this.canvas);
      try {
        this.cmrOrbit = FudgeAid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false);
      } catch (_error: unknown) { /* view should load even if rendering fails... */ };
      this.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
      this.viewport.addEventListener(ƒ.EVENT.RENDER_PREPARE_START, this.hndPrepare);
      this.viewport.addEventListener(ƒ.EVENT.RENDER_END, this.drawTranslation);
      this.viewport.addEventListener(ƒ.EVENT.RENDER_END, this.drawMesh);

      this.setGraph(null);

      this.canvas.addEventListener("pointerdown", this.activeViewport);
      this.canvas.addEventListener("pick", this.hndPick);
    }

    private setGraph(_node: ƒ.Graph): void {
      if (!_node) {
        this.graph = undefined;
        this.dom.innerHTML = "Drop a graph here to edit";
        return;
      }
      if (!this.graph) {
        this.dom.innerHTML = "";
        this.dom.appendChild(this.canvas);
      }

      this.graph = _node;

      ƒ.Physics.activeInstance = Page.getPhysics(this.graph);
      ƒ.Physics.cleanup();
      this.graph.broadcastEvent(new Event(ƒ.EVENT.DISCONNECT_JOINT));
      ƒ.Physics.connectJoints();
      this.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
      this.viewport.setBranch(this.graph);
      this.viewport.camera = this.cmrOrbit.cmpCamera;
      ƒ.Render.prepare(this.graph);
    }

    private setCameraOrthographic(_on: boolean = false): void {
      this.viewport.camera = this.cmrOrbit.cmpCamera;
      if (_on) {
        this.cmrOrbit.cmpCamera.projectCentral(2, 1, ƒ.FIELD_OF_VIEW.DIAGONAL, 10, 20000);
        this.cmrOrbit.maxDistance = 10000;
        this.cmrOrbit.distance *= 50;
      } else {
        this.cmrOrbit.cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL, 0.01, 1000);
        this.cmrOrbit.maxDistance = 1000;
        this.cmrOrbit.distance /= 50;
      }
      this.contextMenu.getMenuItemById(String(CONTEXTMENU.ORTHGRAPHIC_CAMERA)).checked = _on;
      ƒ.Render.prepare(this.cmrOrbit);
      this.redraw();
    }

    private hndPrepare = (_event: Event): void => {
      let switchLight: EventListener = (_event: Event): void => {
        let lightsPresent: boolean = false;
        ƒ.Render.lights.forEach((_array: ƒ.RecycableArray<ƒ.ComponentLight>) => lightsPresent ||= _array.length > 0);
        this.setTitle(`${lightsPresent ? "RENDER" : "Render"} | ${this.graph.name}`);
        if (!lightsPresent)
          ƒ.Render.addLights(this.nodeLight.getComponents(ƒ.ComponentLight));
        this.graph.removeEventListener(ƒ.EVENT.RENDER_PREPARE_END, switchLight);
      };
      this.graph.addEventListener(ƒ.EVENT.RENDER_PREPARE_END, switchLight);
    };

    private hndEvent = (_event: EditorEvent): void => {
      let detail: EventDetail = <EventDetail>_event.detail;
      switch (_event.type) {
        case EVENT_EDITOR.SELECT:
          if (detail.graph) {
            this.setGraph(detail.graph);
            this.dispatch(EVENT_EDITOR.FOCUS, { bubbles: false, detail: { node: detail.node || this.graph } });
          }
          if (detail.node) {
            this.node = detail.node;
            ƒ.Gizmos.selected = this.node;
          }
          break;
        case EVENT_EDITOR.FOCUS:
          this.cmrOrbit.mtxLocal.translation = detail.node.mtxWorld.translation;
          ƒ.Render.prepare(this.cmrOrbit);
          break;
        case EVENT_EDITOR.CLOSE:
          this.setRenderContinously(false);
          this.viewport.removeEventListener(ƒ.EVENT.RENDER_END, this.drawTranslation);
          this.viewport.removeEventListener(ƒ.EVENT.RENDER_END, this.drawMesh);
          ƒ.Gizmos.selected = null;
          break;
        case EVENT_EDITOR.UPDATE:
          if (!this.viewport.camera.isActive)
            this.viewport.camera = this.cmrOrbit.cmpCamera;
      }
      this.redraw();
    };

    private hndPick = (_event: EditorEvent): void => {
      let picked: ƒ.Node = _event.detail.node;

      //TODO: watch out, two selects
      this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { node: picked } });
      // this.dom.dispatchEvent(new CustomEvent(ƒUi.EVENT.SELECT, { bubbles: true, detail: { data: picked } }));
    };

    // private animate = (_e: Event) => {
    //   this.viewport.setGraph(this.graph);
    //   if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
    //     this.viewport.draw();
    // }

    private hndPointer = (_event: PointerEvent): void => {
      this.#pointerMoved ||= (_event.movementX != 0 || _event.movementY != 0);

      this.dom.focus({ preventScroll: true });
      let restriction: string;
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.X]))
        restriction = "x";
      else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.Y]))
        restriction = "z";
      else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.Z]))
        restriction = "y";

      if (!restriction)
        return;

      this.canvas.requestPointerLock();
      let data: Object = {
        transform: Page.modeTransform, restriction: restriction, x: _event.movementX, y: _event.movementY, camera: this.viewport.camera, inverted: _event.shiftKey
      };
      this.dispatchToParent(EVENT_EDITOR.TRANSFORM, { bubbles: true, detail: { transform: data } });
      this.dispatchToParent(EVENT_EDITOR.UPDATE, {});
      this.redraw();
    };

    private activeViewport = (_event: MouseEvent): void => {
      ƒ.Physics.activeInstance = Page.getPhysics(this.graph);
      _event.cancelBubble = true;
    };

    private redraw = (): void => {
      if (this.viewport.canvas.clientHeight == 0 || this.viewport.canvas.clientHeight == 0)
        return;
      try {
        ƒ.Physics.activeInstance = Page.getPhysics(this.graph);
        ƒ.Physics.connectJoints();
        this.viewport.draw();
      } catch (_error: unknown) {
        this.setRenderContinously(false);
        // console.error(_error);
        //nop
      }
    };

    private setRenderContinously(_on: boolean): void {
      if (_on) {
        this.redrawId = window.setInterval(() => {
          this.redraw();
        }, 1000 / 30);
      } else {
        window.clearInterval(this.redrawId);
        this.redrawId = null;
      }
      this.contextMenu.getMenuItemById(String(CONTEXTMENU.RENDER_CONTINUOUSLY)).checked = _on;
    }

    private drawTranslation = (): void => {
      if (!this.node || !ƒ.Gizmos.filter.get(GIZMOS.TRANSFORM))
        return;

      const scaling: ƒ.Vector3 = ƒ.Vector3.ONE(ƒ.Vector3.DIFFERENCE(ƒ.Gizmos.camera.mtxWorld.translation, this.node.mtxWorld.translation).magnitude * 0.1);
      const origin: ƒ.Vector3 = ƒ.Vector3.ZERO();
      const vctX: ƒ.Vector3 = ƒ.Vector3.X(1);
      const vctY: ƒ.Vector3 = ƒ.Vector3.Y(1);
      const vctZ: ƒ.Vector3 = ƒ.Vector3.Z(1);
      let mtxWorld: ƒ.Matrix4x4 = this.node.mtxWorld.clone;
      mtxWorld.scaling = scaling;
      let color: ƒ.Color = ƒ.Color.CSS("red");
      ƒ.Gizmos.drawLines([origin, vctX], mtxWorld, color);
      color.setCSS("lime");
      ƒ.Gizmos.drawLines([origin, vctY], mtxWorld, color);
      color.setCSS("blue");
      ƒ.Gizmos.drawLines([origin, vctZ], mtxWorld, color);

      ƒ.Recycler.storeMultiple(vctX, vctY, vctZ, origin, mtxWorld, color, scaling);
    };

    private drawMesh = (): void => {
      const cmpMesh: ƒ.ComponentMesh = this.node?.getComponent(ƒ.ComponentMesh);
      if (!cmpMesh?.mesh || !ƒ.Gizmos.filter.get(GIZMOS.WIRE_MESH))
        return;

      ƒ.Gizmos.drawWireMesh(cmpMesh.mesh, cmpMesh.mtxWorld, ƒ.Color.CSS("salmon"), 0.1);
    };
  }
}