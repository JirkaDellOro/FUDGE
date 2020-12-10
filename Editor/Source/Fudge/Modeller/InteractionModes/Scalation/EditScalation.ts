namespace Fudge {
  export class EditScalation extends AbstractScalation {
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.initialize();
    }

  }
}