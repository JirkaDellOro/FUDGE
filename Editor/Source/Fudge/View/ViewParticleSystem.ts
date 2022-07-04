namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  // const fs: ƒ.General = require("fs");
  export class ViewParticleSystem extends View {
    private graph: ƒ.Graph;
    private node: ƒ.Node;
    private cmpParticleSystem: ƒ.ComponentParticleSystem;
    private particleEffect: ƒ.ParticleEffect;
    private particleEffectData: ƒ.Serialization;
    private particleEffectStructure: ƒ.ParticleEffectStructure;
    private idInterval: number;

    // private controller: ControllerTreeParticleSystem;
    private tree: ƒui.CustomTree<Object | ƒ.ClosureData>;
    private controller: ControllerTreeParticleSystem;
    private canvas: HTMLCanvasElement;
    private crc2: CanvasRenderingContext2D;

    constructor(_container: ComponentContainer, _state: Object) {
        super(_container, _state);

        this.createUserInterface();
        this.setParticleEffect(null);

        _container.on("resize", this.redraw);
        this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
        this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
    }

    //#region  ContextMenu
    protected openContextMenu = (_event: Event): void => {
      this.contextMenu = this.getCustomContextMenu(this.contextMenuCallback.bind(this));
      this.contextMenu.popup();
    }

    protected getCustomContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;
      let focus: Object | ƒ.ClosureData = this.tree.getFocussed();

      if (ƒ.ParticleEffect.isFunctionData(focus)) {
        item = new remote.MenuItem({ label: "Add Variable/Constant", id: String(CONTEXTMENU.ADD_PARTICLE_CONSTANT), click: _callback });
        menu.append(item);
        item = new remote.MenuItem({ label: "Add Function", id: String(CONTEXTMENU.ADD_PARTICLE_FUNCTION), click: _callback });
        menu.append(item);
      } else {
        menu.append(this.getMenuItemFromPath(this.controller.getPath(focus), _callback));
      }

      item = new remote.MenuItem({ label: "Delete", id: String(CONTEXTMENU.DELETE_NODE), click: _callback, accelerator: "D" });
      menu.append(item);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);
      let focus: Object | ƒ.ClosureData = this.tree.getFocussed();

      let child: Object | ƒ.ClosureData;
      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_PARTICLE_PATH:
          child = {};
          focus[_item.label] = child;
          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          break;
        case CONTEXTMENU.ADD_PARTICLE_CONSTANT:
          child = <ƒ.VariableData | ƒ.ConstantData>{ type: "constant", value: 0 };

          let parentLabel: string = _item["parentLabel"];
          if (parentLabel) focus[parentLabel] = child;

          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          break;
        case CONTEXTMENU.ADD_PARTICLE_FUNCTION:
          child = <ƒ.VariableData | ƒ.ConstantData>{ type: "constant", value: 0 };

          let parentLabell: string = _item["parentLabel"];
          if (parentLabell) focus[parentLabell] = child;

          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          break;  
        case CONTEXTMENU.DELETE_NODE:
          if (!focus)
            return;
          let remove: (Object | ƒ.ClosureData)[] = this.controller.delete([focus]);
          this.tree.delete(remove);
          this.dom.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
          break;
      }
    }

    private getMenuItemFromPath(_path: string[], _callback: ContextMenuCallback): Electron.MenuItem {
      let focus: Object | ƒ.ClosureData = this.tree.getFocussed();
      let label: string;
      let options: string[];
      let numberOptions: string[] = [];

      const submenu: Electron.Menu = new remote.Menu();
      switch (_path[0]) {
        case "storage":
          if (_path.length == 1) {
            label = "Add Storage";
            options = ["system", "update", "particle"];
          } else {
            // TODO: add variable or function
          }
          break;
        case "transformations":
          if (_path.length == 1) {
            label = "Add Transformation";
            options = ["local", "world"];
          } else {
            // TODO: i dont know
          }
          break;
        case "components":
          if (_path.length == 1) {
            label = "Add Component";
            options = [];
            for (const anyComponent of ƒ.Component.subclasses) {
              //@ts-ignore
              this.node.getComponents(anyComponent).forEach((component, index) => { // we need to get the attached componnents as array so we can reconstuct their path
                options.push(component.type);
              });
            }
          } else {
            label = "Add Property";
            //@ts-ignore
            let mutator: ƒ.Mutator = this.node.getComponent(ƒ.Component.subclasses.find(componentType => componentType.name == _path[1])).getMutatorForAnimation();
            _path.splice(0, 2);
            while (_path.length > 0) {
              mutator = mutator[_path.shift()];
            }
            options = Object.keys(mutator).filter(optionLabel => mutator[optionLabel] instanceof Object || typeof mutator[optionLabel] == "number"); // only Object and number are valid
            numberOptions = options.filter(optionLabel => typeof mutator[optionLabel] == "number");
          }
          break;         
      }

      options = options.filter(option => !Object.keys(focus).includes(option)); // remove options that are already added
      let item: Electron.MenuItem;
      for (const optionLabel of options) {
        if (numberOptions.includes(optionLabel)) {
          let subsubmenu: Electron.Menu = new remote.Menu();
          item = new remote.MenuItem({ label: "Add Variable/Constant", id: String(CONTEXTMENU.ADD_PARTICLE_CONSTANT), click: _callback });
          subsubmenu.append(item);
          //@ts-ignore
          item.overrideProperty("parentLabel", optionLabel);
          item = new remote.MenuItem({ label: "Add Function", id: String(CONTEXTMENU.ADD_PARTICLE_FUNCTION), click: _callback });
          subsubmenu.append(item);
          //@ts-ignore
          item.overrideProperty("parentLabel", optionLabel);          
          item = new remote.MenuItem(
            { label: optionLabel, submenu: subsubmenu }
          );
        } else {
          item = new remote.MenuItem(
            { label: optionLabel, id: String(CONTEXTMENU.ADD_PARTICLE_PATH), click: _callback }
          );
        }
        submenu.append(item);
      }

      return new remote.MenuItem({
        label: label,
        submenu: submenu
      });
    }
    //#endregion

    private hndEvent = async (_event: FudgeEvent): Promise<void> => {
      switch (_event.type) {
        case EVENT_EDITOR.FOCUS:
          this.graph = _event.detail.graph;
          this.node = _event.detail.node;
          this.cmpParticleSystem = this.node?.getComponent(ƒ.ComponentParticleSystem);
          await this.setParticleEffect(this.cmpParticleSystem?.particleEffect);
          break;
        case EVENT_EDITOR.MODIFY:
        case ƒui.EVENT.DELETE:
        case ƒui.EVENT.DROP:
        case ƒui.EVENT.RENAME:
          this.particleEffect.data = this.particleEffectData;
          this.cmpParticleSystem.particleEffect = this.particleEffect;
          break;
      }
    }

    private async setParticleEffect(_particleEffect: ƒ.ParticleEffect): Promise<void> {
      if (!_particleEffect) {
        this.particleEffect = undefined;
        this.tree = undefined;
        window.clearInterval(this.idInterval);
        this.idInterval = undefined;
        this.dom.innerHTML = "select a node with an attached component particle system";
        return;
      }

      this.particleEffect = _particleEffect;
      this.particleEffectData = _particleEffect.data;
      this.dom.innerHTML = "";
      this.dom.appendChild(this.canvas);
      this.recreateTree(this.particleEffectData);
      this.updateUserInterface();
      this.redraw();
      if (this.idInterval == undefined)
        this.idInterval = window.setInterval(() => { this.dispatch(EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.graph} }); }, 1000 / 30);
    }


    private createUserInterface(): void {

      this.canvas = document.createElement("canvas");
      this.crc2 = this.canvas.getContext("2d");

      this.canvas.style.position = "absolute";
      this.canvas.style.left = "300px";
      this.canvas.style.top = "0px";

    }

    private updateUserInterface(): void {
      // this.propertyList = document.createElement("div");

    }

    private recreateTree(_particleEffectData: ƒ.Serialization): void {
      this.controller = new ControllerTreeParticleSystem(_particleEffectData);
      let newTree: ƒui.CustomTree<Object | ƒ.ClosureData> = 
        new ƒui.CustomTree<Object | ƒ.ClosureData>( this.controller, _particleEffectData );

      if (this.tree && this.dom.contains(this.tree)) 
        this.dom.replaceChild(newTree, this.tree);
      else 
        this.dom.appendChild(newTree);
      this.tree = newTree;
      this.tree.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.DROP, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.DELETE, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
    }

    //#region drawing
    private redraw = () => {
      if (!this.particleEffect) return;
      this.canvas.width = this.dom.clientWidth - 300;
      this.canvas.height = this.dom.clientHeight;

      this.crc2.resetTransform();
      this.crc2.translate(0, 500);
      this.crc2.clearRect(0, 0, this.canvas.height, this.canvas.width);
      this.drawStructure(this.particleEffect.mtxLocal);
    }

    private drawStructure(_structureOrFunction: ƒ.ParticleEffectStructure | Function): void {
      if (_structureOrFunction instanceof Function) {
        this.drawClosure(_structureOrFunction);
      } else {
        for (const property in _structureOrFunction) {
          this.drawStructure(_structureOrFunction[property]);
        }
      }
    }

    private drawClosure(_closure: Function): void {
      let variables: ƒ.ParticleVariables = this.cmpParticleSystem.variables;
      for (let iParticle: number = 0; iParticle < variables[ƒ.PARTICLE_VARIBALE_NAMES.SIZE]; iParticle += 1) {
        // console.log(iParticle);
        this.crc2.strokeStyle = this.randomColor();
        this.crc2.lineWidth = 2;
        this.crc2.beginPath();

        
        for (let time: number = 0; time < 20; time++) {
          variables[ƒ.PARTICLE_VARIBALE_NAMES.TIME] = 0;
          // this.cmpParticleSystem.evaluateStorage(this.particleEffect.storageUpdate);
          variables[ƒ.PARTICLE_VARIBALE_NAMES.INDEX] = iParticle;
          // this.cmpParticleSystem.evaluateStorage(this.particleEffect.storageParticle);
          variables["reversedParticleTime"] = time / 10;
          let x: number = time * 100;
          let y: number = -_closure(variables) * 1000;
          // console.log(y);
          if (x == 0) this.crc2.moveTo(x, y);
          else this.crc2.lineTo(x, y);
        }
        this.crc2.stroke();
      }
    }

    private randomColor(): string {
      return "hsl(" + Math.random() * 360 + ", 80%, 80%)";
    }
    //#endregion
  }
}
