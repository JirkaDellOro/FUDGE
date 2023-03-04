namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View and edit a particle system attached to a node.
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class ViewParticleSystem extends View {
    public static readonly PROPERTY_KEYS: (keyof ƒ.ParticleData.System)[] = ["variables", "mtxLocal", "mtxWorld", "color"];
    public static readonly TRANSFORMATION_KEYS: (keyof ƒ.ParticleData.Transformation)[] = ["x", "y", "z"];
    public static readonly COLOR_KEYS: (keyof ƒ.ParticleData.Color)[] = ["r", "g", "b", "a"];

    private particleSystem: ƒ.ParticleSystem;
    private data: ƒ.ParticleData.System;

    private tree: ƒui.CustomTree<ƒ.ParticleData.Recursive>;
    private controller: ControllerTreeParticleSystem;

    private errors: [ƒ.ParticleData.Expression, string][] = [];
    private variables: HTMLDataListElement;

    constructor(_container: ComponentContainer, _state: Object) {
        super(_container, _state);
        this.setParticleSystem(null);
        this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
        this.dom.addEventListener(EVENT_EDITOR.CLOSE, this.hndEvent);
        document.addEventListener(ƒui.EVENT.KEY_DOWN, this.hndEvent);
    }

    //#region context menu
    protected openContextMenu = (_event: Event): void => {
      let focus: ƒ.ParticleData.Recursive = this.tree.getFocussed();
      if (!focus)
        return;
      this.contextMenu.items.forEach(_item => _item.visible = false);
      let popup: boolean = false;

      if (focus == this.data) {
        let item: Electron.MenuItem = this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_PROPERTY));
        item.visible = true;
        item.submenu.items.forEach(_subItem => _subItem.visible = false);
        ViewParticleSystem.PROPERTY_KEYS
          .filter(_value => !Object.keys(focus).includes(_value))
          .forEach(_label => item.submenu.items.find(_item => _item.label == _label).visible = true);
        popup = true;
      }
      
      if (focus == this.data.color || ƒ.ParticleData.isTransformation(focus)) {
        [
          this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_CONSTANT_NAMED)),
          this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_FUNCTION_NAMED))
        ].forEach(_item => {
          _item.visible = true;
          _item.submenu.items.forEach(_subItem => _subItem.visible = false);
          let labels: string[] = focus == this.data.color ? ViewParticleSystem.COLOR_KEYS : ViewParticleSystem.TRANSFORMATION_KEYS;
          labels
            .filter(_value => !Object.keys(focus).includes(_value))
            .forEach(_label => _item.submenu.items.find(_item => _item.label == _label).visible = true);
        });
        popup = true;
      }

      if (focus == this.data.variables || ƒ.ParticleData.isFunction(focus)) {
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_CONSTANT)).visible = true;
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_FUNCTION)).visible = true;
        popup = true;
      }

      if (focus == this.data.mtxLocal || focus == this.data.mtxWorld) {
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_TRANSFORMATION)).visible = true;
        popup = true;
      }

      if (focus != this.data) {
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.DELETE_PARTICLE_DATA)).visible = true;
        popup = true;
      }
      
      if (popup)
        this.contextMenu.popup();
    }

    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;
      let options: string[] = ViewParticleSystem.PROPERTY_KEYS;
      
      item = new remote.MenuItem({ 
        label: "Add Property", 
        id: String(CONTEXTMENU.ADD_PARTICLE_PROPERTY), 
        submenu: generateSubMenu(options, String(CONTEXTMENU.ADD_PARTICLE_PROPERTY), _callback)
      });
      menu.append(item);
      
      options = [...ViewParticleSystem.TRANSFORMATION_KEYS, ...ViewParticleSystem.COLOR_KEYS];
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
      let focus: ƒ.ParticleData.Recursive = this.tree.getFocussed();
      if (!focus)
        return;

      let child: ƒ.ParticleData.Recursive;
      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_PARTICLE_PROPERTY:
        case CONTEXTMENU.ADD_PARTICLE_CONSTANT:
        case CONTEXTMENU.ADD_PARTICLE_FUNCTION:
          switch (Number(_item.id)) {
            case CONTEXTMENU.ADD_PARTICLE_PROPERTY:
              child = _item.label == "mtxWorld" || _item.label == "mtxLocal" ? [] : {};
              break;
            case CONTEXTMENU.ADD_PARTICLE_CONSTANT:
              child = { value: 1 };
              break;
            case CONTEXTMENU.ADD_PARTICLE_FUNCTION:
              child = { function: ƒ.ParticleData.FUNCTION.ADDITION, parameters: []};
              break;
          }

          if (ƒ.ParticleData.isFunction(focus))
            focus.parameters.push(<ƒ.ParticleData.Expression>child);
          else if (ƒ.ParticleData.isTransformation(focus) || focus == this.data.color || focus == this.data) 
            focus[_item.label] = child;
          else if (focus == this.data.variables) 
            focus[`variable${Object.keys(focus).length}`] = child;

          this.controller.childToParent.set(child, focus);
          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          this.tree.clearSelection();
          this.tree.selectInterval(child, child);
          this.dispatch(EVENT_EDITOR.MODIFY, { detail: { data: focus } });
          break;
        case CONTEXTMENU.ADD_PARTICLE_TRANSFORMATION:
          if (Array.isArray(focus)) {
            child = { transformation: <ƒ.ParticleData.Transformation["transformation"]>_item.label };
            focus.push(child);

            this.tree.findVisible(focus).expand(true);
            this.tree.findVisible(child).focus();
            this.tree.clearSelection();
            this.tree.selectInterval(child, child);
            this.dispatch(EVENT_EDITOR.MODIFY, { detail: { data: focus } });
          }
          break;
        case CONTEXTMENU.DELETE_PARTICLE_DATA:
          let remove: ƒ.Serialization[] = this.controller.delete([focus]);
          this.tree.delete(remove);
          this.tree.clearSelection();
          this.dispatch(EVENT_EDITOR.MODIFY, { });
          break;
      }
    }
    //#endregion

    //#region  event handling
    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      _event.dataTransfer.dropEffect = "none";

      let source: Object = _viewSource.getDragDropSources()[0];
      if (source instanceof ƒ.Node)
        source = source.getComponent(ƒ.ComponentParticleSystem)?.particleSystem;
      if (!(source instanceof ƒ.ParticleSystem))
        return;

      _viewSource.getDragDropSources()[0] = source;
      _event.dataTransfer.dropEffect = "link";
      _event.preventDefault();
      _event.stopPropagation();
    }

    protected hndDrop(_event: DragEvent, _viewSource: View): void {
      let source: Object = _viewSource.getDragDropSources()[0];
      this.setParticleSystem(<ƒ.ParticleSystem>source);
    }

    private hndEvent = async (_event: EditorEvent): Promise<void> => {
      _event.stopPropagation();
      switch (_event.type) {
        case EVENT_EDITOR.CLOSE:
          document.removeEventListener(ƒui.EVENT.KEY_DOWN, this.hndEvent);
          this.enableSave(true);
          break;
        case ƒui.EVENT.KEY_DOWN:
          if (this.errors.length > 0 && _event instanceof KeyboardEvent && _event.code == ƒ.KEYBOARD_CODE.S && _event.ctrlKey)
            ƒui.Warning.display(this.errors.map(([_data, _error]) => _error), "Unable to save", `Project can't be saved while having unresolved errors`, "OK");
          break;
        case EVENT_EDITOR.MODIFY:
        case ƒui.EVENT.DELETE:
        case ƒui.EVENT.DROP:
        case ƒui.EVENT.RENAME:
        case ƒui.EVENT.CUT: // TODO: customs trees cut is async, this should happen after cut is finished
        case ƒui.EVENT.PASTE:
          this.refreshVariables();
          let invalid: [ƒ.ParticleData.Expression, string][] = this.validateData(this.data);
          this.errors
            .filter(_error => !invalid.includes(_error))
            .map(([_data]) => this.tree.findVisible(_data))
            .forEach(_item => {
              if (!_item) return;
              _item.classList.remove("invalid");
              _item.title = "";
            });
          this.errors = invalid;
          if (this.errors.length == 0) {
            this.particleSystem.data = JSON.parse(JSON.stringify(this.data)); // our working copy should only be used if it is valid 
          } else {
            this.errors.forEach(([_data, _error]) => {
              let item: ƒui.CustomTreeItem<ƒ.ParticleData.Recursive> = this.tree.findVisible(_data);
              item.classList.add("invalid");
              item.title = _error;
            });
          }
          this.enableSave(this.errors.length == 0);
          break;
      }
    }
    //#endregion

    private setParticleSystem(_particleSystem: ƒ.ParticleSystem): void {
      if (!_particleSystem) {
        this.particleSystem = undefined;
        this.tree = undefined;
        this.dom.innerHTML = "Drop a particle system here to edit";
        return;
      }

      this.particleSystem = _particleSystem;
      this.data = JSON.parse(JSON.stringify(_particleSystem.data)); // we will work with a copy
      this.setTitle(this.particleSystem.name);
      this.dom.innerHTML = "";
      this.variables = document.createElement("datalist");
      this.variables.id = "variables";
      this.dom.appendChild(this.variables);
      this.refreshVariables();
      this.controller = new ControllerTreeParticleSystem(this.data);
      let newTree: ƒui.CustomTree<ƒ.ParticleData.Recursive> = new ƒui.CustomTree<ƒ.ParticleData.Recursive>(this.controller, this.data);
      this.dom.appendChild(newTree);
      this.tree = newTree;
      this.tree.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.DROP, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.DELETE, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.CUT, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.PASTE, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.DROP, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.title = `● Right click on "${ƒ.ParticleSystem.name}" to add properties.\n● Right click on properties to add transformations/expressions.\n● Right click on transformations/expressions to add expressions.\n● Use Copy/Cut/Paste to duplicate data.`;
      this.tree.title = this.dom.title;
    }

    private validateData(_data: ƒ.ParticleData.Recursive): [ƒ.ParticleData.Expression, string][] {
      let invalid: [ƒ.ParticleData.Expression, string][] = [];
      let references: [ƒ.ParticleData.Variable, string[]][] = [];
      validateRecursive(_data);
      references
        .filter(([_data, _path]) => _path.includes("variables"))
        .map(([_data, _path]) => [_path[1], _path[_path.length - 1], _data] as [string, string, ƒ.ParticleData.Variable])
        .filter(([_from, _to], _index, _references) => {
          let indexFirstOccurence: number = _references.findIndex(([_from]) => _from == _to);
          return indexFirstOccurence >= 0 && indexFirstOccurence >= _index;
        })
        .forEach(([_from, _to, _data]) => invalid.push([_data, `variable "${_to}" is used before its declaration`]));
      invalid.forEach(([_data, _error]) => console.warn(`${ƒ.ParticleSystem.name}: ${_error}`));
      return invalid;

      function validateRecursive(_data: ƒ.ParticleData.Recursive, _path: string[] = []): void {
        if (ƒ.ParticleData.isFunction(_data)) {
          let minParameters: number = ƒ.ParticleData.FUNCTION_MINIMUM_PARAMETERS[_data.function];
          if (_data.parameters.length < ƒ.ParticleData.FUNCTION_MINIMUM_PARAMETERS[_data.function]) {
            let error: string = `"${_path.join("/")}/${_data.function}" needs at least ${minParameters} parameters`;
            invalid.push([_data, error]);
          }
        }
        if (ƒ.ParticleData.isVariable(_data)) {
          references.push([_data, _path.concat(_data.value)]);
        }
        
        Object.entries(ƒ.ParticleData.isFunction(_data) ? _data.parameters : _data).forEach(([_key, _value]) => {
          if (typeof _value == "object")
            validateRecursive(_value, _path.concat(_key));
        });
      }
    }

    private enableSave(_on: boolean): void {
      remote.Menu.getApplicationMenu().getMenuItemById(MENU.PROJECT_SAVE).enabled = _on;
    }

    private refreshVariables(): void {
      let options: string[] = Object.keys(ƒ.ParticleData.PREDEFINED_VARIABLES);
      if (this.data.variables)
        options.push(...Object.keys(this.data.variables));
      this.variables.innerHTML = options.map(_name => `<option value="${_name}">`).join("");
    }
  }
}
