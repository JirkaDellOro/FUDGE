namespace Fudge {
  import ƒ = FudgeCore;
  export class Controller {
    private interactionMode: IInteractionMode;
    private controlMode: AbstractControlMode;
    private viewport: ƒ.Viewport;
    private editableNode: ƒ.Node;

    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      this.viewport = viewport;
      this.controlMode = new ObjectMode();
      this.editableNode = editableNode;
      this.setInteractionMode(InteractionMode.IDLE);
    }

    public get ControlMode(): AbstractControlMode {
      return this.controlMode;
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
            this.setControlMode(new EditMode());
            break;
          case "n": 
            this.setControlMode(new ObjectMode());
            break;
          default: 
            let selectedMode: InteractionMode;
            for (let mode in this.controlMode.modes) {
              if (this.controlMode.modes[mode].shortcut === _event.key) {
                selectedMode = <InteractionMode> mode;
              }
            }
            if (selectedMode)
              this.setInteractionMode(selectedMode);
            break;
        }
      }
    }
    
    public setControlMode(mode: AbstractControlMode): void {
      this.controlMode = mode;
      console.log(mode);
      this.setInteractionMode(this.interactionMode.type);
    }

    public setInteractionMode(mode: InteractionMode): void {
      // mode = InteractionMode.ROTATE;
      this.interactionMode?.cleanup();
      let type: any = this.controlMode.modes[mode]?.type || IdleMode;
      let selection: Object  = this.interactionMode?.selection;        
      this.interactionMode = new type(this.viewport, this.editableNode);

      if (selection)
        this.interactionMode.selection = selection;
      
      console.log("Current Mode: " + this.interactionMode.type);
    }
  }
}