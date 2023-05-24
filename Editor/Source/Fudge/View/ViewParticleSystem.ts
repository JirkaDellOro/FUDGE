namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View and edit a particle system attached to a node.
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class ViewParticleSystem extends View {
    public static readonly PROPERTY_KEYS: (keyof ƒ.ParticleData.System)[] = ["variables", "mtxLocal", "mtxWorld", "color"];
    
    private cmpParticleSystem: ƒ.ComponentParticleSystem;
    private particleSystem: ƒ.ParticleSystem;
    private data: ƒ.ParticleData.System;
    
    private toolbar: HTMLDivElement;
    private toolbarIntervalId: number;
    private timeScalePlay: number;
    
    private tree: ƒui.CustomTree<ƒ.ParticleData.Recursive>;
    private controller: ControllerTreeParticleSystem;
    private errors: [ƒ.ParticleData.Expression, string][] = [];
    private variables: HTMLDataListElement;

    constructor(_container: ComponentContainer, _state: Object) {
        super(_container, _state);
        this.createToolbar();
        this.setParticleSystem(null);
        this.dom.addEventListener(EVENT_EDITOR.CREATE, this.hndEvent);
        this.dom.addEventListener(EVENT_EDITOR.DELETE, this.hndEvent);
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
      
      if (focus == this.data.variables || focus == this.data.color || ƒ.ParticleData.isFunction(focus) || ƒ.ParticleData.isTransformation(focus)) {
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_CONSTANT)).visible = true;
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_FUNCTION)).visible = true;
        this.contextMenu.getMenuItemById(String(CONTEXTMENU.ADD_PARTICLE_CODE)).visible = true;
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

      item = new remote.MenuItem({ label: "Add Value", id: String(CONTEXTMENU.ADD_PARTICLE_CONSTANT), click: _callback });
      menu.append(item);
      item = new remote.MenuItem({ label: "Add Function", id: String(CONTEXTMENU.ADD_PARTICLE_FUNCTION), click: _callback });
      menu.append(item);
      item = new remote.MenuItem({ label: "Add Code", id: String(CONTEXTMENU.ADD_PARTICLE_CODE), click: _callback });
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
          child = [];
        case CONTEXTMENU.ADD_PARTICLE_CONSTANT:
          if (!child)
            child = { value: 1 };
        case CONTEXTMENU.ADD_PARTICLE_FUNCTION:
          if (!child)
            child = { function: ƒ.ParticleData.FUNCTION.ADDITION, parameters: []};
        case CONTEXTMENU.ADD_PARTICLE_CODE:
          if (!child)
            child = { code: "1" };

          if (ƒ.ParticleData.isFunction(focus) || ƒ.ParticleData.isTransformation(focus))
            focus.parameters.push(<ƒ.ParticleData.Expression>child);
          else if (focus == this.data) {
            focus[_item.label] = child;
            if (_item.label == "variables")
              this.data.variableNames = [];
          }
          else if (focus == this.data.variables) {
            this.data.variables.push(<ƒ.ParticleData.Expression>child);
            this.data.variableNames.push(this.controller.generateNewVariableName());
          }
          else if (focus == this.data.color)
            this.data.color.push(<ƒ.ParticleData.Expression>child);

          this.controller.childToParent.set(child, focus);
          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          this.dispatch(EVENT_EDITOR.CREATE, {});
          break;
        case CONTEXTMENU.ADD_PARTICLE_TRANSFORMATION:
          child = { transformation: <ƒ.ParticleData.Transformation["transformation"]>_item.label, parameters: [] };
          (<ƒ.ParticleData.Transformation[]>focus).push(child);

          this.controller.childToParent.set(child, focus);
          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          this.dispatch(EVENT_EDITOR.CREATE, {});
          break;
        case CONTEXTMENU.DELETE_PARTICLE_DATA:
          let remove: ƒ.Serialization[] = this.controller.delete([focus]);
          this.tree.delete(remove);
          this.tree.clearSelection();
          this.dispatch(EVENT_EDITOR.DELETE, {});
          break;
      }
    }
    //#endregion

    //#region event handling
    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      _event.dataTransfer.dropEffect = "none";

      let source: Object = _viewSource.getDragDropSources()[0];
      if (source instanceof ƒ.Node)
        source = source.getComponent(ƒ.ComponentParticleSystem)
      if (!(source instanceof ƒ.ComponentParticleSystem))
        return;

      _viewSource.getDragDropSources()[0] = source;
      _event.dataTransfer.dropEffect = "link";
      _event.preventDefault();
      _event.stopPropagation();
    }

    protected hndDrop(_event: DragEvent, _viewSource: View): void {
      this.cmpParticleSystem = <ƒ.ComponentParticleSystem>_viewSource.getDragDropSources()[0];
      this.timeScalePlay = this.cmpParticleSystem.timeScale;
      this.setTime(0);
      this.setParticleSystem(this.cmpParticleSystem.particleSystem);
    }

    private hndEvent = async (_event: EditorEvent): Promise<void> => {
      _event.stopPropagation();
      switch (_event.type) {
        case EVENT_EDITOR.CLOSE:
          window.clearInterval(this.toolbarIntervalId);
          document.removeEventListener(ƒui.EVENT.KEY_DOWN, this.hndEvent);
          this.enableSave(true);
          break;
        case ƒui.EVENT.KEY_DOWN:
          if (this.errors.length > 0 && _event instanceof KeyboardEvent && _event.code == ƒ.KEYBOARD_CODE.S && _event.ctrlKey)
            ƒui.Warning.display(this.errors.map(([_data, _error]) => _error), "Unable to save", `Project can't be saved while having unresolved errors`, "OK");
          break;
        case EVENT_EDITOR.MODIFY:
          this.tree.findVisible(_event.detail.data)?.refreshContent();
          break;
        case EVENT_EDITOR.CREATE:
        case EVENT_EDITOR.DELETE:
        case ƒui.EVENT.RENAME:
        case ƒui.EVENT.DELETE:
        case ƒui.EVENT.DROP:
        case ƒui.EVENT.CUT: // TODO: customs trees cut is async, this should happen after cut is finished
        case ƒui.EVENT.PASTE:
          this.refreshVariables();
        case ƒui.EVENT.EXPAND:
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
          if (this.errors.length == 0 && _event.type != ƒui.EVENT.EXPAND) {
            this.particleSystem.data = JSON.parse(JSON.stringify(this.data)); // our working copy should only be used if it is valid 
          } else {
            this.errors.forEach(([_data, _error]) => {
              let item: ƒui.CustomTreeItem<ƒ.ParticleData.Recursive> = this.tree.findVisible(_data);
              if (!item) return;
              item.classList.add("invalid");
              item.title = _error;
            });
          }
          this.enableSave(this.errors.length == 0);
          break;
      }
    }
    //#endregion

    //#region toolbar
    private createToolbar(): void {
      this.toolbar = document.createElement("div");
      this.toolbar.id = "toolbar";
      this.toolbar.title = "● Control the playback of the selected particle system\n● Right click render view to activate continous rendering";

      let buttons: HTMLDivElement = document.createElement("div");
      buttons.id = "buttons";
      ["backward", "play", "forward"]
        .map(_id => {
          let button: HTMLButtonElement = document.createElement("button");
          button.id = _id;
          button.classList.add("buttonIcon");
          button.onclick = (_event: MouseEvent) => {
            let timeScale: number = this.cmpParticleSystem.timeScale;
            switch ((<HTMLInputElement>_event.target).id) {
              case "backward":
                timeScale -= 0.2;
                break;
              case "play":
                timeScale = this.timeScalePlay;
                break;
              case "pause":
                this.timeScalePlay = timeScale;
                timeScale = 0;
                break;
              case "forward":
                timeScale += 0.2;
                break;
            }
            this.setTimeScale(timeScale);
          };
          return button;
        })
        .forEach(_button => buttons.appendChild(_button));
        this.toolbar.appendChild(buttons);

      let timeScaleStepper: ƒui.CustomElementStepper = new ƒui.CustomElementStepper({key: "timeScale", label: "timeScale"});
      timeScaleStepper.id = "timescale"
      timeScaleStepper.oninput = () => {
        this.setTimeScale(timeScaleStepper.getMutatorValue());
      };
      this.toolbar.appendChild(timeScaleStepper);

      let timeStepper: ƒui.CustomElementStepper = new ƒui.CustomElementStepper({key: "time", label: "time", value: "0"});
      timeStepper.id = "time";
      timeStepper.title = "The time (in seconds) of the particle system";
      timeStepper.oninput = () => {
        this.setTime(timeStepper.getMutatorValue());
      };
      this.toolbar.appendChild(timeStepper);

      let timeSliderSteps: HTMLDivElement = document.createElement("div");
      timeSliderSteps.id = "timeslidersteps";
      this.toolbar.appendChild(timeSliderSteps);

      let timeSlider: HTMLInputElement = document.createElement("input");
      timeSlider.id = "timeslider";
      timeSlider.type = "range";
      timeSlider.value = "0";
      timeSlider.min = "0";
      timeSlider.max = "1";
      timeSlider.step = "any";
      timeSlider.oninput = () => {
        this.setTime(parseFloat(timeSlider.value));
      };
      this.toolbar.appendChild(timeSlider);

      this.toolbarIntervalId = window.setInterval(() => {
        if (this.cmpParticleSystem) {
          let timeInSeconds: number = this.cmpParticleSystem.time / 1000;
          timeScaleStepper.setMutatorValue(this.cmpParticleSystem.timeScale);
          timeStepper.setMutatorValue(timeInSeconds);
          
          let duration: number = this.cmpParticleSystem.duration / 1000;
          if (parseFloat(timeSlider.max) != duration * 1.1) { // value has changed
            timeSlider.max = (duration * 1.1).toString();
            timeSliderSteps.innerHTML = [0, 0.25, 0.5, 0.75, 1]
              .map(_factor => duration * _factor)
              .map(_value => `<span data-label="${_value.toFixed(2)}"></span>`).join("");
          }
          timeSlider.value = timeInSeconds.toString();
        }
      }, 1000 / 30);
    }
    
    private setTime(_timeInSeconds: number) {
      this.setTimeScale(0);
      this.cmpParticleSystem.time = _timeInSeconds * 1000;
    }

    private setTimeScale(_timeScale: number) {
      _timeScale = parseFloat(_timeScale.toFixed(15)); // round so forward and backward button don't miss zero
      if (_timeScale != 0)
        this.timeScalePlay = _timeScale;
        this.cmpParticleSystem.timeScale = _timeScale;

      let playButton: Element = this.toolbar.querySelector("#play") || this.toolbar.querySelector("#pause");
      playButton.id = _timeScale == 0 ? "play" : "pause";
    }

    //#endregion

    private setParticleSystem(_particleSystem: ƒ.ParticleSystem): void {
      if (!_particleSystem) {
        this.particleSystem = undefined;
        this.tree = undefined;
        this.dom.innerHTML = "Drop a node with an attached component particle system here to edit";
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
      this.dom.appendChild(this.toolbar);
      this.controller = new ControllerTreeParticleSystem(this.data, this);
      this.tree = new ƒui.CustomTree<ƒ.ParticleData.Recursive>(this.controller, this.data);
      this.tree.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.DROP, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.DELETE, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.CUT, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.PASTE, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.EXPAND, this.hndEvent);
      this.tree.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.appendChild(this.tree);
      this.dom.title = `● Right click on "${ƒ.ParticleSystem.name}" to add properties.\n● Right click on properties to add transformations/expressions.\n● Right click on transformations/expressions to add expressions.\n● Use Copy/Cut/Paste to duplicate data.`;
      this.tree.title = this.dom.title;
    }

    private validateData(_data: ƒ.ParticleData.Recursive): [ƒ.ParticleData.Expression, string][] {
      let invalid: [ƒ.ParticleData.Expression, string][] = [];
      validateRecursive(_data);
      return invalid;

      function validateRecursive(_data: ƒ.ParticleData.Recursive, _path: string[] = []): void {
        if (ƒ.ParticleData.isFunction(_data)) {
          let minParameters: number = ƒ.ParticleData.FUNCTION_MINIMUM_PARAMETERS[_data.function];
          if (_data.parameters.length < ƒ.ParticleData.FUNCTION_MINIMUM_PARAMETERS[_data.function]) {
            let error: string = `"${_path.join("/")}/${_data.function}" needs at least ${minParameters} parameters`;
            invalid.push([_data, error]);
          }
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
        options.push(...this.data.variableNames);
      this.variables.innerHTML = options.map(_name => `<option value="${_name}">`).join("");
    }
  }
}