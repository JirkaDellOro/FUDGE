namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class ViewParticleSystem extends View {
    public static readonly TRANSFORMATION_KEYS: (keyof ƒ.ParticleData.Transformation)[] = ["x", "y", "z"];
    public static readonly COLOR_KEYS: (keyof ƒ.ParticleData.Effect["color"])[] = ["r", "g", "b", "a"];

    private graph: ƒ.Graph;
    private node: ƒ.Node;
    private cmpParticleSystem: ƒ.ComponentParticleSystem;
    private particleEffect: ƒ.ParticleEffect;
    private particleEffectData: ƒ.ParticleData.Effect;
    private idInterval: number;

    private tree: ƒui.CustomTree<ƒ.ParticleData.EffectRecursive>;
    private controller: ControllerTreeParticleSystem;

    constructor(_container: ComponentContainer, _state: Object) {
        super(_container, _state);
        this.setParticleEffect(null);

        this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
        this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
    }

    //#region  ContextMenu
    protected openContextMenu = (_event: Event): void => {
      let focus: ƒ.ParticleData.EffectRecursive = this.tree.getFocussed();
      this.contextMenu.items.forEach(_item => _item.visible = false);
      let popup: boolean = false;
      
      if (focus == this.particleEffectData.color || ƒ.ParticleData.isTransformation(focus)) {
        [
          this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_CONSTANT_NAMED)),
          this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_FUNCTION_NAMED))
        ].forEach(_item => {
          _item.visible = true;
          _item.submenu.items.forEach(_subItem => _subItem.visible = false);
          let labels: string[] = focus == this.particleEffectData.color ? ViewParticleSystem.COLOR_KEYS : ViewParticleSystem.TRANSFORMATION_KEYS;
          labels
            .filter(_value => !Object.keys(focus).includes(_value))
            .forEach(_label => _item.submenu.items.find(_item => _item.label == _label).visible = true);
        });
        popup = true;
      }

      if (focus == this.particleEffectData.variables || ƒ.ParticleData.isFunction(focus)) {
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_CONSTANT)).visible = true;
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_FUNCTION)).visible = true;
        popup = true;
      }

      if (focus == this.particleEffectData.mtxLocal || focus == this.particleEffectData.mtxWorld) {
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_TRANSFORMATION)).visible = true;
        popup = true;
      }

      if (ƒ.ParticleData.isExpression(focus) || ƒ.ParticleData.isTransformation(focus)) {
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.DELETE_PARTICLE_DATA)).visible = true;
        popup = true;
      }
      
      if (popup)
        this.contextMenu.popup();
    }

    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;
      let options: string[] = [...ViewParticleSystem.TRANSFORMATION_KEYS, ...ViewParticleSystem.COLOR_KEYS];

      item = new remote.MenuItem({ 
        label: "Add Variable/Constant", 
        id: String(CONTEXTMENU.ADD_PARTICLE_CONSTANT_NAMED), 
        submenu: generateSubMenu(options, String(CONTEXTMENU.ADD_PARTICLE_CONSTANT), _callback)
      });
      menu.append(item);

      item = new remote.MenuItem({ 
        label: "Add Function", 
        id: String(CONTEXTMENU.ADD_PARTICLE_FUNCTION_NAMED), 
        submenu: generateSubMenu(options, String(CONTEXTMENU.ADD_PARTICLE_FUNCTION), _callback)
      });
      menu.append(item);

      item = new remote.MenuItem({ label: "Add Variable/Constant", id: String(CONTEXTMENU.ADD_PARTICLE_CONSTANT), click: _callback });
      menu.append(item);
      item = new remote.MenuItem({ label: "Add Function", id: String(CONTEXTMENU.ADD_PARTICLE_FUNCTION), click: _callback });
      menu.append(item);

      item = new remote.MenuItem({ 
        label: "Add Transformation", 
        id: String(CONTEXTMENU.ADD_PARTICLE_TRANSFORMATION), 
        submenu: generateSubMenu([ƒ.Matrix4x4.prototype.translate.name, ƒ.Matrix4x4.prototype.rotate.name, ƒ.Matrix4x4.prototype.scale.name], String(CONTEXTMENU.ADD_PARTICLE_TRANSFORMATION), _callback)
      });
      menu.append(item);


      item = new remote.MenuItem({ label: "Delete", id: String(CONTEXTMENU.DELETE_PARTICLE_DATA), click: _callback, accelerator: "D" });
      menu.append(item);

      return menu;

      function generateSubMenu(_options: string[], _id: string, _callback: ContextMenuCallback): Electron.Menu {
        let submenu: Electron.Menu = new remote.Menu();
        let item: Electron.MenuItem;
        _options.forEach(_option => {
          item = new remote.MenuItem({ label: _option, id: _id, click: _callback });
          submenu.append(item);
        });

        return submenu;
      }
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);
      let focus: ƒ.ParticleData.EffectRecursive = this.tree.getFocussed();

      let child: ƒ.ParticleData.EffectRecursive;
      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_PARTICLE_CONSTANT:
        case CONTEXTMENU.ADD_PARTICLE_FUNCTION:
          child = Number(_item.id) == CONTEXTMENU.ADD_PARTICLE_CONSTANT ? 
            { type: "constant", value: 0 } :
            { type: "function", function: "addition", parameters: [{ type: "constant", value: 0 }, { type: "constant", value: 0 }]};

          if (ƒ.ParticleData.isFunction(focus))
            focus.parameters.push(child);
          else if (ƒ.ParticleData.isTransformation(focus) || focus == this.particleEffectData.color) 
            focus[_item.label] = child;
          else if (focus == this.particleEffectData.variables) 
            focus[`variable${Object.keys(focus).length}`] = child;
          
          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          break;
        case CONTEXTMENU.ADD_PARTICLE_TRANSFORMATION:
          if (Array.isArray(focus)) {
            child = { type: "transformation", transformation: <ƒ.ParticleData.Transformation["transformation"]>_item.label };
            focus.push(child);

            this.tree.findVisible(focus).expand(true);
            this.tree.findVisible(child).focus();
          }
          break;
        case CONTEXTMENU.DELETE_PARTICLE_DATA:
          if (!focus)
            return;
          let remove: ƒ.Serialization[] = this.controller.delete([focus]);
          this.tree.delete(remove);
          this.dom.dispatchEvent(new Event(EVENT_EDITOR.MODIFY, { bubbles: true }));
          break;
      }
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
      this.recreateTree(this.particleEffectData);
      if (this.idInterval == undefined)
        this.idInterval = window.setInterval(() => { this.dispatch(EVENT_EDITOR.ANIMATE, { bubbles: true, detail: { graph: this.graph} }); }, 1000 / 30);
    }


    private recreateTree(_particleEffectData: ƒ.Serialization): void {
      this.controller = new ControllerTreeParticleSystem();
      let newTree: ƒui.CustomTree<ƒ.Serialization> = 
        new ƒui.CustomTree<ƒ.Serialization>( this.controller, _particleEffectData );

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
    //#endregion
  }
}
