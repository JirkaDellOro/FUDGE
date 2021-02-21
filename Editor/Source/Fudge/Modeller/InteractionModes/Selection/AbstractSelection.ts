/// <reference path="../InteractionMode.ts" />
namespace Fudge {
  export abstract class AbstractSelection extends InteractionMode {
    public readonly type: INTERACTION_MODE = INTERACTION_MODE.SELECT;
    public viewport: ƒ.Viewport;
    public editableNode: ƒ.Node;

    cleanup(): void {
      //
    }
  }
}