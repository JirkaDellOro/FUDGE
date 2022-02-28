namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  enum Menu {
    COMPONENTMENU = "Add Components"
  }

  // TODO: examin problem with ƒ.Material when using "typeof ƒ.Mutable" as key to the map
  let resourceToComponent: Map<Function, typeof ƒ.Component> = new Map<Function, typeof ƒ.Component>([
    [ƒ.Audio, ƒ.ComponentAudio],
    [ƒ.Material, ƒ.ComponentMaterial],
    [ƒ.Mesh, ƒ.ComponentMesh]
  ]);

  /**
   * View all components attached to a node
   * @author Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class ViewComponents extends View {
    private node: ƒ.Node;
    private expanded: { [type: string]: boolean } = { ComponentTransform: true };
    private selected: string = "ComponentTransform";

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);
      this.fillContent();

      this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.FOCUS_NODE, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      // this.dom.addEventListener(ƒUi.EVENT.RENAME, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.DELETE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.EXPAND, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.COLLAPSE, this.hndEvent);
      this.dom.addEventListener(ƒUi.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener(EVENT_EDITOR.TRANSFORM, this.hndTransform);
      this.dom.addEventListener(ƒUi.EVENT.CLICK, this.hndEvent, true);
      this.dom.addEventListener(ƒUi.EVENT.KEY_DOWN, this.hndEvent, true);
    }

    //#region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;
      item = new remote.MenuItem({
        label: "Add Component",
        submenu: ContextMenu.getSubclassMenu(CONTEXTMENU.ADD_COMPONENT, ƒ.Component, _callback)
      });
      menu.append(item);
      item = new remote.MenuItem({
        label: "Add Joint",
        submenu: ContextMenu.getSubclassMenu(CONTEXTMENU.ADD_JOINT, ƒ.Joint, _callback)
      });
      menu.append(item);

      // ContextMenu.appendCopyPaste(menu);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);
      let iSubclass: number = _item["iSubclass"];
      let component: typeof ƒ.Component;

      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_COMPONENT:
          component = ƒ.Component.subclasses[iSubclass];
          break;
        case CONTEXTMENU.ADD_JOINT:
          component = ƒ.Joint.subclasses[iSubclass];
      }
      //@ts-ignore
      let cmpNew: ƒ.Component = new component();
      ƒ.Debug.info(cmpNew.type, cmpNew);

      this.node.addComponent(cmpNew);
      this.dom.dispatchEvent(new CustomEvent(ƒUi.EVENT.SELECT, { bubbles: true, detail: { data: this.node } }));
    }
    //#endregion

    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      if (!this.node)
        return;
      if (this.dom != _event.target)
        return;

      if (!(_viewSource instanceof ViewInternal || _viewSource instanceof ViewScript))
        return;

      for (let source of _viewSource.getDragDropSources()) {
        if (source instanceof ScriptInfo) {
          if (!source.isComponent)
            return;
        } else if (!this.findComponentType(source))
          return;
      }

      _event.dataTransfer.dropEffect = "link";
      _event.preventDefault();
      _event.stopPropagation();
    }

    protected hndDrop(_event: DragEvent, _viewSource: View): void {
      for (let source of _viewSource.getDragDropSources()) {
        let cmpNew: ƒ.Component = this.createComponent(source);
        this.node.addComponent(cmpNew);
        this.expanded[cmpNew.type] = true;
      }
      this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
    }

    private fillContent(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      let cntEmpty: HTMLDivElement = document.createElement("div");
      cntEmpty.textContent = "Drop internal resources or use right click to create new components";
      this.dom.title = "Drop internal resources or use right click to create new components";

      if (!this.node || !(this.node instanceof ƒ.Node)) {  // TODO: examine, if anything other than node can appear here...
        this.setTitle("Components");
        this.dom.title = "Select node to edit components";
        cntEmpty.textContent = "Select node to edit components";
        this.dom.append(cntEmpty);
        return;
      }

      this.setTitle("Components | " + this.node.name);

      let components: ƒ.Component[] = this.node.getAllComponents();
      if (!components.length) {
        this.dom.append(cntEmpty);
        return;
      }

      for (let component of components) {
        let details: ƒUi.Details = ƒUi.Generator.createDetailsFromMutable(component);
        let controller: ControllerComponent = new ControllerComponent(component, details);
        Reflect.set(details, "controller", controller); // insert a link back to the controller
        details.expand(this.expanded[component.type]);
        this.dom.append(details);
        if (component instanceof ƒ.ComponentRigidbody) {
          let pivot: HTMLElement = controller.domElement.querySelector("[key=mtxPivot");
          let opacity: string = pivot.style.opacity;
          setPivotOpacity(null);
          controller.domElement.addEventListener(ƒUi.EVENT.MUTATE, setPivotOpacity);
          function setPivotOpacity(_event: Event): void {
            let initialization: ƒ.BODY_INIT = controller.getMutator({ initialization: 0 }).initialization;
            pivot.style.opacity = initialization == ƒ.BODY_INIT.TO_PIVOT ? opacity : "0.3";
          }
        }
        if (details.getAttribute("key") == this.selected)
          this.select(details, false);
      }
    }

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        // case ƒui.EVENT.RENAME: break;
        case EVENT_EDITOR.SET_GRAPH:
        case EVENT_EDITOR.FOCUS_NODE:
          this.node = _event.detail;
        case EVENT_EDITOR.UPDATE:
          this.fillContent();
          break;
        case ƒUi.EVENT.DELETE:
          let component: ƒ.Component = _event.detail.mutable;
          this.node.removeComponent(component);
          this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
          break;
        case ƒUi.EVENT.KEY_DOWN:
        case ƒUi.EVENT.CLICK:
          if (_event instanceof KeyboardEvent && _event.code != ƒ.KEYBOARD_CODE.SPACE)
            break;
          let target: ƒUi.Details = <ƒUi.Details>_event.target;
          if (target.tagName == "SUMMARY")
            target = <ƒUi.Details>target.parentElement;
          if (!(_event.target instanceof HTMLDetailsElement || (<HTMLElement>_event.target)))
            break;
          try {
            if (this.dom.replaceChild(target, target)) {
              if (_event instanceof KeyboardEvent || this.getSelected() != target) {
                target.expand(true);
                _event.preventDefault();
              }
              this.select(target);
            }
          } catch (_e: unknown) { /* */ }
          break;
        case ƒUi.EVENT.EXPAND:
        case ƒUi.EVENT.COLLAPSE:
          this.expanded[(<ƒUi.Details>_event.target).getAttribute("type")] = (_event.type == ƒUi.EVENT.EXPAND);
        default:
          break;
      }
    }

    private hndTransform = (_event: CustomEvent): void => {
      if (!this.getSelected())
        return;

      let controller: ControllerComponent = Reflect.get(this.getSelected(), "controller");
      let component: ƒ.Component = <ƒ.Component>controller.getMutable();
      let mtxTransform: ƒ.Matrix4x4 = Reflect.get(component, "mtxLocal") || Reflect.get(component, "mtxPivot");
      if (!mtxTransform)
        return;

      let dtl: ƒ.General = _event.detail;
      let mtxCamera: ƒ.Matrix4x4 = (<ƒ.ComponentCamera>dtl.camera).node.mtxWorld;
      let distance: number = mtxCamera.getTranslationTo(this.node.mtxWorld).magnitude;
      if (dtl.transform == TRANSFORM.ROTATE)
        [dtl.x, dtl.y] = [dtl.y, dtl.x];

      let value: ƒ.Vector3 = new ƒ.Vector3();
      value.x = (dtl.restriction == "x" ? !dtl.inverted : dtl.inverted) ? dtl.x : undefined;
      value.y = (dtl.restriction == "y" ? !dtl.inverted : dtl.inverted) ? -dtl.y : undefined;
      value.z = (dtl.restriction == "z" ? !dtl.inverted : dtl.inverted) ?
        ((value.x == undefined) ? -dtl.y : dtl.x) : undefined;
      value = value.map((_c: number) => _c || 0);

      if (mtxTransform instanceof ƒ.Matrix4x4)
        this.transform3(dtl.transform, value, mtxTransform, distance);
      if (mtxTransform instanceof ƒ.Matrix3x3)
        this.transform2(dtl.transform, value.toVector2(), mtxTransform, 1);
    }

    private transform3(_transform: TRANSFORM, _value: ƒ.Vector3, _mtxTransform: ƒ.Matrix4x4, _distance: number): void {
      switch (_transform) {
        case TRANSFORM.TRANSLATE:
          let factorTranslation: number = 0.001; // TODO: eliminate magic numbers
          _value.scale(factorTranslation * _distance);
          let translation: ƒ.Vector3 = _mtxTransform.translation;
          translation.add(_value);
          _mtxTransform.translation = translation;
          break;
        case TRANSFORM.ROTATE:
          let factorRotation: number = 1; // TODO: eliminate magic numbers
          _value.scale(factorRotation);
          let rotation: ƒ.Vector3 = _mtxTransform.rotation;
          rotation.add(_value);
          _mtxTransform.rotation = rotation;
          break;
        case TRANSFORM.SCALE:
          let factorScaling: number = 0.001; // TODO: eliminate magic numbers
          _value.scale(factorScaling);
          let scaling: ƒ.Vector3 = _mtxTransform.scaling;
          scaling.add(_value);
          _mtxTransform.scaling = scaling;
          break;
      }
    }

    private transform2(_transform: TRANSFORM, _value: ƒ.Vector2, _mtxTransform: ƒ.Matrix3x3, _distance: number): void {
      switch (_transform) {
        case TRANSFORM.TRANSLATE:
          let factorTranslation: number = 0.001; // TODO: eliminate magic numbers
          _value.scale(factorTranslation * _distance);
          let translation: ƒ.Vector2 = _mtxTransform.translation;
          translation.add(_value);
          _mtxTransform.translation = translation;
          break;
        case TRANSFORM.ROTATE:
          let factorRotation: number = 1; // TODO: eliminate magic numbers
          _value.scale(factorRotation);
          _mtxTransform.rotation += _value.x;
          break;
        case TRANSFORM.SCALE:
          let factorScaling: number = 0.001; // TODO: eliminate magic numbers
          _value.scale(factorScaling);
          let scaling: ƒ.Vector2 = _mtxTransform.scaling;
          scaling.add(_value);
          _mtxTransform.scaling = scaling;
          break;
      }
    }

    private select(_details: ƒUi.Details, _focus: boolean = true): void {
      for (let child of this.dom.children)
        child.classList.remove("selected");
      _details.classList.add("selected");
      this.selected = _details.getAttribute("key");
      if (_focus)
        _details.focus();
    }

    private getSelected(): ƒUi.Details {
      for (let child of this.dom.children)
        if (child.classList.contains("selected"))
          return <ƒUi.Details>child;
    }

    private createComponent(_resource: Object): ƒ.Component {
      if (_resource instanceof ScriptInfo)
        if (_resource.isComponent)
          return new (<ƒ.General>_resource.script)();

      let typeComponent: typeof ƒ.Component = this.findComponentType(_resource);
      return new (<ƒ.General>typeComponent)(_resource);
    }

    private findComponentType(_resource: Object): typeof ƒ.Component {
      for (let entry of resourceToComponent)
        if (_resource instanceof entry[0])
          return entry[1];
    }
  }
}