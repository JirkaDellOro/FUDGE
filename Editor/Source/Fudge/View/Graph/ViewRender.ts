namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  import ƒAid = FudgeAid;

  /**
   * View the rendering of a graph in a viewport with an independent camera
   * @author Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class ViewRender extends View {
    #pointerMoved: boolean = false;
    private cmrOrbit: ƒAid.CameraOrbit;
    private viewport: ƒ.Viewport;
    private canvas: HTMLCanvasElement;
    private graph: ƒ.Graph;
    private viewGraph: ƒ.Node;

    constructor(_container: ComponentContainer, _state: JsonValue) {
      super(_container, _state);
      this.graph = <ƒ.Graph>ƒ.Project.resources[_state["graph"]];

      this.createUserInterface();

      let title: string = `● Drop a graph from "Internal" here.\n`;
      title += "● Use mousebuttons and ctrl-, shift- or alt-key to navigate view.\n";
      title += "● Click to select node, rightclick to select transformations.\n";
      title += "● Hold X, Y or Z to transform. Add shift-key to invert restriction.\n";
      title += "● Transformation affects selected component.";
      this.dom.title = title;
      this.dom.tabIndex = 0;

      _container.on("resize", this.redraw);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.ANIMATE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.MUTATE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.SELECT, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.DELETE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener("pointermove", this.hndPointer);
      this.dom.addEventListener("pointerdown", this.hndPointer);
    }

    createUserInterface(): void {
      this.viewGraph = new ƒ.Node("ViewGraph");
      let viewNode: ƒ.Node = new ƒ.Node("ViewNode");
      let nodeLight: ƒ.Node = new ƒ.Node("ViewIllumination");
      viewNode.addChild(nodeLight);
      viewNode.addChild(this.viewGraph);
      ƒAid.addStandardLightComponents(nodeLight);

      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      // cmpCamera.pivot.translate(new ƒ.Vector3(3, 2, 1));
      // cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
      cmpCamera.projectCentral(1, 45);
      this.canvas = ƒAid.Canvas.create(true, ƒAid.IMAGE_RENDERING.PIXELATED);
      let container: HTMLDivElement = document.createElement("div");
      container.style.borderWidth = "0px";
      document.body.appendChild(this.canvas);
      // this.dom.append(this.canvas);

      this.viewport = new ƒ.Viewport();
      this.viewport.initialize("ViewNode_Viewport", viewNode, cmpCamera, this.canvas);
      this.cmrOrbit = FudgeAid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false);
      this.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
      // this.viewport.draw();

      this.setGraph(null);

      // this.canvas.addEventListener(ƒUi.EVENT.CLICK, this.activeViewport);
      this.canvas.addEventListener("pointerdown", this.activeViewport);
      this.canvas.addEventListener("pick", this.hndPick);
    }

    public setGraph(_node: ƒ.Graph): void {
      if (!_node) {
        this.graph = undefined;
        this.dom.innerHTML = "Drop a graph here to edit";
        return;
      }
      if (!this.graph) {
        this.dom.innerHTML = "";
        this.dom.appendChild(this.canvas);
      }
      // this.graph.broadcastEvent(new Event(ƒ.EVENT.DISCONNECT_JOINT));
      // ƒ.Physics.cleanup();
      this.graph = _node;
      ƒ.Physics.activeInstance = Page.getPhysics(this.graph);
      ƒ.Physics.cleanup();
      this.graph.broadcastEvent(new Event(ƒ.EVENT.DISCONNECT_JOINT));
      ƒ.Physics.connectJoints();
      this.viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
      // this.viewport.setBranch(this.graph);
      this.viewGraph.removeAllChildren();
      this.viewGraph.appendChild(this.graph);
      this.checkIllumination();
      this.redraw();
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
      }
    }

    protected openContextMenu = (_event: Event): void => {
      if (!this.#pointerMoved)
        this.contextMenu.popup();
      this.#pointerMoved = false;
    }
    //#endregion

    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      _event.dataTransfer.dropEffect = "none";
      // if (this.dom != _event.target)
      //   return;

      if (!(_viewSource instanceof ViewInternal))
        return;

      let source: Object = _viewSource.getDragDropSources()[0];
      if (!(source instanceof ƒ.Graph))
        return;

      _event.dataTransfer.dropEffect = "link";
      _event.preventDefault();
      _event.stopPropagation();
    }

    protected hndDrop(_event: DragEvent, _viewSource: View): void {
      let source: Object = _viewSource.getDragDropSources()[0];
      // this.setGraph(<ƒ.Node>source);
      this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { graph: <ƒ.Graph>source } });
    }

    private checkIllumination(): void {
      let lightsPresent: boolean = false;
      ƒ.Render.prepare(this.graph);
      ƒ.Render.lights.forEach((_array: ƒ.RecycableArray<ƒ.ComponentLight>) => lightsPresent ||= _array.length > 0);
      this.illuminateGraph(!lightsPresent);
      this.setTitle(`${lightsPresent ? "RENDER" : "Render"} | ${this.graph.name}`);
    }

    private illuminateGraph(_on: boolean): void {
      let nodeLight: ƒ.Node = this.viewGraph.getParent().getChildrenByName("ViewIllumination")[0];
      nodeLight.activate(_on);
      this.redraw();
    }

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SELECT:
          let detail: EventDetail = <EventDetail>_event.detail;
          if (detail.node) {
            this.cmrOrbit.mtxLocal.translation = detail.node.mtxWorld.translation;
            ƒ.Render.prepare(this.cmrOrbit);
          } else
            this.setGraph(_event.detail.graph);
          break;
        // break;
        case EVENT_EDITOR.ANIMATE:
          if (_event instanceof FudgeEvent && _event.detail.graph != this.graph) break;
        case ƒUi.EVENT.MUTATE:
        case ƒUi.EVENT.DELETE:
        case EVENT_EDITOR.MODIFY:
          this.checkIllumination();
          this.redraw();
      }
    }

    private hndPick = (_event: FudgeEvent): void => {
      let picked: ƒ.Node = _event.detail.node;

      //TODO: watch out, two selects
      this.dispatch(EVENT_EDITOR.SELECT, {  bubbles: true, detail: { node: picked } });
      this.dom.dispatchEvent(new CustomEvent(ƒUi.EVENT.SELECT, { bubbles: true, detail: { data: picked } }));
    }

    // private animate = (_e: Event) => {
    //   this.viewport.setGraph(this.graph);
    //   if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
    //     this.viewport.draw();
    // }

    private hndPointer = (_event: PointerEvent): void => {
      if (_event.type == "pointerdown") {
        this.#pointerMoved = false;
        return;
      }
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
      this.dispatch(EVENT_EDITOR.TRANSFORM, {  bubbles: true, detail: { transform: data } });
      this.redraw();
    }

    private activeViewport = (_event: MouseEvent): void => {
      ƒ.Physics.activeInstance = Page.getPhysics(this.graph);
      _event.cancelBubble = true;
    }

    private redraw = () => {
      try {
        ƒ.Physics.activeInstance = Page.getPhysics(this.graph);
        this.viewport.draw();
        // ƒ.Physics.connectJoints();
      } catch (_error: unknown) {
        //nop
      }
    }
  }
}
