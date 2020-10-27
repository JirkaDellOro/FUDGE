namespace Fudge {
  export class EditMode extends AbstractControlMode {
    public static readonly iSubclass: number = AbstractControlMode.registerSubclass(EditMode);
    //public modes: {[mode in InteractionMode]?: string} = {[InteractionMode.SELECT]: "s", [InteractionMode.ROTATE]: "r", [InteractionMode.TRANSLATE]: "t"};
    public modes: {[mode in InteractionMode]?: {type: typeof IInteractionMode, shortcut: string}} = 
    {
      [InteractionMode.SELECT]: {type: EditSelection, shortcut: "s"}, 
      [InteractionMode.ROTATE]: {type: EditRotation, shortcut: "r"},
      [InteractionMode.TRANSLATE]: {type: EditTranslation, shortcut: "t"}
    };
    
    // public setInteractionMode(mode: InteractionMode): IInteractionMode {
    //   let interactionMode: IInteractionMode;
    //   switch (mode) {
    //     case InteractionMode.SELECT:
    //       interactionMode = new EditSelection();
    //       break;
    //     case InteractionMode.ROTATE:
    //       interactionMode = new EditRotation();
    //     case InteractionMode.TRANSLATE:
    //       interactionMode = new EditTranslation();
    //       break;
    //     default:
    //       interactionMode = new IdleMode();
    //       break;
    //   }

    //   return interactionMode;
    // }

  }
} 