namespace Fudge {
  export class ObjectMode extends AbstractControlMode {
    public type: ControlMode = ControlMode.OBJECT_MODE; 

    public modes: {[mode in InteractionModes]?: {type: typeof InteractionMode, shortcut: string}} = 
    {
      [InteractionModes.ROTATE]: {type: ObjectRotation, shortcut: "r"},
      [InteractionModes.TRANSLATE]: {type: ObjectTranslation, shortcut: "t"},
      [InteractionModes.SCALE]: {type: ObjectScalation, shortcut: "c"}
    };
  }
} 