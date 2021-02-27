namespace Fudge {
  import ƒ = FudgeCore;
  
  export class Controller {
    private interactionMode: IInteractionMode;
    private currentControlMode: IControlMode;
    private viewport: ƒ.Viewport;
    private editableNode: ƒ.Node;
    // could make an array of Array<{someinterface, string}> to support undo for different objects
    // or just think of some smarter way of doing undo, e.g. storing the reverse functions
    private states: Array<string> = [];
    private currentState: number = -1;
    private dom: HTMLElement;
    private controlModesMap: Map<CONTROL_MODE, {type: IControlMode, shortcut: string}> = new Map([
      [CONTROL_MODE.OBJECT_MODE, {type: new ObjectMode(), shortcut: "o"}],
      [CONTROL_MODE.EDIT_MODE, {type: new EditMode(), shortcut: "e"}]
    ]); 

    constructor(_viewport: ƒ.Viewport, _editableNode: ƒ.Node, _dom: HTMLElement) {
      this.viewport = _viewport;
      this.currentControlMode = this.controlModesMap.get(CONTROL_MODE.OBJECT_MODE).type;
      this.editableNode = _editableNode;
      this.dom = _dom;
      this.saveState((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState());
      this.setInteractionMode(INTERACTION_MODE.IDLE);
    }

    public get controlMode(): IControlMode {
      return this.currentControlMode;
    }

    public get controlModes(): Map<CONTROL_MODE, {type: IControlMode, shortcut: string}> {
      return this.controlModesMap;
    }

    public onmouseup(_event: ƒ.EventPointer): void {
      let state: string = this.interactionMode.onmouseup(_event);
      if (state != null) 
        this.saveState(state);
    }

    public onmousedown(_event: ƒ.EventPointer): void {
      this.interactionMode.onmousedown(_event);
    }

    public onmove(_event: ƒ.EventPointer): void {
      this.interactionMode.onmove(_event);
    }

    public onkeydown(_event: ƒ.EventKeyboard): void {
      if (_event.ctrlKey) 
        return;

      this.interactionMode.onkeydown(_event.key.toLowerCase());
    }

    public onkeyup(_event: ƒ.EventKeyboard): void {
      if (_event.ctrlKey) 
        return;
      let state: string = this.interactionMode.onkeyup(_event.key.toLowerCase());
      if (state != null) 
        this.saveState(state);
    }

    public getSelection(): number[] {
      return this.interactionMode.selection;
    }
    
    public getInteractionModeType(): INTERACTION_MODE {
      return this.interactionMode.type;
    }

    public executeAccelerator(_event: ƒ.EventKeyboard): boolean {
      return this.interactionMode.executeAccelerator(_event);
    }

    public switchMode(_event: ƒ.EventKeyboard): void {
      let pressedKey: string = _event.key.toLowerCase();
      if (_event.ctrlKey) {
        if (pressedKey === "z") {
          if (!_event.shiftKey) {
            this.loadState();
          } else {
            this.loadState(false);
          }
        }
      }


      if (_event.shiftKey) {
        for (let controlMode of this.controlModesMap.keys()) {
          if (this.controlModesMap.get(controlMode).shortcut === pressedKey) {
            this.setControlMode(controlMode);
            break;
          }
        }
        let selectedMode: INTERACTION_MODE;
        for (let interactionMode in this.currentControlMode.modes) {
          if (this.currentControlMode.modes[interactionMode].shortcut === pressedKey) {
            selectedMode = <INTERACTION_MODE> interactionMode;
          }
        }
        if (selectedMode)
          this.setInteractionMode(selectedMode);
      }
    }
    
    public setControlMode(mode: CONTROL_MODE): void {
      if (!mode)
        return;
      this.currentControlMode.formerMode = this.interactionMode;
      this.currentControlMode = this.controlModesMap.get(mode).type;
      console.log(mode);
      this.interactionMode?.cleanup();
      this.interactionMode = this.currentControlMode.formerMode || new IdleMode(this.viewport, this.editableNode);
      this.interactionMode.initialize(); 
      ƒ.EventTargetStatic.dispatchEvent(new CustomEvent(MODELLER_EVENTS.SELECTION_UPDATE, { bubbles: true, detail: {selection: this.interactionMode.selection, vertices: (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices  }}));
      ƒ.EventTargetStatic.dispatchEvent(new CustomEvent(MODELLER_EVENTS.HEADER_UPDATE, { bubbles: true}));
      this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));     
      console.log("Current Mode: " + this.interactionMode.type);
    }

    public setInteractionMode(mode: INTERACTION_MODE): void {
      this.interactionMode?.cleanup();
      let type: any = this.currentControlMode.modes[mode]?.type || IdleMode;
      let selection: Array<number> = this.interactionMode?.selection;        
      this.interactionMode = new type(this.viewport, this.editableNode, selection);

      if (selection && this.controlMode.type === CONTROL_MODE.EDIT_MODE)
        this.interactionMode.selection = selection;
      
      this.interactionMode.initialize();
      ƒ.EventTargetStatic.dispatchEvent(new CustomEvent(MODELLER_EVENTS.SELECTION_UPDATE, { bubbles: true, detail: {selection: this.interactionMode.selection, vertices: (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices  }}));
      ƒ.EventTargetStatic.dispatchEvent(new CustomEvent(MODELLER_EVENTS.HEADER_UPDATE, { bubbles: true}));
      this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
      console.log("Current Mode: " + this.interactionMode.type);
    }

    public drawSelection(): void {
      this.interactionMode.animate();
    }

    public getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {
      return this.interactionMode.getContextMenuItems(_callback);
    }

    public contextMenuCallback = (_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void => {
      this.interactionMode.contextMenuCallback(_item, _window, _event);
    }

    private loadState(isUndo: boolean = true): void {
      if (this.states.length <= 0 || (this.currentState <= 0 && isUndo) || this.currentState < 0) 
        return;

      if (isUndo) {
        this.currentState--;
      } else {
        if (this.currentState < this.states.length - 1) {
          this.currentState++;
        } else {
          return;
        }
      }
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.retrieveState(this.states[this.currentState]);
      this.interactionMode.updateAfterUndo();
    }
    
    private saveState(state: string): void {
      this.states.splice(this.currentState + 1);
      this.states.push(state);
      if (this.states.length > 20) {
        this.states.shift();
      } else {
        this.currentState++;
      }
    }
  }
}