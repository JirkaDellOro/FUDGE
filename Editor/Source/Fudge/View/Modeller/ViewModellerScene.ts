namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒaid = FudgeAid;

  export class ViewModellerScene extends View {
    viewport: ƒ.Viewport;
    canvas: HTMLCanvasElement;
    graph: ƒ.Node;
    controller: Controller;
    node: ƒ.Node;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.graph = <ƒ.Node><unknown>_state["node"];
      this.createUserInterface();
      ƒaid.addStandardLightComponents(this.graph, new ƒ.Color(0.5, 0.5, 0.5));
      this.graph.addChild(new ƒaid.NodeCoordinateSystem("WorldCooSys"));
      this.node = this.graph.getChildrenByName("Default")[0];
      this.controller = new Controller(this.viewport, this.node);
      // tslint:disable-next-line: no-unused-expression
      new CameraControl(this.viewport);
      // this.dom.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
      this.viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, this.onmove);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);

      this.viewport.addEventListener(ƒ.EVENT_POINTER.UP, this.onmouseup);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.UP, true);

      this.viewport.addEventListener(ƒ.EVENT_POINTER.DOWN, this.onmousedown);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.DOWN, true);

      this.viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, this.handleKeyboard);
      this.viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);
      this.viewport.setFocus(true);

      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
    }

    createUserInterface(): void {
      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      cmpCamera.pivot.translate(new ƒ.Vector3(3, 2, 1));
      cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
      cmpCamera.projectCentral(1, 45);
      //new ƒaid.CameraOrbit(cmpCamera);
      //cmpCamera.pivot.rotateX(90);

      this.canvas = ƒaid.Canvas.create(true, ƒaid.IMAGE_RENDERING.PIXELATED);
      let container: HTMLDivElement = document.createElement("div");
      container.style.borderWidth = "0px";
      document.body.appendChild(this.canvas);

      this.viewport = new ƒ.Viewport();
      this.viewport.initialize("Viewport", this.graph, cmpCamera, this.canvas);
      // ƒaid.Viewport.expandCameraToInteractiveOrbit(this.viewport);
      this.viewport.draw();

      this.dom.append(this.canvas);

      ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
    } 

    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      let submenu: Electron.Menu = new remote.Menu();
      // submenu.append(new remote.MenuItem({label: "Object"}));

      // item = new remote.MenuItem({
      //   label: "Control Mode",
      //   submenu: ContextMenu.getSubclassMenu<typeof AbstractControlMode>(CONTEXTMENU.CONTROL_MODE, AbstractControlMode.subclasses, _callback)
      // });

      if (!this.controller) {
        return menu;
      }

      for (let mode of this.controller.controlModes.keys()) {
        let subitem: Electron.MenuItem = new remote.MenuItem(
          { label: mode, id: String(CONTEXTMENU.CONTROL_MODE), click: _callback, accelerator: process.platform == "darwin" ? "Command+" + this.controller.controlModes.get(mode).shortcut : "ctrl+" + this.controller.controlModes.get(mode).shortcut}
        );
        //@ts-ignore
        subitem.overrideProperty("controlMode", mode);
        submenu.append(subitem);
      }
      item = new remote.MenuItem({
        label: "Control Mode",
        submenu: submenu
      });
      menu.append(item);


      submenu = new remote.Menu();

      // TODO: fix tight coupling here, only retrieve the shortcut from the controller
      for (let mode in this.controller.controlMode.modes) {
        let subitem: Electron.MenuItem = new remote.MenuItem(
          { label: mode, id: String(CONTEXTMENU.INTERACTION_MODE), click: _callback, accelerator: process.platform == "darwin" ? "Command+" + this.controller.controlMode.modes[mode].shortcut : "ctrl+" + this.controller.controlMode.modes[mode].shortcut  }
        );
        //@ts-ignore
        subitem.overrideProperty("interactionMode", mode);
        submenu.append(subitem);
      }
      item = new remote.MenuItem({
        label: "Interaction Mode",
        submenu: submenu
      });
      
      menu.append(item);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void { 
      switch (Number(_item.id)) {
        case CONTEXTMENU.CONTROL_MODE: 
          // BUG: Sometimes _item does not contain a controlMode property, find out why and fix
          let controlModeNew: ControlMode = _item["controlMode"];
          // //@ts-ignore
          this.controller.setControlMode(controlModeNew);
          // ƒ.Debug.info(meshNew.type, meshNew);

          this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
          this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
          break;
        case CONTEXTMENU.INTERACTION_MODE:
          let mode: InteractionMode = _item["interactionMode"];
          this.controller.setInteractionMode(mode);
          this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
          break;
      }
    }

    private animate = (_e: Event) => {
      this.viewport.setGraph(this.graph);
      if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
        this.viewport.draw();
    }

    private onmove = (_event: ƒ.EventPointer): void => {
      this.controller.onmove(_event);
    }

    private onmouseup = (_event: ƒ.EventPointer): void => {
      switch (_event.button) {
        case 0: this.controller.onmouseup(_event);
      }
    }

    private onmousedown = (_event: ƒ.EventPointer): void => {
      switch (_event.button) {
        case 0: this.controller.onmousedown(_event);
      }
    }

    private handleKeyboard = (_event: ƒ.EventKeyboard): void => {
      this.controller.switchMode(_event);
    }

    protected cleanup(): void {
      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
    }
  }
}