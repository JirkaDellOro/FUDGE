namespace Fudge {
  export class ObjectTranslation extends AbstractTranslation {
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      super(viewport, editableNode);
      this.selection = Array.from(Array((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices.length).keys());
    }
  }
}