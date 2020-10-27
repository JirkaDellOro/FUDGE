namespace Fudge {
  export abstract class AbstractTranslation extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.TRANSLATE;
    viewport: ƒ.Viewport;
    selection: Object;
    editableNode: ƒ.Node;
    protected dragging: boolean = false;
    protected distance: number;
    protected widget: ƒ.Node;


    // constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node) {
    //   super(viewport, editableNode);
    // }

    abstract onmousedown(_event: ƒ.EventPointer): void;
    abstract onmouseup(_event: ƒ.EventPointer): void;
    // abstract onclick(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;

    cleanup(): void {
      this.viewport.getGraph().removeChild(this.widget);
    }

  }
}