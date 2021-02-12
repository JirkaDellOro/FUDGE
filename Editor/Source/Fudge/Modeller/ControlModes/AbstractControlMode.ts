namespace Fudge {
  export abstract class AbstractControlMode {
    public type: ControlMode;
    public formerMode: IInteractionMode;
    public modes: {[mode in InteractionModes]?: {type: typeof InteractionMode, shortcut: string}};
  }
}