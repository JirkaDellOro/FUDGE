namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒaid = FudgeAid;

  export class ViewModellerScene extends View {
    public static isBackfaceCullingEnabled: boolean = false;
    /* 
      maps MODELLER_MENU to the accelerator key
      incase someone wants to add a menu item: 
      1. add one entry with MODELLER_MENU, shortcut to this map
      2. add one entry with MODELLER_MENU, function to the availableModes map in the desired interaction mode
      3. add one function here, which creates an item for the MODELLER_MENU value
      rest should be automatic
    */
    public static menuitemToShortcutsMap: Map<MODELLER_MENU, Set<string>> = new Map([
      [MODELLER_MENU.TOGGLE_BACKFACE_CULLING, new Set([ELECTRON_KEYS.CTRL, ELECTRON_KEYS.SHIFT, "b"])], 
      [MODELLER_MENU.DISPLAY_NORMALS, new Set([ELECTRON_KEYS.CTRL, ELECTRON_KEYS.SHIFT, "n"])], 
      [MODELLER_MENU.INVERT_FACE, new Set([ELECTRON_KEYS.CTRL, ELECTRON_KEYS.SHIFT, "i"])],
      [MODELLER_MENU.REMOVE_FACE, new Set(["delete"])]]);
    public viewport: ƒ.Viewport;
    public canvas: HTMLCanvasElement;
    public graph: ƒ.Node;
    public controller: Controller;
    public node: ƒ.Node;
    public content: HTMLDivElement;
    // menu items can also be added here, if they should be available everywhere
    protected availableMenuitems: Map<MODELLER_MENU, Function> = new Map([[MODELLER_MENU.TOGGLE_BACKFACE_CULLING, ViewModellerScene.toggleBackfaceCulling]]);
    private orbitCamera: ƒaid.CameraOrbit;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.graph = <ƒ.Node><unknown>_state["node"];
      this.createUserInterface();

      ƒaid.addStandardLightComponents(this.graph, new ƒ.Color(0.5, 0.5, 0.5));
      ƒ.RenderWebGL.setBackfaceCulling(ViewModellerScene.isBackfaceCullingEnabled);
      this.node = this.graph.getChildrenByName("Default")[0];
      this.controller = new Controller(this.viewport, this.node, this.dom);
      this.dom.addEventListener(MODELLER_EVENTS.HEADER_APPEND, this.changeHeader);
      this.dom.append(this.canvas);
      this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.updateContextMenu);
      this.addEventListeners();
    }

    public static toggleBackfaceCulling(): void {
      ViewModellerScene.isBackfaceCullingEnabled = !ViewModellerScene.isBackfaceCullingEnabled;
      ƒ.RenderWebGL.setBackfaceCulling(ViewModellerScene.isBackfaceCullingEnabled);
    }


    public addEventListeners(): void {
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

    public createUserInterface(): void {
      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      this.canvas = ƒaid.Canvas.create(true, ƒaid.IMAGE_RENDERING.PIXELATED);
      document.body.appendChild(this.canvas);

      this.viewport = new ƒ.Viewport();
      this.viewport.initialize("Viewport", this.graph, cmpCamera, this.canvas);
      this.viewport.draw();
      this.orbitCamera = ƒaid.Viewport.expandCameraToInteractiveOrbit(this.viewport, false, -0.15, -0.005, 0.003);
      // this.orbitCamera.rotateX(-30);
      // this.orbitCamera.rotateY(45);
      // this.orbitCamera.distance = 5;

      this.orbitCamera.rotationX = -30;
      this.orbitCamera.rotationY = 45;
      this.orbitCamera.distance = 5;
      ƒ.Render.prepare(this.orbitCamera);

    } 

    /* 
      append all the menu items from the interaction modes
    */
    protected getContextMenu = (_callback: ContextMenuCallback): Electron.Menu => {
      const menu: Electron.Menu = new remote.Menu();
      let items: Electron.MenuItem[] = this.controller.getContextMenuItems(_callback);
      items.push(...MenuItemsCreator.getMenuItems([MODELLER_MENU.TOGGLE_BACKFACE_CULLING], _callback));
      for (let item of items) {
        menu.append(item);
      }
      return menu;
    }

    protected updateContextMenu = (): void => {
      this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
    }

    protected contextMenuCallback = (_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void => {
      switch (Number(_item.id)) {
        case MODELLER_MENU.TOGGLE_BACKFACE_CULLING: 
          ViewModellerScene.toggleBackfaceCulling();
      }
      this.controller.contextMenuCallback(_item, _window, _event);
      this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
    }

    private animate = (_e: Event) => {
      this.viewport.setBranch(this.graph);
      //this.viewport.setGraph(this.graph);
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

      let acceleratorWasExecuted: boolean = this.controller.executeAccelerator(_event);
      let wasExecuted: boolean = false;
      let pressedKey: string = _event.key.toLowerCase();
      for (let [menuitem, shortcuts] of ViewModellerScene.menuitemToShortcutsMap) {
        let selected: boolean = true; 
        if (shortcuts.has(ELECTRON_KEYS.CTRL) && !_event.ctrlKey)
          selected = false;

        if (shortcuts.has(ELECTRON_KEYS.SHIFT) && !_event.shiftKey)
          selected = false;

        if (selected === true && shortcuts.has(pressedKey)) {
          if (this.availableMenuitems.has(menuitem)) {
            this.availableMenuitems.get(menuitem)();
            wasExecuted = true;
          }
        }
      }
      if (acceleratorWasExecuted || wasExecuted) 
        this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
    }

    private onkeydown = (_event: ƒ.EventKeyboard): void => {
      this.controller.onkeydown(_event);

      let isRotated: boolean = true;
      switch (_event.key) {
        case "1":
          this.orbitCamera.rotationX = 0;
          this.orbitCamera.rotationY = 0;
          break;
        case "3":
          this.orbitCamera.rotationX = 0;
          this.orbitCamera.rotationY = 90;
          break;
        case "7":
          this.orbitCamera.rotationX = -90;
          this.orbitCamera.rotationY = 0;
          break;
        case "9":
          this.orbitCamera.rotationX = 90;
          this.orbitCamera.rotationY = 0;
          break;
        default: 
          isRotated = false;
      }
      if (isRotated)
        ƒ.Render.prepare(this.orbitCamera);
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