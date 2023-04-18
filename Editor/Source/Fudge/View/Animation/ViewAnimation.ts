namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View and edit the animatable properties of a node with an attached component animation.
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class ViewAnimation extends View {
    private node: ƒ.Node;
    private cmpAnimator: ƒ.ComponentAnimator;
    private animation: ƒ.Animation;
    private playbackTime: number = 0;
    
    private propertyList: HTMLDivElement;
    private controller: ControllerAnimation;

    private toolbar: HTMLDivElement;
    private frameInput: HTMLInputElement;
    
    private time: ƒ.Time = new ƒ.Time();
    private idInterval: number;

    constructor(_container: ComponentContainer, _state: Object) {
      super(_container, _state);
      this.setAnimation(null);
      this.createToolbar();
      
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener(ƒui.EVENT.INPUT, this.hndEvent);
    }

    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      _event.dataTransfer.dropEffect = "none";

      let source: Object = _viewSource.getDragDropSources()[0];
      if (!(_viewSource instanceof ViewHierarchy) || !(source instanceof ƒ.Node) || !source.getComponent(ƒ.ComponentAnimator))
        return;

      _event.dataTransfer.dropEffect = "link";
      _event.preventDefault();
      _event.stopPropagation();
    }

    protected hndDrop(_event: DragEvent, _viewSource: View): void {
      let source: Object = _viewSource.getDragDropSources()[0];
      this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { node: <ƒ.Node>source } });
    }

    //#region context menu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let path: string[] = [];

      if (this.node != undefined) {
        let item: Electron.MenuItem;
        item = new remote.MenuItem({
          label: "Add Property",
          submenu: this.getNodeSubmenu(this.node, path, _callback)
        });
        menu.append(item);

        item = new remote.MenuItem({ label: "Delete Property", id: String(CONTEXTMENU.DELETE_PROPERTY), click: _callback, accelerator: "D" });
        menu.append(item);
      }

      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      let choice: CONTEXTMENU = Number(_item.id);
      ƒ.Debug.fudge(`MenuSelect | id: ${CONTEXTMENU[_item.id]} | event: ${_event}`);
        
      switch (choice) {
        case CONTEXTMENU.ADD_PROPERTY:
          // defined in getMutatorSubmenu, this seems to be the only way to keep the path associated with the menu item, attaching anything to item
          break;
        case CONTEXTMENU.DELETE_PROPERTY:
          if (!(document.activeElement instanceof HTMLElement)) return;
          this.controller.deleteProperty(document.activeElement);
          this.createPropertyList();
          this.animate();
          return;
      }
    }

    private getNodeSubmenu(_node: ƒ.Node, _path: string[], _callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      for (const componentClass of ƒ.Component.subclasses) {
        //@ts-ignore
        _node.getComponents(componentClass).forEach((component, index) => { // we need to get the attached componnents as array so we can reconstuct their path
          let path: string[] = Object.assign([], _path);
          path.push("components");
          path.push(component.type);
          path.push(index.toString());
          let mutator: ƒ.Mutator = component.getMutatorForAnimation();
          if (mutator && Object.keys(mutator).length > 0) {
            let item: Electron.MenuItem;
            item = new remote.MenuItem(
              { label: component.type, submenu: this.getMutatorSubmenu(mutator, path, _callback)}
            );
            menu.append(item);
          }
        });
      }

      for (const child of _node.getChildren()) {
        let path: string[] = Object.assign([], _path);
        path.push("children");
        path.push(child.name);
        let item: Electron.MenuItem;
        item = new remote.MenuItem(
          { label: child.name, submenu: this.getNodeSubmenu(child, path, _callback)}
        );
        menu.append(item);
      }

      return menu;
    }

    private getMutatorSubmenu(_mutator: ƒ.Mutator, _path: string[], _callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      for (const property in _mutator) {
        let item: Electron.MenuItem;
        let path: string[] = Object.assign([], _path);
        path.push(property);
        if (typeof _mutator[property] === "object") {
          item = new remote.MenuItem(
            { label: property, submenu: this.getMutatorSubmenu(_mutator[property], path, _callback) }
          );
        } else {
          item = new remote.MenuItem(
            { label: property, id: String(CONTEXTMENU.ADD_PROPERTY), click: () => {
              this.controller.addProperty(path);
              this.createPropertyList();
              this.animate();
            } }
          );
        }
        menu.append(item);
      }

      return menu;
    }
    //#endregion

    private createToolbar(): void {
      this.toolbar = document.createElement("div");
      this.toolbar.id = "toolbar";

      ["previous", "play", "next"]
        .map(_id => {
          let button: HTMLButtonElement = document.createElement("button");
          button.id = _id;
          button.onclick = this.hndToolbarClick;
          return button;
        })
        .forEach(_button => this.toolbar.appendChild(_button));

      this.frameInput = document.createElement("input");
      this.frameInput.type = "text";
      this.frameInput.id = "frameinput";
      this.frameInput.onfocus = () => Reflect.set(this.frameInput, "previousValue", this.frameInput.value);
      this.frameInput.onkeydown = _event => {
        if (_event.key.length == 1 && !/\d/.test(_event.key)) {
          _event.preventDefault();
          return;
        }
        if (_event.key == ƒ.KEYBOARD_CODE.ENTER || _event.key == ƒ.KEYBOARD_CODE.NUMPAD_ENTER) {
          this.frameInput.blur();
          this.frameInput.focus();
        }
      };
      this.frameInput.onblur = () => {
        if (this.frameInput.value.length == 0)
          this.frameInput.value = Reflect.get(this.frameInput, "previousValue");
        this.frameInput.value = this.frameInput.value.match(/[1-9]\d*|0$/)[0];
        this.playbackTime = Number.parseInt(this.frameInput.value) * 1000 / this.animation.fps;
        this.animate();
      };
      this.toolbar.appendChild(this.frameInput);
    }

    private hndEvent = (_event: EditorEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SELECT:
          if (_event.detail.node != null) {
            this.node = _event.detail.node;
            this.cmpAnimator = this.node?.getComponent(ƒ.ComponentAnimator);
            this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
            this.setAnimation(this.cmpAnimator?.animation);
          }
          break;
        case EVENT_EDITOR.MODIFY:
          if (_event.detail.view instanceof ViewAnimationSheet) 
            this.pause();

          this.playbackTime = _event.detail.data;
          this.frameInput.value = (Math.trunc(this.playbackTime / 1000 * this.animation.fps)).toString();

          let nodeMutator: ƒ.Mutator = this.cmpAnimator?.updateAnimation(this.playbackTime) || {};
          this.controller?.updatePropertyList(nodeMutator);
          break;
        case ƒui.EVENT.INPUT:
          if (_event.target instanceof ƒui.CustomElement) {
            this.controller.updateSequence(this.playbackTime, _event.target);
            this.animate();
          }
          break;
        case ƒui.EVENT.CLICK:
          this.animate();
          break;
      }
    }

    private setAnimation(_animation: ƒ.Animation): void {
      if (_animation) {
        this.dom.innerHTML = "";
        this.dom.appendChild(this.toolbar);
        this.animation = _animation;
        this.createPropertyList();
        this.animate();
      } else {
        this.animation = undefined;
        this.dom.innerHTML = "Drop a node with an attached component animator here to edit";
      }
    }

    private createPropertyList(): void {
      let nodeMutator: ƒ.Mutator = this.animation.getMutated(this.playbackTime, 0, this.cmpAnimator.playback) || {};

      let newPropertyList: HTMLDivElement = ƒui.Generator.createInterfaceFromMutator(nodeMutator);
      if (this.dom.contains(this.propertyList))
        this.dom.replaceChild(newPropertyList, this.propertyList);
      else
        this.dom.appendChild(newPropertyList);
      this.propertyList = newPropertyList;
      this.propertyList.id = "propertylist";

      this.controller = new ControllerAnimation(this.animation, this.propertyList, this);
      this.controller.updatePropertyList(nodeMutator);
      this.propertyList.dispatchEvent(new CustomEvent(ƒui.EVENT.CLICK));
    }

    private animate(): void {
      this.dispatch(EVENT_EDITOR.MODIFY, { bubbles: true, detail: { data: this.playbackTime } });
    }

    private hndToolbarClick = (_event: MouseEvent) => {
      let target: HTMLInputElement = <HTMLInputElement>_event.target;
      switch (target.id) {
        case "previous":
          this.playbackTime = this.controller.nextKey(this.playbackTime, "backward");
          this.animate();
          break;
        case "play":
          if (this.idInterval == null) {
            target.id = "pause";
            this.time.set(this.playbackTime);
            this.idInterval = window.setInterval(() => {
              this.playbackTime = this.time.get() % this.animation.totalTime;
              this.animate();
            },                                   1000 / this.animation.fps);
          }
          break;
        case "pause":
          this.pause();
          break;
        case "next":
          this.playbackTime = this.controller.nextKey(this.playbackTime, "forward");
          this.animate();
          break;
      }
    }

    private pause(): void {
      if (this.idInterval == null) return;
      this.toolbar.querySelector("#pause").id = "play";
      window.clearInterval(this.idInterval);
      this.idInterval = null;
    }
  }
}