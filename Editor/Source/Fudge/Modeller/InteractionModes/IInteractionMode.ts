namespace Fudge {
  import ƒ = FudgeCore;

  export abstract class IInteractionMode {
    type: InteractionMode;
    selection: Object;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    constructor (viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      this.viewport = viewport;
      this.editableNode = editableNode;
      this.initialize();
    }

    abstract onmousedown(_event: ƒ.EventPointer): void;
    abstract onmouseup(_event: ƒ.EventPointer): void;
    // onclick(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;
    abstract initialize(): void;
    abstract cleanup(): void;

    protected getPosRenderFrom(_event: ƒ.EventPointer): ƒ.Vector2 {
      let mousePos: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      return this.viewport.pointClientToRender(new ƒ.Vector2(mousePos.x, this.viewport.getClientRectangle().height - mousePos.y));
    }

  }
}