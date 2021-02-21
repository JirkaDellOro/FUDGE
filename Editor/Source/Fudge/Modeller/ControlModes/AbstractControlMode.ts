namespace Fudge {
  export abstract class AbstractControlMode {
    public type: CONTROL_MODE;
    public formerMode: IInteractionMode;
    public modes: {[mode in INTERACTION_MODE]?: {type: typeof InteractionMode, shortcut: string}};
  }
}