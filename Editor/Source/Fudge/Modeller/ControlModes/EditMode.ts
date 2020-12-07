namespace Fudge {
  export class EditMode extends AbstractControlMode {
    public type: ControlMode = ControlMode.EDIT_MODE; 
    public modes: {[mode in InteractionMode]?: {type: typeof IInteractionMode, shortcut: string}} = 
    {
      [InteractionMode.SELECT]: {type: EditSelection, shortcut: "s"}, 
      [InteractionMode.ROTATE]: {type: EditRotation, shortcut: "r"},
      [InteractionMode.TRANSLATE]: {type: EditTranslation, shortcut: "t"},
      [InteractionMode.EXTRUDE]: {type: Extrude, shortcut: "e"},
      [InteractionMode.SCALE]: {type: EditScalation, shortcut: "c"}
    };
  }
} 