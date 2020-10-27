namespace Fudge {
  export abstract class AbstractControlMode {
    public static readonly subclasses: typeof AbstractControlMode[] = [];
    public modes: {[mode in InteractionMode]?: {type: typeof IInteractionMode, shortcut: string}};
    protected static registerSubclass(_subClass: typeof AbstractControlMode): number { return AbstractControlMode.subclasses.push(_subClass) - 1; }
    
    
    // abstract setInteractionMode(mode: InteractionMode): IInteractionMode;
  }
}