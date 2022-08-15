namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export interface ViewAnimationSequence {
    sequence: ƒ.AnimationSequence;
    color: string;
  }

  export interface ViewAnimationKey {
    key: ƒ.AnimationKey;
    posScreen: ƒ.Vector2;
    sequence: ViewAnimationSequence;
    path2D: Path2D;
  }

  export interface ViewAnimationEvent {
    event: string;
    path2D: Path2D;
  }

  export interface ViewAnimationLabel {
    label: string;
    path2D: Path2D;
  }

  /**
   * TODO: add
   * @authors Lukas Scheuerle, HFU, 2019 | Jonas Plotzky, HFU, 2022
   */
  export class ViewAnimation extends View {
    private graph: ƒ.Graph;
    private node: ƒ.Node;
    private cmpAnimator: ƒ.ComponentAnimator;
    private animation: ƒ.Animation;
    private playbackTime: number = 0;
    
    private propertyList: HTMLDivElement;
    private controller: ControllerAnimation;

    private toolbar: HTMLDivElement;
    
    private time: ƒ.Time = new ƒ.Time();
    private idInterval: number;

    constructor(_container: ComponentContainer, _state: Object) {
      super(_container, _state);
      this.setAnimation(null);
      this.createUserInterface();
      
      this.dom.style.display = "flex";
      this.dom.style.flexFlow = "column";
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.ANIMATE, this.hndAnimate);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener(ƒui.EVENT.INPUT, this.hndEvent);
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
          let path: string[] = Reflect.get(_item, "path");
          this.controller.addProperty(path);
          this.createPropertyList();
          this.dispatchAnimate();

          break;
        case CONTEXTMENU.DELETE_PROPERTY:
          if (!(document.activeElement instanceof HTMLElement)) return;
          this.controller.deleteProperty(document.activeElement);
          this.createPropertyList();
          this.dispatchAnimate();
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
          let item: Electron.MenuItem;
          item = new remote.MenuItem(
            { label: component.type, submenu: this.getMutatorSubmenu(component.getMutatorForAnimation(), path, _callback)}
          );
          menu.append(item);  
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
            { label: property, id: String(CONTEXTMENU.ADD_PROPERTY), click: _callback }
          );
          Reflect.set(item, "path", path);
          }
        menu.append(item);
        }

      
      return menu;
    }
    //#endregion

    private createUserInterface(): void {
      this.toolbar = document.createElement("div");
      this.toolbar.id = "toolbar";
      this.toolbar.style.flex = "0 1 auto";

      ["previous", "play", "next"]
        .map(_id => {
          let button: HTMLButtonElement = document.createElement("button");
          button.id = _id;
          button.onclick = this.hndToolbarClick;
          return button;
        })
        .forEach(_button => this.toolbar.appendChild(_button));
    }

    private hndEvent = (_event: FudgeEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.FOCUS:
          this.graph = _event.detail.graph;
          this.node = _event.detail.node;
          this.cmpAnimator = this.node?.getComponent(ƒ.ComponentAnimator);
          this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
          this.setAnimation(this.cmpAnimator?.animation);
          break;
        case ƒui.EVENT.INPUT:
          if (_event.target instanceof ƒui.CustomElement) {
            this.controller.updateSequence(this.playbackTime, _event.target);
            this.dispatchAnimate();
          }
          break;
        case ƒui.EVENT.CLICK:
          this.dispatchAnimate();
          break;
      }
    }

    private setAnimation(_animation: ƒ.Animation): void {
      if (_animation) {
        this.dom.innerHTML = "";
        this.dom.appendChild(this.toolbar);
        this.animation = _animation;
        this.createPropertyList();
      } else {
        this.animation = undefined;
        this.dom.innerHTML = "select node with an attached component animator";
      }

      this.dispatchAnimate();
    }

    private createPropertyList(): void {
      let nodeMutator: ƒ.Mutator = this.animation.getMutated(this.playbackTime, 0, this.cmpAnimator.playback) || {};

      let newPropertyList: HTMLDivElement = ƒui.Generator.createInterfaceFromMutator(nodeMutator);
      newPropertyList.style.paddingTop = "30px";
      newPropertyList.style.flex = "1 1 auto";
      if (this.dom.contains(this.propertyList))
        this.dom.replaceChild(newPropertyList, this.propertyList);
      else
        this.dom.appendChild(newPropertyList);
      this.propertyList = newPropertyList;

      this.controller = new ControllerAnimation(this.animation, this.propertyList, this);
      this.controller.updatePropertyList(nodeMutator);
      this.propertyList.dispatchEvent(new CustomEvent(ƒui.EVENT.CLICK));
    }

    private hndAnimate = (_event: FudgeEvent): void => {
      if (_event.detail.view instanceof ViewAnimationSheet)
        this.pause();
      this.playbackTime = _event.detail.data;

      let nodeMutator: ƒ.Mutator = this.cmpAnimator?.updateAnimation(this.playbackTime) || {};
      this.controller?.updatePropertyList(nodeMutator);
    }

    private dispatchAnimate(): void {
      this.dispatch(EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.graph, data: this.playbackTime } });
    }

    private hndToolbarClick = (_event: MouseEvent) => {
      let target: HTMLInputElement = <HTMLInputElement>_event.target;
      switch (target.id) {
        // case "add-label":
        //   this.animation.labels[this.randomNameGenerator()] = this.playbackTime;
        //   this.dispatchAnimate();
        //   break;
        // case "add-event":
        //   this.animation.setEvent(this.randomNameGenerator(), this.playbackTime);
        //   this.dispatchAnimate();
        //   break;
        case "previous": // TODO: change to next key frame
          this.playbackTime = this.controller.nextKey(this.playbackTime, "backward");
          this.dispatchAnimate();
          break;
        case "play":
          if (this.idInterval == undefined) {
            target.id = "pause";
            this.time.set(this.playbackTime);
            this.idInterval = window.setInterval(() => {
              this.playbackTime = this.time.get() % this.animation.totalTime;
              this.dispatchAnimate();
            },                                   1000 / this.animation.fps);
          }
          break;
        case "pause":
          target.id = "play";
          this.pause();
          break;
        case "next": // TODO: change to next key frame
          this.playbackTime = this.controller.nextKey(this.playbackTime, "forward");
          this.dispatchAnimate();
          break;
      }
    }

    private pause(): void {
      window.clearInterval(this.idInterval);
      this.idInterval = undefined;
    }

    private randomNameGenerator(): string {
      let attr: string[] = ["red", "blue", "green", "pink", "yellow", "purple", "orange", "fast", "slow", "quick", "boring", "questionable", "king", "queen", "smart", "gold"];
      let anim: string[] = ["cow", "fish", "elephant", "cat", "dog", "bat", "chameleon", "caterpillar", "crocodile", "hamster", "horse", "panda", "giraffe", "lukas", "koala", "jellyfish", "lion", "lizard", "platypus", "scorpion", "penguin", "pterodactyl"];

      return attr[Math.floor(Math.random() * attr.length)] + "-" + anim[Math.floor(Math.random() * anim.length)];
    }
  }
}