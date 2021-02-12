namespace Fudge {
  export class EditMode extends AbstractControlMode {
    public type: ControlMode = ControlMode.EDIT_MODE; 
    public modes: {[mode in InteractionModes]?: {type: typeof InteractionMode, shortcut: string}} = 
    {
      [InteractionModes.SELECT]: {type: EditSelection, shortcut: "s"}, 
      [InteractionModes.ROTATE]: {type: EditRotation, shortcut: "r"},
      [InteractionModes.TRANSLATE]: {type: EditTranslation, shortcut: "t"},
      [InteractionModes.EXTRUDE]: {type: Extrude, shortcut: "e"},
      [InteractionModes.SCALE]: {type: EditScalation, shortcut: "c"}
    };
  }
} 