namespace Fudge {
  import ƒ = FudgeCore;
  export class Controller {
    private interactionMode: IInteractionMode;
    private currentControlMode: AbstractControlMode;
    private viewport: ƒ.Viewport;
    private editableNode: ƒ.Node;
    // could make an array of Array<{someinterface, string}> to support undo for different objects
    private states: Array<string> = [];
    // TODO: change those shortcuts
    private controlModesMap: Map<ControlMode, {type: AbstractControlMode, shortcut: string}> = new Map([
      [ControlMode.OBJECT_MODE, {type: new ObjectMode(), shortcut: "p"}],
      [ControlMode.EDIT_MODE, {type: new EditMode(), shortcut: "d"}]
    ]); 

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      this.viewport = viewport;
      this.currentControlMode = this.controlModesMap.get(ControlMode.OBJECT_MODE).type;
      this.editableNode = editableNode;
      this.saveState((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getState());
      this.setInteractionMode(InteractionMode.IDLE);
    }

    public get controlMode(): AbstractControlMode {
      return this.currentControlMode;
    }

    public get controlModes(): Map<ControlMode, {type: AbstractControlMode, shortcut: string}> {
      return this.controlModesMap;
    }

    public onmouseup(_event: ƒ.EventPointer): void {
      this.interactionMode.onmouseup(_event);
    }

    public onmousedown(_event: ƒ.EventPointer): void {
      let state: string = this.interactionMode.onmousedown(_event);
      if (state != null) {
        this.saveState(state);
      };
    }

    public onmove(_event: ƒ.EventPointer): void {
      this.interactionMode.onmove(_event);
    }

    public switchMode(_event: ƒ.EventKeyboard): void {
      if (_event.ctrlKey) {
        if (_event.key === "z") {
          this.loadState();
        }

        for (let controlMode of this.controlModesMap.keys()) {
          if (this.controlModesMap.get(controlMode).shortcut === _event.key) {
            this.setControlMode(controlMode);
            break;
          }
        }

        let selectedMode: InteractionMode;
        for (let interactionMode in this.currentControlMode.modes) {
          if (this.currentControlMode.modes[interactionMode].shortcut === _event.key) {
            selectedMode = <InteractionMode> interactionMode;
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
      console.log("Current Mode: " + this.interactionMode.type);
    }

    public setInteractionMode(mode: InteractionMode): void {
      this.interactionMode?.cleanup();
      let type: any = this.currentControlMode.modes[mode]?.type || IdleMode;
      let selection: Object  = this.interactionMode?.selection;        
      this.interactionMode = new type(this.viewport, this.editableNode);

      if (selection)
        this.interactionMode.selection = selection;
      
      console.log("Current Mode: " + this.interactionMode.type);
    }

    private loadState(): void {
      if (this.states.length <= 0) 
        return;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.retrieveState(this.states[this.states.length - 1]);
      this.states.pop();
    }

    private saveState(state: string): void {
      this.states.push(state);
      if (this.states.length > 20) {
        this.states.shift();
      }
    }
  }
}