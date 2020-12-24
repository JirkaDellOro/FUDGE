namespace Fudge {
  export class EditScalation extends AbstractScalation {
    private vertexSelected: boolean = false;
    constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number>) {
      super(viewport, editableNode, selection);
      this.selector = new Selector(this.editableNode, this.viewport.camera.pivot.translation);
      // this.initialize();
    }

    onmousedown (_event: ƒ.EventPointer): string {
      if (this.selector.selectVertices(this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY)), this.selection)) {
        this.vertexSelected = true;
        this.axesSelectionHandler.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
        return null;
      }

      return super.onmousedown(_event);
    }

    onmove(_event: ƒ.EventPointer): void {
      if (this.vertexSelected)
        return;
      
      super.onmove(_event);
    }

    onmouseup(_event: ƒ.EventPointer): void {
      if (this.vertexSelected) {
        this.vertexSelected = false;
        return;
      }

      super.onmouseup(_event);
    }

  }
}