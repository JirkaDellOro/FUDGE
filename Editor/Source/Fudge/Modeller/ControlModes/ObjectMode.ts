namespace Fudge {
  export class ObjectMode extends AbstractControlMode {
    public type: CONTROL_MODE = CONTROL_MODE.OBJECT_MODE; 

    public modes: {[mode in INTERACTION_MODE]?: {type: typeof InteractionMode, shortcut: string}} = 
    {
      [INTERACTION_MODE.ROTATE]: {type: ObjectRotation, shortcut: "r"},
      [INTERACTION_MODE.TRANSLATE]: {type: ObjectTranslation, shortcut: "t"},
      [INTERACTION_MODE.SCALE]: {type: ObjectScalation, shortcut: "c"}
    };
  }
} 