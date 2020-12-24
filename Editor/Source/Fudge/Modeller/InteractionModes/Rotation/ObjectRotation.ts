namespace Fudge {
  import ƒ = FudgeCore;
  export class ObjectRotation extends AbstractRotation {
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.selection = Array.from(Array((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices.length).keys());
    }
  }
}