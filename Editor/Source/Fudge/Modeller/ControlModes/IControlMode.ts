namespace Fudge {
  export interface IControlMode {
    type: CONTROL_MODE;
    formerMode: IInteractionMode;
    /* 
      stores the relationship between the control mode and the interaction mode including keyboard shortcuts
      retrieves the class belonging to the enum value, so that the according object can be created
    */ 
    modes: {[mode in INTERACTION_MODE]?: {type: typeof InteractionMode, shortcut: string}};
  }
}