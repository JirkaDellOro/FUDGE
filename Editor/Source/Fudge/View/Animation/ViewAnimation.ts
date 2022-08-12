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
    private selectedKey: ViewAnimationKey;
    private selectedProperty: HTMLElement;
    
    private time: ƒ.Time = new ƒ.Time();
    private idInterval: number;

    constructor(_container: ComponentContainer, _state: Object) {
      super(_container, _state);
      this.setAnimation(null);
      this.createUserInterface();
      
      this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.ANIMATE, this.hndAnimate);
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndSelect);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener(ƒui.EVENT.INPUT, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.CLICK, this.hndEvent);
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
          this.dispatchAnimate(this.controller.getSelectedSequences(this.selectedProperty));
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
      this.toolbar.style.width = "300px";
      this.toolbar.style.height = "50px";
      this.toolbar.style.marginBottom = "30px";
      this.toolbar.style.overflow = "hidden";
      this.fillToolbar(this.toolbar);
      this.toolbar.addEventListener("click", this.hndToolbarClick);
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
        case EVENT_EDITOR.DELETE:
          this.controller.deleteKey(this.selectedKey);
          this.dispatchAnimate(this.controller.getSelectedSequences(this.selectedProperty));
          break;
        case ƒui.EVENT.CLICK:
          if (!(_event.target instanceof HTMLElement) || !this.animation || _event.target instanceof HTMLButtonElement) break;
        
          let target: HTMLElement = _event.target;
          if (target.parentElement instanceof ƒui.Details) 
            target = target.parentElement;
          if (target instanceof ƒui.CustomElement || target instanceof ƒui.Details) 
            this.selectedProperty = target;
          else if (target == this.dom)
            this.selectedProperty = null;
          this.dispatchAnimate(this.controller.getSelectedSequences(this.selectedProperty));
          break;
        case ƒui.EVENT.INPUT:
          if (_event.target instanceof ƒui.CustomElement) {
            this.controller.updateSequence(this.playbackTime, _event.target);
            this.dispatchAnimate(this.controller.getSelectedSequences(this.selectedProperty));
          }
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
      
      this.dispatchAnimate(this.controller?.getSelectedSequences(this.selectedProperty));
    }

    private createPropertyList(): void {
      let nodeMutator: ƒ.Mutator = this.animation.getMutated(this.playbackTime, 0, this.cmpAnimator.playback) || {};

      let newPropertyList: HTMLDivElement = ƒui.Generator.createInterfaceFromMutator(nodeMutator);
      if (this.dom.contains(this.propertyList))
        this.dom.replaceChild(newPropertyList, this.propertyList);
      else
        this.dom.appendChild(newPropertyList);
      this.propertyList = newPropertyList;

      this.controller = new ControllerAnimation(this.animation, this.propertyList);
      this.controller.updatePropertyList(nodeMutator);
    }

    private hndSelect = (_event: FudgeEvent): void => {
      this.selectedKey = _event.detail.data;
    }

    private hndAnimate = (_event: FudgeEvent): void => {
      if (_event.detail.view instanceof ViewAnimationSheet)
        this.pause();
      this.playbackTime = _event.detail.data.playbackTime;

      let nodeMutator: ƒ.Mutator = this.cmpAnimator?.updateAnimation(this.playbackTime) || {};
      this.controller?.updatePropertyList(nodeMutator);
    }

    private dispatchAnimate(_sequences?: ViewAnimationSequence[]): void {
      this.dispatch(EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.graph, data: { playbackTime: this.playbackTime, sequences: _sequences } } });
    }

    private fillToolbar(_tb: HTMLElement): void { 
      let buttons: HTMLButtonElement[] = [];
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons[0].classList.add("fa", "fa-fast-backward", "start");
      buttons[1].classList.add("fa", "fa-backward", "back");
      buttons[2].classList.add("fa", "fa-play", "play");
      buttons[3].classList.add("fa", "fa-pause", "pause");
      buttons[4].classList.add("fa", "fa-forward", "forward");
      buttons[5].classList.add("fa", "fa-fast-forward", "end");
      buttons[6].classList.add("fa", "fa-file", "add-label");
      buttons[7].classList.add("fa", "fa-bookmark", "add-event");
      buttons[8].classList.add("fa", "fa-plus-square", "add-key");
      buttons[9].classList.add("fa", "fa-plus-square", "remove-key");
      buttons[0].id = "start";
      buttons[1].id = "back";
      buttons[2].id = "play";
      buttons[3].id = "pause";
      buttons[4].id = "forward";
      buttons[5].id = "end";
      buttons[6].id = "add-label";
      buttons[7].id = "add-event";
      buttons[8].id = "add-key";
      buttons[9].id = "remove-key";

      buttons[0].innerText = "start";
      buttons[1].innerText = "back";
      buttons[2].innerText = "play";
      buttons[3].innerText = "pause";
      buttons[4].innerText = "forward";
      buttons[5].innerText = "end";
      buttons[6].innerText = "add-label";
      buttons[7].innerText = "add-event";
      buttons[8].innerText = "add-key";
      buttons[9].innerText = "remove-key";

      for (let b of buttons) {
        _tb.appendChild(b);
      }

    }

    private hndToolbarClick = (_e: MouseEvent) => {
      // console.log("click", _e.target);
      let target: HTMLInputElement = <HTMLInputElement>_e.target;
      switch (target.id) {
        case "add-label":
          this.animation.labels[this.randomNameGenerator()] = this.playbackTime;
          this.dispatchAnimate();
          break;
        case "add-event":
          this.animation.setEvent(this.randomNameGenerator(), this.playbackTime);
          this.dispatchAnimate();
          break;
        case "add-key":
          // TODO: readd this look how it works in unity?
          // this.controller.addKeyToAnimationStructure(this.playbackTime);
          // this.sheet.setSequences(this.controller.getOpenSequences());       
          // this.redraw();
          break;
        case "remove-key":
          this.dispatch(EVENT_EDITOR.DELETE, { bubbles: true });
          break;
        case "start":
          this.playbackTime = 0;
          this.dispatchAnimate();
          break;
        case "back": // TODO: change to next key frame
          this.playbackTime = this.playbackTime -= 1000 / this.animation.fps; // stepsPerSecond;
          this.playbackTime = Math.max(this.playbackTime, 0);
          this.dispatchAnimate();
          break;
        case "play":
          if (this.idInterval == undefined) {
            this.time.set(this.playbackTime);
            this.idInterval = window.setInterval(() => {
              this.playbackTime = this.time.get() % this.animation.totalTime;
              this.dispatchAnimate();
            }, 1000 / this.animation.fps);
          }
          break;
        case "pause":
          this.pause();
          break;
        case "forward": // TODO: change to next key frame
          this.playbackTime = this.playbackTime += 1000 / this.animation.fps; // stepsPerSecond;
          this.playbackTime = Math.min(this.playbackTime, this.animation.totalTime);
          this.dispatchAnimate();
          break;
        case "end":
          this.playbackTime = this.animation.totalTime;
          this.dispatchAnimate();
          break;
        default:

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