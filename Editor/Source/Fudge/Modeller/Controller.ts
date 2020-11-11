namespace Fudge {
  import ƒ = FudgeCore;
  export class Controller {
    private interactionMode: IInteractionMode;
    private currentControlMode: AbstractControlMode;
    private viewport: ƒ.Viewport;
    private editableNode: ƒ.Node;
    private controlModesMap: Record<ControlMode, AbstractControlMode> = {
      [ControlMode.OBJECT_MODE]: new ObjectMode(),
      [ControlMode.EDIT_MODE]: new EditMode()
    };

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      this.viewport = viewport;
      this.currentControlMode = this.controlModesMap[ControlMode.OBJECT_MODE];
      this.editableNode = editableNode;
      this.setInteractionMode(InteractionMode.IDLE);
    }

    public get controlMode(): AbstractControlMode {
      return this.currentControlMode;
    }

    public get controlModes(): Record<ControlMode, AbstractControlMode> {
      return this.controlModesMap;
    }

    public onmouseup(_event: ƒ.EventPointer): void {
      this.interactionMode.onmouseup(_event);
    }

    public onmousedown(_event: ƒ.EventPointer): void {
      this.interactionMode.onmousedown(_event);
    }

    public onmove(_event: ƒ.EventPointer): void {
      this.interactionMode.onmove(_event);
    }

    public switchMode(_event: ƒ.EventKeyboard): void {
      if (_event.ctrlKey) {
        switch (_event.key) {
          case "e": 
            this.setControlMode(ControlMode.EDIT_MODE);
            break;
          case "n": 
            this.setControlMode(ControlMode.OBJECT_MODE);
            break;
          default: 
            let selectedMode: InteractionMode;
            for (let mode in this.currentControlMode.modes) {
              if (this.currentControlMode.modes[mode].shortcut === _event.key) {
                selectedMode = <InteractionMode> mode;
              }
            }
            if (selectedMode)
              this.setInteractionMode(selectedMode);
            break;
        }
      }
    }
    
    public setControlMode(mode: ControlMode): void {
      this.currentControlMode.formerMode = this.interactionMode;
      this.currentControlMode = this.controlModesMap[mode];
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
  }
}