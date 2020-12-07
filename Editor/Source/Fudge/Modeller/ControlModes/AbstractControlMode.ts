namespace Fudge {
  export abstract class AbstractControlMode {
    public type: ControlMode;
    public formerMode: IInteractionMode;
    public modes: {[mode in InteractionMode]?: {type: typeof IInteractionMode, shortcut: string}};
  }
}