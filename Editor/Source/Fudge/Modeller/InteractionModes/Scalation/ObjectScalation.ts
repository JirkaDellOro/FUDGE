namespace Fudge {
  export class ObjectScalation extends AbstractScalation {
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.selection = Array.from(Array((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices.length).keys());
      this.selector = new Selector(this.editableNode, this.viewport.camera.pivot.translation);
    }
  }
}