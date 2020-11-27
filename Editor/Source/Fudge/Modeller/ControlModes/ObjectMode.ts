namespace Fudge {
  export class ObjectMode extends AbstractControlMode {
    public modes: {[mode in InteractionMode]?: {type: typeof IInteractionMode, shortcut: string}} = 
    {
      [InteractionMode.ROTATE]: {type: ObjectRotation, shortcut: "r"},
      [InteractionMode.TRANSLATE]: {type: ObjectTranslation, shortcut: "t"},
      [InteractionMode.SCALE]: {type: ObjectScalation, shortcut: "c"}
    };
  }
} 