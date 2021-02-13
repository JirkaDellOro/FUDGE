/// <reference path="../InteractionMode.ts" />
namespace Fudge {
  export abstract class AbstractSelection extends InteractionMode {
    public readonly type: InteractionModes = InteractionModes.SELECT;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    // abstract onmousedown(_event: ƒ.EventPointer): void;
    // abstract onmouseup(_event: ƒ.EventPointer): string;
    // abstract onmove(_event: ƒ.EventPointer): void;


    cleanup(): void {
      //
    }
  }
}