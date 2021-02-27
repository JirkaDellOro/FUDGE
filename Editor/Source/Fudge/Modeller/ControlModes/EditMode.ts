namespace Fudge {
  export class EditMode implements IControlMode {
    public formerMode: IInteractionMode;
    public type: CONTROL_MODE = CONTROL_MODE.EDIT_MODE; 
    public modes: {[mode in INTERACTION_MODE]?: {type: typeof InteractionMode, shortcut: string}} = 
    {
      [INTERACTION_MODE.SELECT]: {type: EditSelection, shortcut: "s"}, 
      [INTERACTION_MODE.ROTATE]: {type: EditRotation, shortcut: "r"},
      [INTERACTION_MODE.TRANSLATE]: {type: EditTranslation, shortcut: "t"},
      [INTERACTION_MODE.EXTRUDE]: {type: Extrude, shortcut: "x"},
      [INTERACTION_MODE.SCALE]: {type: EditScalation, shortcut: "c"}
    };
  }
} 