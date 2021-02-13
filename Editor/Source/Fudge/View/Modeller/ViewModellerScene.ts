namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒaid = FudgeAid;

  export class ViewModellerScene extends View {
    public static isBackfaceCullingEnabled: boolean = false;
    viewport: ƒ.Viewport;
    canvas: HTMLCanvasElement;
    graph: ƒ.Node;
    controller: Controller;
    node: ƒ.Node;
    content: HTMLDivElement;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.graph = <ƒ.Node><unknown>_state["node"];
      this.createUserInterface();

      ƒaid.addStandardLightComponents(this.graph, new ƒ.Color(0.5, 0.5, 0.5));

      ƒ.RenderWebGL.setBackfaceCulling(ViewModellerScene.isBackfaceCullingEnabled);
      this.node = this.graph.getChildrenByName("Default")[0];
      this.controller = new Controller(this.viewport, this.node, this.dom);
      //new CameraControl(this.viewport);
      this.dom.addEventListener(ModellerEvents.HEADER_APPEND, this.changeHeader);
      this.dom.append(this.canvas);
      this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.updateContextMenu);
      this.addEventListeners();
    }

    addEventListeners(): void {
      this.viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, this.onmove);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);

      this.viewport.addEventListener(ƒ.EVENT_POINTER.UP, this.onmouseup);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.UP, true);

      this.viewport.addEventListener(ƒ.EVENT_POINTER.DOWN, this.onmousedown);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.DOWN, true);

      this.viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, this.handleKeyboard);
      this.viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);

      this.viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, this.onkeydown);
      this.viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);

      this.viewport.addEventListener(ƒ.EVENT_KEYBOARD.UP, this.onkeyup);
      this.viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.UP, true);

      ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);

      this.viewport.setFocus(true);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
    }

    createUserInterface(): void {
      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      // cmpCamera.pivot.translate(new ƒ.Vector3(3, 2, 1));
      // cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
      // cmpCamera.projectCentral(1, 45);
      new ƒaid.CameraOrbit(cmpCamera);
      //cmpCamera.pivot.rotateX(90);

      this.canvas = ƒaid.Canvas.create(true, ƒaid.IMAGE_RENDERING.PIXELATED);
      document.body.appendChild(this.canvas);

      this.viewport = new ƒ.Viewport();
      this.viewport.initialize("Viewport", this.graph, cmpCamera, this.canvas);
      this.viewport.draw();
      ƒaid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false, -0.15, 0.005, 0.003);
    } 

    public toggleBackfaceCulling(): void {
      ViewModellerScene.isBackfaceCullingEnabled = !ViewModellerScene.isBackfaceCullingEnabled;
      ƒ.RenderWebGL.setBackfaceCulling(ViewModellerScene.isBackfaceCullingEnabled);
    }

    protected getContextMenu = (_callback: ContextMenuCallback): Electron.Menu => {
      const menu: Electron.Menu = new remote.Menu();
      let items: Electron.MenuItem[] = this.controller.getContextMenuItems(_callback);
      for (let item of items) {
        menu.append(item);
      }
      menu.append(MenuItemsCreator.getBackfaceCullItem(_callback));
      return menu;
    }

    // protected contextMenuCallback = (_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void => {
    //   this.controller.contextMenuCallback(_item, _window, _event); 
    // }

    protected updateContextMenu = (): void => {
      this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
    }

    protected contextMenuCallback = (_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void => {
      switch (Number(_item.id)) {
        case ModellerMenu.TOGGLE_BACKFACE_CULLING: 
          this.toggleBackfaceCulling();
      }
      this.controller.contextMenuCallback(_item, _window, _event);
      this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
    }

    // protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
    //   const menu: Electron.Menu = new remote.Menu();
    //   let item: Electron.MenuItem;

    //   let submenu: Electron.Menu = new remote.Menu();
    //   // submenu.append(new remote.MenuItem({label: "Object"}));

    // // item = new remote.MenuItem({
    // //   label: "Control Mode",
    // //   submenu: ContextMenu.getSubclassMenu<typeof AbstractControlMode>(CONTEXTMENU.CONTROL_MODE, AbstractControlMode.subclasses, _callback)
    // // });

    //   if (!this.controller) {
    //     return menu;
    //   }

    //   for (let mode of this.controller.controlModes.keys()) {
    //     let subitem: Electron.MenuItem = new remote.MenuItem(
    //       { label: mode, id: String(CONTEXTMENU.CONTROL_MODE), click: _callback, accelerator: process.platform == "darwin" ? "Command+" + this.controller.controlModes.get(mode).shortcut : "ctrl+" + this.controller.controlModes.get(mode).shortcut}
    //     );
    //     //@ts-ignore
    //     subitem.overrideProperty("controlMode", mode);
    //     submenu.append(subitem);
    //   }
    //   item = new remote.MenuItem({
    //     label: "Control Mode",
    //     submenu: submenu
    //   });
    //   menu.append(item);

    //   submenu = new remote.Menu();

    //   // TODO: fix tight coupling here, only retrieve the shortcut from the controller
    //   for (let mode in this.controller.controlMode.modes) {
    //     let subitem: Electron.MenuItem = new remote.MenuItem(
    //       { label: mode, id: String(CONTEXTMENU.INTERACTION_MODE), click: _callback, accelerator: process.platform == "darwin" ? "Command+" + this.controller.controlMode.modes[mode].shortcut : "ctrl+" + this.controller.controlMode.modes[mode].shortcut  }
    //     );
    //     //@ts-ignore
    //     subitem.overrideProperty("interactionMode", mode);
    //     submenu.append(subitem);
    //   }
    //   item = new remote.MenuItem({
    //     label: "Interaction Mode",
    //     submenu: submenu
    //   });
      
    //   menu.append(item);
    //   return menu;
    // }

    // protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void { 
    //   switch (Number(_item.id)) {
    //     case CONTEXTMENU.CONTROL_MODE: 
    //       // BUG: Sometimes _item does not contain a controlMode property, find out why and fix
    //       let controlModeNew: ControlMode = _item["controlMode"];
    //       // //@ts-ignore
    //       this.controller.setControlMode(controlModeNew);

    //       this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
    //       this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
    //       break;
    //     case CONTEXTMENU.INTERACTION_MODE:
    //       let mode: InteractionMode = _item["interactionMode"];
    //       this.controller.setInteractionMode(mode);
    //       this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
    //       break;
    //   }
    // }

    private animate = (_e: Event) => {
      this.viewport.setGraph(this.graph);
      if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
        this.viewport.draw();
      this.controller.drawSelection();
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

    private onkeydown = (_event: ƒ.EventKeyboard): void => {
      this.controller.onkeydown(_event);
    }

    private onkeyup = (_event: ƒ.EventKeyboard): void => {
      this.controller.onkeyup(_event);
    }

    private changeHeader = (_event: CustomEvent): void => {
      let _stack = _event.detail;

      let dropdownHandler: DropdownHandler = new DropdownHandler(this.controller);
      _stack.header.controlsContainer.prepend(dropdownHandler.getInteractionDropdown());
      _stack.header.controlsContainer.prepend(dropdownHandler.getControlDropdown());
    }

    protected cleanup(): void {
      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
    }
  }
}