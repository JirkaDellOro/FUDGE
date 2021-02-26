namespace Fudge {
  export interface IControlMode {
    type: CONTROL_MODE;
    formerMode: IInteractionMode;
    modes: {[mode in INTERACTION_MODE]?: {type: typeof InteractionMode, shortcut: string}};
  }
}