/// <reference path="../InteractionMode.ts" />
namespace Fudge {
  export abstract class AbstractSelection extends InteractionMode {
    public readonly type: InteractionModes = InteractionModes.SELECT;
    public viewport: ƒ.Viewport;
    public editableNode: ƒ.Node;

    cleanup(): void {
      //
    }
  }
}