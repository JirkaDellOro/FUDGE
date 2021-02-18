namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  
  export class Controller {
    private interactionMode: IInteractionMode;
    private currentControlMode: AbstractControlMode;
    private viewport: ƒ.Viewport;
    private editableNode: ƒ.Node;
    // could make an array of Array<{someinterface, string}> to support undo for different objects
    // or just think of some smarter  way of doing undo, e.g. storing the reverse functions
    private states: Array<string> = [];
    private currentState: number = -1;
    private dom: HTMLElement;
    // TODO: change those shortcuts
    private controlModesMap: Map<ControlMode, {type: AbstractControlMode, shortcut: string}> = new Map([
      [ControlMode.OBJECT_MODE, {type: new ObjectMode(), shortcut: "o"}],
      [ControlMode.EDIT_MODE, {type: new EditMode(), shortcut: "e"}]
    ]); 

    constructor(_viewport: ƒ.Viewport, _editableNode: ƒ.Node, _dom: HTMLElement) {
      this.viewport = _viewport;
      this.currentControlMode = this.controlModesMap.get(ControlMode.OBJECT_MODE).type;
      this.editableNode = _editableNode;
      this.dom = _dom;
      this.saveState((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState());
      this.setInteractionMode(InteractionModes.IDLE);
    }

    public get controlMode(): AbstractControlMode {
      return this.currentControlMode;
    }

    public get controlModes(): Map<ControlMode, {type: AbstractControlMode, shortcut: string}> {
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
    
    public getInteractionModeType(): InteractionModes {
      return this.interactionMode.type;
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
        let selectedMode: InteractionModes;
        for (let interactionMode in this.currentControlMode.modes) {
          if (this.currentControlMode.modes[interactionMode].shortcut === pressedKey) {
            selectedMode = <InteractionModes> interactionMode;
          }
        }
        if (selectedMode)
          this.setInteractionMode(selectedMode);
      }
    }
    
    public setControlMode(mode: ControlMode): void {
      if (!mode)
        return;
      this.currentControlMode.formerMode = this.interactionMode;
      this.currentControlMode = this.controlModesMap.get(mode).type;
      console.log(mode);
      this.interactionMode?.cleanup();
      this.interactionMode = this.currentControlMode.formerMode || new IdleMode(this.viewport, this.editableNode);
      this.interactionMode.initialize(); 
      ƒ.EventTargetStatic.dispatchEvent(new CustomEvent(ModellerEvents.SELECTION_UPDATE, { bubbles: true, detail: this.interactionMode.selection }));
      this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));     
      console.log("Current Mode: " + this.interactionMode.type);
    }

    // maybe add type attributes to the interaction modes to alter behaviour based on those attributes
    public setInteractionMode(mode: InteractionModes): void {
      this.interactionMode?.cleanup();
      let type: any = this.currentControlMode.modes[mode]?.type || IdleMode;
      let selection: Array<number> = this.interactionMode?.selection;        
      this.interactionMode = new type(this.viewport, this.editableNode, selection);

      if (selection && this.controlMode.type === ControlMode.EDIT_MODE)
        this.interactionMode.selection = selection;
      
      this.interactionMode.initialize();
      ƒ.EventTargetStatic.dispatchEvent(new CustomEvent(ModellerEvents.SELECTION_UPDATE, { bubbles: true, detail: this.interactionMode.selection }));
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